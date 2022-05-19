import { serializeInstructionToBase64 } from '@solana/spl-governance'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import {
  Keypair,
  PublicKey,
  TransactionInstruction,
  Connection,
  SystemProgram,
} from '@solana/web3.js'

import type { ConnectionContext } from 'utils/connection'
import { UiInstruction } from '../../uiTypes/proposalCreationTypes'
import { validateInstruction } from '@utils/instructionTools'
import BN from 'bn.js'
import { AssetAccount } from '@utils/uiTypes/assets'

import { AnchorProvider, Wallet } from '@project-serum/anchor'

import { GoblinGold, NetworkName } from 'goblingold-sdk'
import { WSOL_MINT_PK } from '@components/instructions/tools'

import { publicKey, struct, u32, u64, u8 } from '@project-serum/borsh'
import { closeAccount } from '@project-serum/serum/lib/token-instructions'

// // https://github.com/solana-labs/solana-program-library/blob/master/token/js/client/token.js#L210
export const ACCOUNT_LAYOUT = struct([
  publicKey('mint'),
  publicKey('owner'),
  u64('amount'),
  u32('delegateOption'),
  publicKey('delegate'),
  u8('state'),
  u32('isNativeOption'),
  u64('isNative'),
  u64('delegatedAmount'),
  u32('closeAuthorityOption'),
  publicKey('closeAuthority'),
])

async function createAssociatedTokenAccountIfNotExist(
  connection: Connection,
  mintAddress: PublicKey,
  owner: PublicKey,
  prerequisiteInstructions: TransactionInstruction[]
) {
  const ataAddress = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintAddress,
    owner,
    true
  )

  const accountInfo = await connection.getAccountInfo(ataAddress)

  if (!accountInfo) {
    prerequisiteInstructions.push(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintAddress,
        ataAddress,
        owner,
        owner
      )
    )
  }

  return ataAddress
}

export async function createWrappedNativeAccount(
  connection: Connection,
  owner: PublicKey,
  amount: number,
  prerequisiteInstructions: TransactionInstruction[]
) {
  // Allocate memory for the account
  const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(
    connection
  )

  // Create a new account
  const newAccount = new Keypair()

  prerequisiteInstructions.push(
    SystemProgram.createAccount({
      fromPubkey: owner,
      newAccountPubkey: newAccount.publicKey,
      lamports: balanceNeeded,
      space: ACCOUNT_LAYOUT.span,
      programId: TOKEN_PROGRAM_ID,
    })
  )

  // Send lamports to it (these will be wrapped into native tokens by the token program)
  if (amount) {
    prerequisiteInstructions.push(
      SystemProgram.transfer({
        fromPubkey: owner,
        toPubkey: newAccount.publicKey,
        lamports: amount,
      })
    )
  }

  // Assign the new account to the native token mint.
  // the account will be initialized with a balance equal to the native token balance.
  // (i.e. amount)
  prerequisiteInstructions.push(
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      WSOL_MINT_PK,
      newAccount.publicKey,
      owner
    )
  )

  return newAccount.publicKey
}

function getGovernedAccountPk(acc: AssetAccount): PublicKey {
  return (
    acc.isSol
      ? acc.extensions.transferAddress
      : acc.extensions?.token?.account?.owner
  ) as PublicKey
}

export async function getGoblinGoldDepositInstruction({
  schema,
  form,
  amount,
  connection,
  wallet,
  setFormErrors,
}: {
  schema: any
  form: any
  amount: number
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  const governedTokenAccount = form.governedTokenAccount as AssetAccount

  const signers: Keypair[] = []

  if (
    isValid &&
    amount &&
    governedTokenAccount?.extensions.mint?.account &&
    governedTokenAccount?.governance &&
    wallet
  ) {
    const provider = new AnchorProvider(
      connection.current,
      wallet as unknown as Wallet,
      AnchorProvider.defaultOptions()
    )
    const sdk = new GoblinGold(
      NetworkName.Mainnet,
      'https://ssc-dao.genesysgo.net',
      // @ts-ignore: Wallet compatability issues
      provider
    )
    const strategyProgram = sdk.BestApy

    const vault = await sdk.getVaultById(form.goblinGoldVaultId)

    if (!vault) {
      throw new Error('Error: no vault')
    }

    strategyProgram.setToken(vault.input.symbol)

    // USDC, SOL public key
    const governedTokenPk = governedTokenAccount.extensions.mint.publicKey

    // owner public key
    const governedAccountPk = getGovernedAccountPk(governedTokenAccount)

    const inputTokenMintAddress = new PublicKey(vault.input.mintAddress)
    const lpTokenMintAddress = new PublicKey(vault.lp.mintAddress)

    if (vault.name !== 'Best APY') {
      throw new Error("Error: strategy doesn't support")
    }

    if (inputTokenMintAddress.toString() !== governedTokenPk.toString()) {
      throw new Error('Error: selected governance token is not supported')
    }

    let ataInputAddress: PublicKey

    if (governedTokenAccount.isSol) {
      // If the token account is the native SOL, should create and initialize a new account on the special native token mint. And before initializing it, should send lamports to the new account.
      ataInputAddress = await createWrappedNativeAccount(
        connection.current,
        governedAccountPk,
        amount,
        prerequisiteInstructions
      )
    } else {
      ataInputAddress = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        inputTokenMintAddress,
        governedAccountPk,
        true
      )
    }

    // In case of the treasury doesn't have the token account, create it.
    const ataLpAddress = await createAssociatedTokenAccountIfNotExist(
      connection.current,
      lpTokenMintAddress,
      governedAccountPk,
      prerequisiteInstructions
    )

    const depositIx = await strategyProgram.getDepositIx({
      userSigner: governedAccountPk,
      userInputTokenAccount: ataInputAddress,
      userLpTokenAccount: ataLpAddress,
      amount: new BN(amount),
    })

    if (governedTokenAccount.isSol) {
      prerequisiteInstructions.push(depositIx)

      const closeAccountIx = closeAccount({
        source: ataInputAddress,
        destination: governedAccountPk,
        owner: governedAccountPk,
      })

      serializedInstruction = serializeInstructionToBase64(closeAccountIx)
    } else {
      serializedInstruction = serializeInstructionToBase64(depositIx)
    }
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: governedTokenAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
    signers,
    shouldSplitIntoSeparateTxs: true,
  }

  console.log('goblingold instruction:', obj)

  return obj
}

export async function getGoblinGoldWithdrawInstruction({
  schema,
  form,
  amount,
  connection,
  wallet,
  setFormErrors,
}: {
  schema: any
  form: any
  amount: number
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  let prerequisiteInstructions: TransactionInstruction[] = []
  const governedTokenAccount = form.governedTokenAccount as AssetAccount

  const signers: Keypair[] = []

  if (
    isValid &&
    amount &&
    governedTokenAccount?.extensions.mint?.account &&
    governedTokenAccount?.governance &&
    wallet
  ) {
    const provider = new AnchorProvider(
      connection.current,
      wallet as unknown as Wallet,
      AnchorProvider.defaultOptions()
    )
    const sdk = new GoblinGold(
      NetworkName.Mainnet,
      'https://ssc-dao.genesysgo.net',
      // @ts-ignore: Wallet compatability issues
      provider
    )
    const strategyProgram = sdk.BestApy

    const vault = await sdk.getVaultById(form.goblinGoldVaultId)

    if (!vault) {
      throw new Error('Error: no vault')
    }

    strategyProgram.setToken(vault.input.symbol)

    // ggUSDC, ggWSOL public key
    const governedTokenPk = governedTokenAccount.extensions.mint.publicKey

    // owner public key
    const governedAccountPk = getGovernedAccountPk(governedTokenAccount)

    const inputTokenMintAddress = new PublicKey(vault.input.mintAddress)
    const lpTokenMintAddress = new PublicKey(vault.lp.mintAddress)

    if (vault.name !== 'Best APY') {
      throw new Error("Error: strategy doesn't support")
    }

    if (lpTokenMintAddress.toString() !== governedTokenPk.toString()) {
      throw new Error('Error: selected governance token is not supported')
    }

    let ataInputAddress: PublicKey

    if (governedTokenAccount.isSol) {
      // If the token account is the native SOL, should create and initialize a new account on the special native token mint. And before initializing it, should send lamports to the new account.
      ataInputAddress = await createWrappedNativeAccount(
        connection.current,
        governedAccountPk,
        amount,
        prerequisiteInstructions
      )
    } else {
      // In case of the treasury doesn't have the token account, create it.
      ataInputAddress = await createAssociatedTokenAccountIfNotExist(
        connection.current,
        inputTokenMintAddress,
        governedAccountPk,
        prerequisiteInstructions
      )
    }

    const ataLpAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      lpTokenMintAddress,
      governedAccountPk,
      true
    )

    const withdrawIxs = await strategyProgram.getWithdrawIx({
      userSigner: governedAccountPk,
      userInputTokenAccount: ataInputAddress,
      userLpTokenAccount: ataLpAddress,
      lpAmount: new BN(amount),
    })

    const lastIx = withdrawIxs.pop()

    if (lastIx) serializedInstruction = serializeInstructionToBase64(lastIx)

    prerequisiteInstructions = prerequisiteInstructions.concat(withdrawIxs)
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: governedTokenAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
    signers,
    shouldSplitIntoSeparateTxs: true,
  }

  console.log('goblingold instruction:', obj)

  return obj
}
