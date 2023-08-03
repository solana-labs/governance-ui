/* eslint-disable @typescript-eslint/no-unused-vars */
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
  DualFinanceLiquidityStakingOptionForm,
  DualFinanceWithdrawForm,
  UiInstruction,
  DualFinanceInitStrikeForm,
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
import { BN, web3, utils } from '@coral-xyz/anchor'
import { Token } from '@solana/spl-token'

interface StakingOptionArgs {
  connection: ConnectionContext
  form: DualFinanceStakingOptionForm
  setFormErrors: any
  schema: any
  wallet: WalletAdapter | undefined
}

interface StakingOptionLsoArgs {
  connection: ConnectionContext
  form: DualFinanceLiquidityStakingOptionForm
  setFormErrors: any
  schema: any
  wallet: WalletAdapter | undefined
}

interface InitStrikeArgs {
  connection: ConnectionContext
  form: DualFinanceInitStrikeForm
  setFormErrors: any
  schema: any
  wallet: WalletAdapter | undefined
}

function getStakingOptionsApi(connection: ConnectionContext) {
  return new StakingOptions(connection.endpoint, 'confirmed')
}

function toBeBytes(x: number) {
  const y = Math.floor(x / 2 ** 32)
  return Uint8Array.from(
    [y, y << 8, y << 16, y << 24, x, x << 8, x << 16, x << 24].map(
      (z) => z >>> 24
    )
  )
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
        chunkBy: 1,
      }
    }

    const configInstruction = await so.createConfigInstruction(
      form.optionExpirationUnixSeconds,
      form.optionExpirationUnixSeconds,
      new BN(form.numTokens),
      new BN(form.lotSize),
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

    const initStrikeInstruction = await so.createInitStrikeReversibleInstruction(
      new BN(form.strike),
      form.soName,
      //authority sol wallet
      form.payer.extensions.transferAddress!,
      baseMint
    )
    additionalSerializedInstructions.push(
      serializeInstructionToBase64(initStrikeInstruction)
    )

    const nameInstruction = await so.createNameTokenInstruction(
      new BN(form.strike),
      form.soName,
      form.payer.extensions.transferAddress!,
      baseMint
    )

    additionalSerializedInstructions.push(
      serializeInstructionToBase64(nameInstruction)
    )

    const soMint = await so.soMint(form.strike, form.soName, baseMint)
    const userSoAccount = await findAssociatedTokenAddress(
      new PublicKey(form.userPk),
      soMint
    )

    if (!(await connection.current.getAccountInfo(userSoAccount))) {
      const [ataIx] = await createAssociatedTokenAccount(
        form.payer.extensions.transferAddress!,
        new PublicKey(form.userPk),
        soMint
      )
      additionalSerializedInstructions.push(serializeInstructionToBase64(ataIx))
    }

    const issueInstruction = await so.createIssueInstruction(
      new BN(form.numTokens),
      new BN(form.strike),
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

    return {
      serializedInstruction,
      isValid: true,
      prerequisiteInstructions: prerequisiteInstructions,
      prerequisiteInstructionsSigners: [helperTokenAccount, null],
      governance: form.baseTreasury?.governance,
      additionalSerializedInstructions,
      chunkBy: 2,
    }
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid: false,
    governance: form.baseTreasury?.governance,
    additionalSerializedInstructions,
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
    const baseMint = form.baseTreasury.extensions.mint!.publicKey!
    const state = await so.getState(form.soName, baseMint)

    let strike = 1
    for (const candidate of state.strikes as any) {
      // Check for the strike in the list of strikes
      const candidateStrike = Number(candidate)
      if (
        (await so.soMint(candidateStrike, form.soName, baseMint)).toBase58() ==
        form.optionAccount?.extensions.mint?.publicKey.toBase58()
      ) {
        strike = candidateStrike
      }
    }

    const stateObj = await so.getState(form.soName, baseMint)
    const quoteMint: PublicKey = stateObj.quoteMint as PublicKey

    const feeAccount = await StakingOptions.getFeeAccount(quoteMint)

    if ((await connection.current.getAccountInfo(feeAccount)) === null) {
      const [ataIx] = await createAssociatedTokenAccount(
        wallet.publicKey,
        new PublicKey('7Z36Efbt7a4nLiV7s5bY7J2e4TJ6V9JEKGccsy2od2bE'),
        quoteMint
      )
      additionalSerializedInstructions.push(serializeInstructionToBase64(ataIx))
    }

    const prerequisiteInstructions: TransactionInstruction[] = []
    const space = 165
    const rent = await connection.current.getMinimumBalanceForRentExemption(
      space,
      'processed'
    )
    const quoteHelperTokenAccount = new Keypair()
    // run as prerequsite instructions payer is connected wallet
    prerequisiteInstructions.push(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: quoteHelperTokenAccount.publicKey,
        lamports: rent,
        space: space,
        programId: TOKEN_PROGRAM_ID,
      }),
      initializeAccount({
        account: quoteHelperTokenAccount.publicKey,
        mint: quoteMint,
        owner: form.baseTreasury.isSol
          ? form.baseTreasury.governance.pubkey
          : form.baseTreasury.extensions.token?.account.owner,
      })
    )

    const baseAmountAtoms = form.numTokens * Number(state.lotSize)
    const quoteAmountAtoms = form.numTokens * strike

    additionalSerializedInstructions.push(
      serializeInstructionToBase64(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          form.quoteTreasury!.extensions.transferAddress!,
          quoteHelperTokenAccount.publicKey,
          form.quoteTreasury!.extensions!.token!.account.owner,
          [],
          quoteAmountAtoms
        )
      )
    )

    // TODO: Consider using reversible
    const exerciseInstruction = await so.createExerciseInstruction(
      new BN(form.numTokens),
      new BN(strike),
      form.soName,
      form.baseTreasury.extensions.token!.account.owner!,
      form.optionAccount!.pubkey!,
      quoteHelperTokenAccount.publicKey,
      form.baseTreasury!.extensions.transferAddress!
    )
    additionalSerializedInstructions.push(
      serializeInstructionToBase64(exerciseInstruction)
    )

    additionalSerializedInstructions.push(
      serializeInstructionToBase64(
        closeAccount({
          source: quoteHelperTokenAccount.publicKey,
          destination: wallet.publicKey,
          owner: form.baseTreasury.isSol
            ? form.baseTreasury.governance.pubkey
            : form.baseTreasury.extensions.token?.account.owner,
        })
      )
    )

    return {
      serializedInstruction,
      isValid: true,
      prerequisiteInstructions: prerequisiteInstructions,
      prerequisiteInstructionsSigners: [quoteHelperTokenAccount],
      governance: form.baseTreasury?.governance,
      additionalSerializedInstructions,
      chunkBy: 1,
    }
  }

  return {
    serializedInstruction,
    isValid: false,
    governance: form.baseTreasury?.governance,
    additionalSerializedInstructions: [],
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
  const prerequisiteInstructions: TransactionInstruction[] = []
  let helperTokenAccount: Keypair | null = null
  if (isValid && form.soName && form.baseTreasury && wallet?.publicKey) {
    const so = getStakingOptionsApi(connection)
    const authority = form.baseTreasury.isSol
      ? form.baseTreasury.extensions.transferAddress
      : form.baseTreasury.extensions.token!.account.owner!
    let destination = form.baseTreasury.pubkey
    if (form.baseTreasury.isSol) {
      const baseMint = form.mintPk
      const space = 165
      const rent = await connection.current.getMinimumBalanceForRentExemption(
        space,
        'processed'
      )
      //Creating checking account on the fly with given mint
      //made to be more safe - instructions don't have access to main treasury
      helperTokenAccount = new Keypair()
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
          mint: new PublicKey(baseMint!),
          owner: form.baseTreasury.governance.pubkey,
        })
      )
      destination = helperTokenAccount.publicKey
    }

    const withdrawInstruction = form.baseTreasury.isSol
      ? await so.createWithdrawInstructionWithMint(
          form.soName,
          authority!,
          destination,
          new PublicKey(form.mintPk!)
        )
      : await so.createWithdrawInstruction(form.soName, authority!, destination)

    additionalSerializedInstructions.push(
      serializeInstructionToBase64(withdrawInstruction)
    )

    return {
      serializedInstruction,
      prerequisiteInstructions: prerequisiteInstructions,
      prerequisiteInstructionsSigners: helperTokenAccount
        ? [helperTokenAccount]
        : [],
      isValid: true,
      governance: form.baseTreasury?.governance,
      additionalSerializedInstructions,
      chunkBy: 2,
    }
  }

  return {
    serializedInstruction,
    isValid: false,
    governance: form.baseTreasury?.governance,
    additionalSerializedInstructions: [],
  }
}

export async function getConfigLsoInstruction({
  connection,
  wallet,
  form,
  schema,
  setFormErrors,
}: StakingOptionLsoArgs): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  const serializedInstruction = ''
  const additionalSerializedInstructions: string[] = []
  const prerequisiteInstructions: TransactionInstruction[] = []
  if (
    isValid &&
    form.baseTreasury &&
    form.quoteTreasury &&
    form.payer &&
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
        chunkBy: 1,
      }
    }

    const soName = `LSO-${form.optionExpirationUnixSeconds}`
    const [
      issueAuthority,
      _issueAuthorityBump,
    ] = await web3.PublicKey.findProgramAddress(
      [
        Buffer.from(utils.bytes.utf8.encode('LSO')),
        toBeBytes(form.optionExpirationUnixSeconds),
      ],
      new PublicKey('DiPbvUUJkDhV9jFtQsDFnMEMRJyjW5iS6NMwoySiW8ki')
    )

    const configInstruction = await so.createConfigInstruction(
      form.optionExpirationUnixSeconds,
      form.optionExpirationUnixSeconds,
      new BN(form.numTokens),
      new BN(form.lotSize),
      soName,
      //use sol wallet as authority
      form.payer.extensions.transferAddress!,
      baseMint,
      //use helper account as base account
      helperTokenAccount.publicKey,
      quoteMint,
      form.quoteTreasury.pubkey,
      form.payer.extensions.transferAddress!,
      issueAuthority
    )

    additionalSerializedInstructions.push(
      serializeInstructionToBase64(configInstruction)
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

    return {
      serializedInstruction,
      isValid: true,
      prerequisiteInstructions: prerequisiteInstructions,
      prerequisiteInstructionsSigners: [helperTokenAccount],
      governance: form.baseTreasury?.governance,
      additionalSerializedInstructions,
      chunkBy: 1,
    }
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid: false,
    governance: form.baseTreasury?.governance,
    additionalSerializedInstructions,
    chunkBy: 1,
  }
  return obj
}

export async function getInitStrikeInstruction({
  connection,
  wallet,
  form,
  schema,
  setFormErrors,
}: InitStrikeArgs): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  const serializedInstruction = ''
  const additionalSerializedInstructions: string[] = []
  const prerequisiteInstructions: TransactionInstruction[] = []
  if (
    isValid &&
    form.payer &&
    form.soName &&
    form.strikes &&
    form.baseTreasury &&
    wallet?.publicKey
  ) {
    const so = getStakingOptionsApi(connection)

    const baseMint = form.baseTreasury.extensions.mint?.publicKey
    if (!baseMint) {
      return {
        serializedInstruction,
        isValid: false,
        governance: form.baseTreasury?.governance,
        additionalSerializedInstructions: [],
      }
    }

    for (const strike of form.strikes.split(',')) {
      const initStrikeInstruction = await so.createInitStrikeInstruction(
        new BN(Number(strike)),
        form.soName,
        //authority sol wallet
        form.payer.extensions.transferAddress!,
        baseMint
      )
      additionalSerializedInstructions.push(
        serializeInstructionToBase64(initStrikeInstruction)
      )

      const nameInstruction = await so.createNameTokenInstruction(
        new BN(Number(strike)),
        form.soName,
        form.payer.extensions.transferAddress!,
        baseMint
      )

      additionalSerializedInstructions.push(
        serializeInstructionToBase64(nameInstruction)
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

  const obj: UiInstruction = {
    serializedInstruction,
    isValid: false,
    governance: form.payer?.governance,
    additionalSerializedInstructions,
    chunkBy: 1,
  }
  return obj
}
