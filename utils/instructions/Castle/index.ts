import {
  VaultConfig,
  DeploymentEnvs,
  Clusters,
} from '@castlefinance/vault-core'
import { VaultClient } from '@castlefinance/vault-sdk'
import { AnchorProvider, BN, Wallet } from '@coral-xyz/anchor'
import {
  serializeInstructionToBase64,
  ProposalTransaction,
  ProgramAccount,
  WalletSigner,
} from '@solana/spl-governance'
import {
  Token,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import {
  PublicKey,
  TransactionInstruction,
  Keypair,
  Connection,
  Transaction,
} from '@solana/web3.js'
import { ConnectionContext, getNetworkFromEndpoint } from '@utils/connection'
import { validateInstruction } from '@utils/instructionTools'
import { AssetAccount } from '@utils/uiTypes/assets'
import {
  CastleDepositForm,
  CastleWithdrawForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'

export async function getCastleDepositInstruction({
  schema,
  form,
  amount,
  connection,
  wallet,
  setFormErrors,
}: {
  schema: any
  form: CastleDepositForm
  amount: number
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | SignerWalletAdapter | undefined
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  // NOTE - this should be `let serializedInstruction = ''` but it's const so the current changeset passes eslint
  let serializedInstruction = ''

  const prerequisiteInstructions: TransactionInstruction[] = []
  const governedTokenAccount = form.governedTokenAccount as AssetAccount

  const signers: Keypair[] = []

  if (
    isValid &&
    amount &&
    amount > 0 &&
    governedTokenAccount?.extensions.token?.publicKey &&
    governedTokenAccount?.extensions.token &&
    governedTokenAccount?.extensions.mint?.account &&
    governedTokenAccount?.governance &&
    wallet &&
    wallet.publicKey
  ) {
    const vaultClient = await getCastleVaultClientFromForm(
      wallet,
      connection,
      form
    )

    const reserveTokenOwner =
      governedTokenAccount.extensions.token.account.owner

    // Create the DAOs LP ATA if it does not exist already
    let createLpAcctIx: TransactionInstruction | undefined = undefined
    const userLpTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      vaultClient.getLpTokenMint(),
      reserveTokenOwner,
      true
    )

    try {
      await vaultClient.getLpTokenAccountInfo(userLpTokenAccount)
    } catch (error) {
      createLpAcctIx = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        vaultClient.getLpTokenMint(),
        userLpTokenAccount,
        reserveTokenOwner,
        wallet.publicKey
      )
    }

    // Get the deposit instruction
    const { decimals } = governedTokenAccount.extensions.mint.account
    const depositIx = await vaultClient.getDepositIx(
      new BN(amount * Math.pow(10, decimals)),
      reserveTokenOwner,
      userLpTokenAccount,
      governedTokenAccount.pubkey
    )

    // Create the LP token account if necessary
    if (createLpAcctIx) {
      prerequisiteInstructions.push(createLpAcctIx)
    }

    serializedInstruction = serializeInstructionToBase64(depositIx)
  }

  // Build + return UI instruction
  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: governedTokenAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
    signers,
  }

  return obj
}

export async function getCastleWithdrawInstruction({
  schema,
  form,
  amount,
  connection,
  wallet,
  setFormErrors,
}: {
  schema: any
  form: CastleDepositForm
  amount: number
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | SignerWalletAdapter | undefined
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  // NOTE - this should be `let serializedInstruction = ''` but it's const so the current changeset passes eslint
  let serializedInstruction = ''

  const prerequisiteInstructions: TransactionInstruction[] = []
  const governedTokenAccount = form.governedTokenAccount as AssetAccount

  const signers: Keypair[] = []

  if (
    isValid &&
    amount &&
    amount > 0 &&
    governedTokenAccount?.extensions.token?.publicKey &&
    governedTokenAccount?.extensions.token &&
    governedTokenAccount?.extensions.mint?.account &&
    governedTokenAccount?.governance &&
    wallet &&
    wallet.publicKey
  ) {
    const vaultClient = await getCastleVaultClientFromForm(
      wallet,
      connection,
      form
    )

    const lpTokenAccountOwner =
      governedTokenAccount.extensions.token.account.owner

    // Create the DAOs Reserve ATA if it does not exist already
    let createReserveAcctIx: TransactionInstruction | undefined = undefined
    const userReserveTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      vaultClient.getReserveTokenMint(),
      lpTokenAccountOwner,
      true
    )

    try {
      await vaultClient.getReserveTokenAccountInfo(userReserveTokenAccount)
    } catch (error) {
      console.log('Creating reserve token account', error)
      createReserveAcctIx = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        vaultClient.getReserveTokenMint(),
        userReserveTokenAccount,
        lpTokenAccountOwner,
        wallet.publicKey
      )
    }

    // Get withdraw instruction. User selects the LP token to deposit back
    // into the vault in exchange for the reserve token
    const { decimals } = governedTokenAccount.extensions.mint.account

    const withdrawIx = await vaultClient.getWithdrawIx(
      new BN(amount * Math.pow(10, decimals)),
      lpTokenAccountOwner,
      governedTokenAccount.pubkey,
      userReserveTokenAccount
    )

    // Create the reserve token account if necessary
    if (createReserveAcctIx) {
      prerequisiteInstructions.push(createReserveAcctIx)
    }

    serializedInstruction = serializeInstructionToBase64(withdrawIx)
  }

  // Build + return UI instruction
  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: governedTokenAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
    signers,
  }

  return obj
}

/**
 * Pulls the reconcile amount out of the proposal
 * @param connection
 * @param wallet
 * @param proposalTx
 */
export async function getCastleReconcileInstruction(
  connection: Connection,
  wallet: WalletSigner,
  instruction: ProgramAccount<ProposalTransaction>
) {
  const vaultClient = await getCastleVaultClientFromProposal(
    wallet,
    connection,
    instruction
  )

  // Bundle reconcile and refresh into the same tx
  const ix = instruction.account.getSingleInstruction()

  // Grab the amount parameter from the instruction :^)
  const amount = new BN(
    [...ix.data.slice(8, 16)]
      .reverse()
      .map((i) => `00${i.toString(16)}`.slice(-2))
      .join(''),
    16
  ).toNumber()

  return await vaultClient.getReconcileTxs(amount)
}

/**
 * Constructs refresh transaction based on network and vault and mint and strategy
 * @param connection
 * @param wallet
 * @param instructionOption
 * @returns Refresh transaction for the specified mint vault
 */
export async function getCastleRefreshInstructions(
  connection: Connection,
  wallet: any,
  instruction: ProgramAccount<ProposalTransaction>
) {
  const vaultClient = await getCastleVaultClientFromProposal(
    wallet,
    connection,
    instruction
  )

  const refreshIxs = vaultClient.getRefreshIxs()

  return refreshIxs
}

/**
 * Get the vault that matches the current network and
 * pulls the vaultId from a form
 * @param network
 * @param instruction
 * @returns
 */
const getCastleVaultClientFromForm = async (
  wallet: WalletSigner,
  connection: ConnectionContext,
  form: CastleDepositForm | CastleWithdrawForm
) => {
  // Create a new provider
  const provider = new AnchorProvider(
    connection.current,
    (wallet as unknown) as Wallet,
    {
      preflightCommitment: 'confirmed',
      commitment: 'confirmed',
    }
  )

  const vaults = (await getCastleVaults()).filter((v) =>
    connection.cluster == 'mainnet'
      ? v.cluster == Clusters.mainnetBeta
      : v.cluster == Clusters.devnet
  )

  // Getting the vault from a user-inputted form
  const vault = vaults.find((v) => v.vault_id === form.castleVaultId)

  if (!vault) {
    throw new Error('Vault not found in config')
  }

  // Load the vault
  const vaultClient = await VaultClient.load(
    provider,
    new PublicKey(vault.vault_id),
    connection.cluster == 'mainnet'
      ? DeploymentEnvs.mainnet
      : DeploymentEnvs.devnetStaging
  )

  return vaultClient
}

/**
 * Get the vault that matches the current network and
 * pulls the vaultId from an instruction proposal
 * @param network
 * @param instruction
 * @returns
 */
const getCastleVaultClientFromProposal = async (
  wallet: WalletSigner,
  connection: Connection,
  instruction: ProgramAccount<ProposalTransaction>
) => {
  // Create a new provider
  const provider = new AnchorProvider(
    connection,
    (wallet as unknown) as Wallet,
    {
      preflightCommitment: 'confirmed',
      commitment: 'confirmed',
    }
  )

  const network = getNetworkFromEndpoint(connection.rpcEndpoint)
  const vaults = await getCastleVaults()

  // Getting the vault from a proposal instruction
  const vault = vaults
    .filter((v) =>
      network == 'mainnet'
        ? v.cluster == Clusters.mainnetBeta
        : v.cluster == Clusters.devnet
    )
    .find((v) =>
      instruction.account.instructions
        .map((i) => i.accounts.map((a) => a.pubkey.toBase58()))
        .flat()
        .includes(v.vault_id)
    )

  if (!vault) {
    throw new Error('Vault not found in config')
  }

  // Load the vault
  const vaultClient = await VaultClient.load(
    provider,
    new PublicKey(vault.vault_id),
    network == 'mainnet' ? DeploymentEnvs.mainnet : DeploymentEnvs.devnetStaging
  )

  return vaultClient
}

// Get the vaults from the config api
export const getCastleVaults = async () => {
  const configResponse = await fetch('https://api.castle.finance/configs')
  const vaults = (await configResponse.json()) as VaultConfig<DeploymentEnvs>[]
  return vaults
}

interface WalletAdapter {
  publicKey: PublicKey
  connected: boolean
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>
  connect: () => any
  disconnect: () => any
}
