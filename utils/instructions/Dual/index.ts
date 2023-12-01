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

import {
  DUAL_DAO_WALLET_PK,
  StakingOptions,
} from '@dual-finance/staking-options'
import { ConnectionContext } from '@utils/connection'
import { validateInstruction } from '@utils/instructionTools'
import {
  DualFinanceExerciseForm,
  DualFinanceStakingOptionForm,
  DualFinanceLiquidityStakingOptionForm,
  DualFinanceWithdrawForm,
  UiInstruction,
  DualFinanceInitStrikeForm,
  DualFinanceGsoForm,
  DualFinanceGsoWithdrawForm,
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
import { GSO } from '@dual-finance/gso'

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

function getGsoApi(connection: ConnectionContext) {
  return new GSO(connection.endpoint, 'confirmed')
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
          ? form.baseTreasury.extensions.transferAddress
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

interface StakingOptionGsoArgs {
  connection: ConnectionContext
  form: DualFinanceGsoForm
  setFormErrors: any
  schema: any
  wallet: WalletAdapter | undefined
}

export async function getConfigGsoInstruction({
  connection,
  wallet,
  form,
  schema,
  setFormErrors,
}: StakingOptionGsoArgs): Promise<UiInstruction> {
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
    wallet?.publicKey
  ) {
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
          //owner is sol wallet or governance same as baseTreasury
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

    // Should not happen.
    if (!baseMint || !quoteMint) {
      return {
        serializedInstruction,
        isValid: false,
        governance: form.baseTreasury?.governance,
        additionalSerializedInstructions: [],
        chunkBy: 1,
      }
    }

    const gso = getGsoApi(connection)
    const baseAccount = helperTokenAccount.publicKey
    const quoteAccount = form.quoteTreasury.pubkey
    const optionsPerMillion = Math.floor(form.lockupRatio * 1_000_000)
    const strikeAtomsPerLot = form.strike;
    // Set all GSOs to have the same expiration and lockup period. This means
    // that users will be able to unstake at the same time as option expiration.
    const lockupPeriodEnd = form.optionExpirationUnixSeconds
    const configInstruction = await gso.createConfigInstruction(
      optionsPerMillion,
      lockupPeriodEnd,
      form.optionExpirationUnixSeconds,
      form.subscriptionPeriodEnd,
      new BN(form.numTokens),
      form.soName,
      strikeAtomsPerLot,
      form.payer.extensions.transferAddress!,
      baseMint,
      quoteMint,
      baseAccount,
      quoteAccount,
      form.lotSize
    )

    additionalSerializedInstructions.push(
      serializeInstructionToBase64(configInstruction)
    )

    const nameInstruction = await gso.createNameTokensInstruction(
      form.soName,
      strikeAtomsPerLot,
      form.payer.extensions.transferAddress!,
      baseMint
    )

    additionalSerializedInstructions.push(
      serializeInstructionToBase64(nameInstruction)
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
      // chunkBy 1 because the config instruction uses a lot of accounts, so
      // isolate it.
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

    // Possibly init the base token account that is receiving tokens from exercise.
    const walletBaseAta = await findAssociatedTokenAddress(wallet.publicKey, baseMint);
    if ((await connection.current.getAccountInfo(walletBaseAta)) === null) {
      const [ataIx] = await createAssociatedTokenAccount(
        wallet.publicKey,
        wallet.publicKey,
        baseMint
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
          ? form.baseTreasury.extensions.transferAddress
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
            ? form.baseTreasury.extensions.transferAddress
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
  // First is for base token, second is for quote token.
  let helperTokenAccount: Keypair | null = null
  let helperTokenAccount2: Keypair | null = null
  if (
    isValid &&
    form.soName &&
    form.baseTreasury &&
    wallet?.publicKey &&
    form.mintPk
  ) {
    const so = getStakingOptionsApi(connection)
    const authority = form.baseTreasury.isSol
      ? form.baseTreasury.extensions.transferAddress
      : form.baseTreasury.extensions.token!.account.owner!
    let baseDestination = form.baseTreasury.pubkey
    let quoteDestination = (
      await so.getState(form.soName, new PublicKey(form.mintPk))
    ).quoteAccount as PublicKey

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
          owner: authority,
        })
      )
      baseDestination = helperTokenAccount.publicKey

      const quoteMint = (
        await so.getState(form.soName, new PublicKey(form.mintPk))
      ).quoteMint
      helperTokenAccount2 = new Keypair()
      //run as prerequsite instructions payer is connected wallet
      prerequisiteInstructions.push(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: helperTokenAccount2.publicKey,
          lamports: rent,
          space: space,
          programId: TOKEN_PROGRAM_ID,
        }),
        //initialized account with same mint as quote
        initializeAccount({
          account: helperTokenAccount2.publicKey,
          mint: new PublicKey(quoteMint!),
          owner: authority,
        })
      )
      quoteDestination = helperTokenAccount2.publicKey

      // Initialize the fee account so the tx succeeds. This happens when there
      // is a base token that DUAL DAO has never received before.
      const feeAccount = await StakingOptions.getFeeAccount(
        new PublicKey(quoteMint!)
      )
      if (!(await connection.current.getAccountInfo(feeAccount))) {
        const [ataIx] = await createAssociatedTokenAccount(
          wallet.publicKey,
          DUAL_DAO_WALLET_PK,
          new PublicKey(quoteMint!)
        )
        additionalSerializedInstructions.push(
          serializeInstructionToBase64(ataIx)
        )
      }
    }

    const withdrawInstruction = form.baseTreasury.isSol
      ? await so.createWithdrawInstructionWithMint(
          form.soName,
          authority!,
          baseDestination,
          new PublicKey(form.mintPk!),
          quoteDestination
        )
      : await so.createWithdrawInstruction(
          form.soName,
          authority!,
          baseDestination,
          quoteDestination
        )

    additionalSerializedInstructions.push(
      serializeInstructionToBase64(withdrawInstruction)
    )

    return {
      serializedInstruction,
      prerequisiteInstructions: prerequisiteInstructions,
      prerequisiteInstructionsSigners: helperTokenAccount
        ? [null, helperTokenAccount, null, helperTokenAccount2]
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

interface GsoWithdrawArgs {
  connection: ConnectionContext
  form: DualFinanceGsoWithdrawForm
  setFormErrors: any
  schema: any
  wallet: WalletAdapter | undefined
}

export async function getGsoWithdrawInstruction({
  connection,
  wallet,
  form,
  schema,
  setFormErrors,
}: GsoWithdrawArgs): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  const serializedInstruction = ''
  const additionalSerializedInstructions: string[] = []
  if (isValid && form.soName && form.baseTreasury && !!form.baseTreasury.isSol && wallet?.publicKey) {
    const gso = getGsoApi(connection)
    const authority = form.baseTreasury.extensions.token!.account.owner!
    const baseMint = form.baseTreasury.extensions.mint?.publicKey
    const destination = form.baseTreasury.pubkey

    // Should always exist because of validations.
    if (baseMint) {
      const withdrawInstruction = await gso.createWithdrawInstruction(
        form.soName,
        baseMint,
        authority!,
        destination
      )

      additionalSerializedInstructions.push(
        serializeInstructionToBase64(withdrawInstruction)
      )
    }

    // Does not use a helper token account. If the DAO requires that, they need
    // to just set the baseTreasury to be an empty token account.
    return {
      serializedInstruction,
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
          ? form.baseTreasury.extensions.transferAddress
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
