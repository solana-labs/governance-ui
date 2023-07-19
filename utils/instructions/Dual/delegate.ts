import {
  getGovernanceProgramVersion,
  getTokenOwnerRecord,
  getTokenOwnerRecordAddress,
  serializeInstructionToBase64,
  withCreateTokenOwnerRecord,
  withSetGovernanceDelegate,
  withWithdrawGoverningTokens,
} from '@solana/spl-governance'
import { ConnectionContext } from '@utils/connection'
import { validateInstruction } from '@utils/instructionTools'
import {
  DualFinanceVoteDepositForm,
  DualFinanceDelegateForm,
  UiInstruction,
  DualFinanceDelegateWithdrawForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import {
  Keypair,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'
import { AnchorProvider } from '@coral-xyz/anchor'
import EmptyWallet from '@utils/Mango/listingTools'
import { DEFAULT_VSR_ID, VsrClient } from 'VoteStakeRegistry/sdk/client'
import {
  getVoterPDA,
  getVoterWeightPDA,
  getRegistrarPDA,
} from 'VoteStakeRegistry/sdk/accounts'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  Token,
} from '@solana/spl-token'
import { getMintCfgIdx, tryGetVoter } from 'VoteStakeRegistry/sdk/api'
import { getPeriod } from 'VoteStakeRegistry/tools/deposits'

const govProgramId = new PublicKey(
  'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'
)
interface DelegateArgs {
  connection: ConnectionContext
  form: DualFinanceDelegateForm
  setFormErrors: any
  schema: any
  wallet: WalletAdapter | undefined
}

interface DelegateWithdrawArgs {
  connection: ConnectionContext
  form: DualFinanceDelegateWithdrawForm
  setFormErrors: any
  schema: any
  wallet: WalletAdapter | undefined
}

interface VoteDepositArgs {
  connection: ConnectionContext
  form: DualFinanceVoteDepositForm
  setFormErrors: any
  schema: any
  wallet: WalletAdapter | undefined
}

export async function getDelegateInstruction({
  connection,
  wallet,
  form,
  schema,
  setFormErrors,
}: DelegateArgs): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  const serializedInstruction = ''
  const additionalSerializedInstructions: string[] = []
  const prerequisiteInstructions: TransactionInstruction[] = []
  const instructions: TransactionInstruction[] = []
  if (
    isValid &&
    form.delegateAccount &&
    wallet?.publicKey &&
    form.realm &&
    form.delegateToken &&
    form.delegateToken.extensions.mint?.publicKey
  ) {
    const programVersion = await getGovernanceProgramVersion(
      connection.current,
      form.delegateToken?.governance.owner // governance program public key
    )

    await withSetGovernanceDelegate(
      instructions,
      form.delegateToken.governance.owner, // publicKey of program/programId
      programVersion, // program version of realm
      new PublicKey(form.realm), // realm public key
      form.delegateToken.extensions.mint.publicKey, // mint of governance token
      form.delegateToken.governance.nativeTreasuryAddress, // governingTokenOwner (walletId) publicKey of tokenOwnerRecord of this wallet
      form.delegateToken.governance.nativeTreasuryAddress, // governanceAuthority: publicKey of connected wallet
      new PublicKey(form.delegateAccount) // public key of wallet who to delegated vote to
    )
    for (const ix of instructions) {
      additionalSerializedInstructions.push(serializeInstructionToBase64(ix))
    }
  }
  return {
    serializedInstruction,
    isValid: true,
    prerequisiteInstructions: prerequisiteInstructions,
    governance: form.delegateToken?.governance,
    additionalSerializedInstructions,
    chunkBy: 1,
  }
}

export async function getVoteDepositInstruction({
  connection,
  wallet,
  form,
  schema,
  setFormErrors,
}: VoteDepositArgs): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  const serializedInstruction = ''
  const additionalSerializedInstructions: string[] = []
  const prerequisiteInstructions: TransactionInstruction[] = []
  const instructions: TransactionInstruction[] = []
  if (
    isValid &&
    form.numTokens &&
    wallet?.publicKey &&
    form.realm &&
    form.delegateToken &&
    form.delegateToken.extensions.mint?.publicKey
  ) {
    const realmPk = new PublicKey(form.realm)
    const communityMintPk = form.delegateToken.extensions.mint?.publicKey
    const daoWallet = form.delegateToken.governance.nativeTreasuryAddress
    const amount = getMintNaturalAmountFromDecimalAsBN(
      form.numTokens,
      form.delegateToken.extensions.mint.account.decimals
    )

    const programVersion = await getGovernanceProgramVersion(
      connection.current,
      govProgramId // governance program public key
    )
    const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
      govProgramId,
      realmPk,
      form.delegateToken.extensions.mint.publicKey,
      daoWallet
    )
    let isExisintgTokenOwnerRecord = false
    try {
      await getTokenOwnerRecord(connection.current, tokenOwnerRecordAddress)
      isExisintgTokenOwnerRecord = true
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const lockUpPeriodInDays = 0
    const lockupKind = 'none'
    const options = AnchorProvider.defaultOptions()
    const provider = new AnchorProvider(
      connection.current,
      new EmptyWallet(Keypair.generate()),
      options
    )
    const vsrClient = await VsrClient.connect(provider, DEFAULT_VSR_ID)
    const systemProgram = SystemProgram.programId
    const clientProgramId = vsrClient!.program.programId

    const { registrar } = await getRegistrarPDA(
      realmPk,
      communityMintPk,
      clientProgramId
    )
    const { voter, voterBump } = await getVoterPDA(
      registrar,
      daoWallet,
      clientProgramId
    )
    const { voterWeightPk, voterWeightBump } = await getVoterWeightPDA(
      registrar,
      daoWallet,
      clientProgramId
    )
    const existingVoter = await tryGetVoter(voter, vsrClient)

    const voterATAPk = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      communityMintPk,
      voter,
      true
    )

    //spl governance tokenownerrecord pubkey
    if (!isExisintgTokenOwnerRecord) {
      await withCreateTokenOwnerRecord(
        prerequisiteInstructions,
        govProgramId,
        programVersion,
        realmPk,
        daoWallet,
        communityMintPk,
        wallet.publicKey
      )
    }

    if (!existingVoter) {
      const createVoterIx = await vsrClient?.program.methods
        .createVoter(voterBump, voterWeightBump)
        .accounts({
          registrar: registrar,
          voter: voter,
          voterAuthority: daoWallet,
          voterWeightRecord: voterWeightPk,
          payer: wallet.publicKey,
          systemProgram: systemProgram,
          rent: SYSVAR_RENT_PUBKEY,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        })
        .instruction()
      prerequisiteInstructions.push(createVoterIx)
    }
    const mintCfgIdx = await getMintCfgIdx(
      registrar,
      communityMintPk,
      vsrClient
    )

    //none type deposits are used only to store tokens that will be withdrawable immediately so there is no need to create new every time and there should be one per mint
    //for other kinds of deposits we always want to create new deposit
    const indexOfNoneTypeDeposit =
      lockupKind === 'none'
        ? existingVoter?.deposits.findIndex(
            (x) =>
              x.isUsed &&
              typeof x.lockup.kind[lockupKind] !== 'undefined' &&
              x.votingMintConfigIdx === mintCfgIdx
          )
        : -1

    const createNewDeposit =
      typeof indexOfNoneTypeDeposit === 'undefined' ||
      indexOfNoneTypeDeposit === -1

    const firstFreeIdx =
      existingVoter?.deposits?.findIndex((x) => !x.isUsed) || 0

    if (firstFreeIdx === -1 && createNewDeposit) {
      throw 'User has to much active deposits'
    }

    if (createNewDeposit) {
      //in case we do monthly close up we pass months not days.
      const period = getPeriod(lockUpPeriodInDays, lockupKind)
      const createDepositEntryInstruction = await vsrClient?.program.methods
        .createDepositEntry(
          firstFreeIdx,
          { [lockupKind]: {} },
          //lockup starts now
          null,
          period,
          false
        )
        .accounts({
          registrar: registrar,
          voter: voter,
          payer: daoWallet,
          voterAuthority: daoWallet,
          depositMint: communityMintPk,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: systemProgram,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          vault: voterATAPk,
        })
        .instruction()
      instructions.push(createDepositEntryInstruction)
    }

    const depositIdx = !createNewDeposit
      ? indexOfNoneTypeDeposit!
      : firstFreeIdx

    const depositInstruction = await vsrClient?.program.methods
      .deposit(depositIdx, amount)
      .accounts({
        registrar: registrar,
        voter: voter,
        vault: voterATAPk,
        depositToken: form.delegateToken.pubkey,
        depositAuthority: daoWallet,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction()
    instructions.push(depositInstruction)

    for (const ix of instructions) {
      additionalSerializedInstructions.push(serializeInstructionToBase64(ix))
    }
  }

  return {
    serializedInstruction,
    isValid: true,
    prerequisiteInstructions: prerequisiteInstructions,
    governance: form.delegateToken?.governance,
    additionalSerializedInstructions,
    chunkBy: 1,
  }
}

// TODO: withdraw from vsr
// TODO: Remove need for delegateToken
// TODO: use a prequiste if community mint ata was burnt
// TODO: Relinquish vote or finalize if delegate has active vote
export async function getDelegateWithdrawInstruction({
  connection,
  wallet,
  form,
  schema,
  setFormErrors,
}: DelegateWithdrawArgs): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  const serializedInstruction = ''
  const additionalSerializedInstructions: string[] = []
  const prerequisiteInstructions: TransactionInstruction[] = []
  const instructions: TransactionInstruction[] = []
  if (
    isValid &&
    wallet?.publicKey &&
    form.realm &&
    form.delegateToken &&
    form.delegateToken.extensions.mint?.publicKey
  ) {
    const programVersion = await getGovernanceProgramVersion(
      connection.current,
      govProgramId // governance program public key
    )

    await withSetGovernanceDelegate(
      instructions,
      govProgramId, // publicKey of program/programId
      programVersion, // program version of realm
      new PublicKey(form.realm), // realm public key
      form.delegateToken.extensions.mint.publicKey, // mint of governance token
      form.delegateToken.governance.nativeTreasuryAddress, // governingTokenOwner (walletId) publicKey of tokenOwnerRecord of this wallet
      form.delegateToken.governance.nativeTreasuryAddress, // governanceAuthority: publicKey of connected wallet
      // @ts-ignore
      null // remove delegate
    )

    await withWithdrawGoverningTokens(
      instructions,
      govProgramId, // publicKey of program/programId
      programVersion, // program version of realm
      new PublicKey(form.realm), // realm public key
      form.delegateToken.pubkey,
      form.delegateToken.extensions.mint.publicKey,
      form.delegateToken.governance.nativeTreasuryAddress
    )
    for (const ix of instructions) {
      additionalSerializedInstructions.push(serializeInstructionToBase64(ix))
    }
  }
  return {
    serializedInstruction,
    isValid: true,
    prerequisiteInstructions: prerequisiteInstructions,
    governance: form.delegateToken?.governance,
    additionalSerializedInstructions,
    chunkBy: 2,
  }
}
