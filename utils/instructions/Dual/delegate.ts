import { getGovernanceProgramVersion, withDepositGoverningTokens, withSetGovernanceDelegate } from '@solana/spl-governance'
import { ConnectionContext } from '@utils/connection'
import { validateInstruction } from '@utils/instructionTools'
import {
  DualFinanceVoteDepositForm,
  DualFinanceDelegateForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'

interface DelegateArgs {
  connection: ConnectionContext
  form: DualFinanceDelegateForm
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
  if (isValid
    && form.payer
    && form.delegateAccount
    && form.mintPk
    && wallet?.publicKey
    ) {
    const programVersion = await getGovernanceProgramVersion(
      connection.current,
      form.payer?.governance.owner // governance program public key
    )
    // TODO: Make this instructions
    await withSetGovernanceDelegate(
      prerequisiteInstructions,
      form.payer?.governance.owner, // publicKey of program/programId
      programVersion, // program version of realm
      form.payer.governance.account.realm, // realm public key
      new PublicKey(form.mintPk), // mint of governance token
      wallet.publicKey, // governingTokenOwner (walletId) publicKey of tokenOwnerRecord of this wallet
      wallet.publicKey, // governanceAuthority: publicKey of connected wallet
      new PublicKey(form.delegateAccount) // public key of wallet who to delegated vote to
    )
  }
    return {
      serializedInstruction,
      isValid: true,
      prerequisiteInstructions: prerequisiteInstructions,
      governance: form.payer?.governance,
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
  if (isValid
    && form.payer
    && form.numTokens
    && form.mintPk
    && wallet?.publicKey
    ) {
    const programVersion = await getGovernanceProgramVersion(
      connection.current,
      form.payer?.governance.owner // governance program public key
    )
    // TODO: Make this instructions
    await withDepositGoverningTokens(
      prerequisiteInstructions,
      form.payer?.governance.owner, // publicKey of program/programId
      programVersion, // program version of realm
      form.payer.governance.account.realm, // realm public key
      form.payer.governance.nativeTreasuryAddress,
      new PublicKey(form.mintPk), // mint of governance token
      wallet.publicKey, // governingTokenOwner (walletId) publicKey of tokenOwnerRecord of this wallet
      wallet.publicKey, // governanceAuthority: publicKey of connected wallet
      form.payer.pubkey,
      new BN(form.numTokens),
    )
  }

    return {
      serializedInstruction,
      isValid: true,
      prerequisiteInstructions: prerequisiteInstructions,
      governance: form.payer?.governance,
      additionalSerializedInstructions,
      chunkBy: 1,
    }
}

// TODO: Add withdraw delegate instructions withWithdrawGoverningTokens

