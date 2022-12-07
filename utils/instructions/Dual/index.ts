import {
  serializeInstructionToBase64,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-governance'
import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'

import { StakingOptions } from '@dual-finance/staking-options'
import { ConnectionContext } from '@utils/connection'
import { validateInstruction } from '@utils/instructionTools'
import {
  DualFinanceExerciseForm,
  DualFinanceStakingOptionForm,
  DualFinanceWithdrawForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import {
  createAssociatedTokenAccount,
  findAssociatedTokenAddress,
} from '@utils/associated'
import { tryGetTokenAccount } from '@utils/tokens'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import {
  closeAccount,
  initializeAccount,
} from '@project-serum/serum/lib/token-instructions'
import { Token } from '@solana/spl-token'

interface StakingOptionArgs {
  connection: ConnectionContext
  form: DualFinanceStakingOptionForm
  setFormErrors: any
  schema: any
  wallet: WalletAdapter | undefined
}

function getStakingOptionsApi(connection: ConnectionContext) {
  return new StakingOptions(connection.endpoint, 'confirmed')
}

export async function getConfigInstruction({
  connection,
  wallet,
  form,
  schema,
  setFormErrors,
}: StakingOptionArgs): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  const serializedInstruction = ''
  const additionalSerializedInstructions: string[] = []
  const prerequisiteInstructions: TransactionInstruction[] = []
  if (
    isValid &&
    form.soName &&
    form.baseTreasury &&
    form.quoteTreasury &&
    form.payer &&
    form.userPk &&
    wallet?.publicKey
  ) {
    const so = getStakingOptionsApi(connection)
    const baseMint = form.baseTreasury.extensions.mint?.publicKey
    const space = 165
    const rent = await connection.current.getMinimumBalanceForRentExemption(
      space,
      'processed'
    )
    //Creating checking account on the fly with same mint as base and owner
    //made to be more safe - instructions don't have access to main treasury
    const helperTokenAccount = new Keypair()
    //run as prerequsite instructions payer is connected wallet
    prerequisiteInstructions.push(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: helperTokenAccount.publicKey,
        lamports: rent,
        space: space,
        programId: TOKEN_PROGRAM_ID,
      }),
      //initialized account with same mint as base
      initializeAccount({
        account: helperTokenAccount.publicKey,
        mint: baseMint,
        owner: form.baseTreasury.isSol
          ? form.baseTreasury.governance.pubkey
          : form.baseTreasury.extensions.token?.account.owner,
      })
    )

    additionalSerializedInstructions.push(
      //transfer funds from base treasury to the helper checking account
      serializeInstructionToBase64(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          form.baseTreasury.extensions.transferAddress!,
          helperTokenAccount.publicKey,
          //owner is sol wallet or governance same as baseTokenAccount
          form.baseTreasury.extensions!.token!.account.owner,
          [],
          form.numTokens
        )
      )
    )

    const quoteTreasuryAccount = await tryGetTokenAccount(
      connection.current,
      form.quoteTreasury.pubkey
    )
    const quoteMint = quoteTreasuryAccount?.account.mint

    if (!baseMint || !quoteMint) {
      return {
        serializedInstruction,
        isValid: false,
        governance: form.baseTreasury?.governance,
        additionalSerializedInstructions: [],
        chunkSplitByDefault: true,
        chunkBy: 1,
      }
    }

    const configInstruction = await so.createConfigInstruction(
      form.optionExpirationUnixSeconds,
      form.optionExpirationUnixSeconds,
      form.numTokens,
      form.lotSize,
      form.soName,
      //use sol wallet as authority
      form.payer.extensions.transferAddress!,
      baseMint,
      //use helper account as base account
      helperTokenAccount.publicKey,
      quoteMint,
      form.quoteTreasury.pubkey
    )

    additionalSerializedInstructions.push(
      serializeInstructionToBase64(configInstruction)
    )

    const initStrikeInstruction = await so.createInitStrikeInstruction(
      form.strike,
      form.soName,
      //authority sol wallet
      form.payer.extensions.transferAddress!,
      baseMint
    )
    additionalSerializedInstructions.push(
      serializeInstructionToBase64(initStrikeInstruction)
    )

    const soMint = await so.soMint(form.strike, form.soName, baseMint)
    const userSoAccount = await findAssociatedTokenAddress(
      new PublicKey(form.userPk),
      soMint
    )

    if (!(await connection.current.getAccountInfo(userSoAccount))) {
      const [ataIx] = await createAssociatedTokenAccount(
        wallet.publicKey,
        new PublicKey(form.userPk),
        soMint
      )
      additionalSerializedInstructions.push(serializeInstructionToBase64(ataIx))
    }

    const issueInstruction = await so.createIssueInstruction(
      form.numTokens,
      form.strike,
      form.soName,
      //authority sol wallet
      form.payer.extensions.transferAddress!,
      baseMint,
      userSoAccount
    )

    additionalSerializedInstructions.push(
      serializeInstructionToBase64(issueInstruction)
    )

    //after everything we close helper account
    additionalSerializedInstructions.push(
      serializeInstructionToBase64(
        closeAccount({
          source: helperTokenAccount.publicKey,
          //sol wallet
          destination: form.payer.extensions.transferAddress,
          //owner governance or sol wallet same as baseTokenAccount
          owner: form.baseTreasury.extensions.token?.account.owner,
        })
      )
    )

    console.log(form.payer.extensions.transferAddress!.toBase58())
    return {
      serializedInstruction,
      isValid: true,
      prerequisiteInstructions: prerequisiteInstructions,
      prerequisiteInstructionsSigners: [helperTokenAccount],
      governance: form.baseTreasury?.governance,
      additionalSerializedInstructions,
      chunkSplitByDefault: true,
      chunkBy: 2,
    }
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid: false,
    governance: form.baseTreasury?.governance,
    additionalSerializedInstructions,
    chunkSplitByDefault: true,
    chunkBy: 1,
  }
  return obj
}

interface ExerciseArgs {
  connection: ConnectionContext
  form: DualFinanceExerciseForm
  setFormErrors: any
  schema: any
  wallet: WalletAdapter | undefined
}

export async function getExerciseInstruction({
  connection,
  wallet,
  form,
  schema,
  setFormErrors,
}: ExerciseArgs): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  const serializedInstruction = ''
  const additionalSerializedInstructions: string[] = []
  if (isValid && form.soName && form.baseTreasury && wallet?.publicKey) {
    const so = getStakingOptionsApi(connection)
    const baseMint = form.baseTreasury.extensions.mint?.publicKey

    // TODO: Fill this in
    return {
      serializedInstruction,
      isValid: true,
      governance: form.baseTreasury?.governance,
      additionalSerializedInstructions,
    }
  }

  return {
    serializedInstruction,
    isValid: false,
    governance: form.baseTreasury?.governance,
    additionalSerializedInstructions: [],
    chunkSplitByDefault: true,
    chunkBy: 1,
  }
}

interface WithdrawArgs {
  connection: ConnectionContext
  form: DualFinanceWithdrawForm
  setFormErrors: any
  schema: any
  wallet: WalletAdapter | undefined
}

export async function getWithdrawInstruction({
  connection,
  wallet,
  form,
  schema,
  setFormErrors,
}: WithdrawArgs): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  const serializedInstruction = ''
  const additionalSerializedInstructions: string[] = []
  if (isValid && form.soName && form.baseTreasury && wallet?.publicKey) {
    const so = getStakingOptionsApi(connection)
    const baseMint = form.baseTreasury.extensions.mint?.publicKey

    const withdrawInstruction = await so.createWithdrawInstruction(
      form.soName,
      form.baseTreasury.extensions.solAccount?.owner!,
      baseMint!,
      form.baseTreasury.pubkey
    )
    additionalSerializedInstructions.push(
      serializeInstructionToBase64(withdrawInstruction)
    )

    return {
      serializedInstruction,
      isValid: true,
      governance: form.baseTreasury?.governance,
      additionalSerializedInstructions,
    }
  }

  return {
    serializedInstruction,
    isValid: false,
    governance: form.baseTreasury?.governance,
    additionalSerializedInstructions: [],
  }
}
