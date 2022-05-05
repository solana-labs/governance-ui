import { BN, WalletAdapter } from '@blockworks-foundation/mango-client'
import {
  VaultConfig,
  DeploymentEnvs,
  Clusters,
} from '@castlefinance/vault-core'
import { VaultClient } from '@castlefinance/vault-sdk'
import { Provider } from '@castlefinance/vault-sdk/node_modules/@project-serum/anchor'
import { AnchorWallet } from '@friktion-labs/friktion-sdk/dist/cjs/src/miscUtils'
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
  SYSVAR_CLOCK_PUBKEY,
  Connection,
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
      vaultClient.getVaultState().lpTokenMint,
      reserveTokenOwner,
      true
    )
    const userLpTokenAccountInfo = await vaultClient.program.provider.connection.getAccountInfo(
      userLpTokenAccount
    )
    if (userLpTokenAccountInfo == null) {
      createLpAcctIx = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        vaultClient.getVaultState().lpTokenMint,
        userLpTokenAccount,
        reserveTokenOwner,
        wallet.publicKey
      )
    }

    // Get the deposit instruction
    const { decimals } = governedTokenAccount.extensions.mint.account
    const depositIx = vaultClient.program.instruction.deposit(
      new BN(amount * Math.pow(10, decimals)),
      {
        accounts: {
          vault: vaultClient.vaultId,
          vaultAuthority: vaultClient.getVaultState().vaultAuthority,
          vaultReserveToken: vaultClient.getVaultState().vaultReserveToken,
          lpTokenMint: vaultClient.getVaultState().lpTokenMint,
          userReserveToken: governedTokenAccount.pubkey,
          userLpToken: userLpTokenAccount,
          userAuthority: reserveTokenOwner,
          tokenProgram: TOKEN_PROGRAM_ID,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
      }
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
    shouldSplitIntoSeparateTxs: true,
  }
  console.log('cas: obj', obj)

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

    console.log(vaultClient)

    const lpTokenAccountOwner =
      governedTokenAccount.extensions.token.account.owner

    // Create the DAOs Reserve ATA if it does not exist already
    let createReserveAcctIx: TransactionInstruction | undefined = undefined
    const userReserveTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      vaultClient.getVaultState().reserveTokenMint,
      lpTokenAccountOwner,
      true
    )
    const userReserveTokenAccountInfo = await vaultClient.program.provider.connection.getAccountInfo(
      userReserveTokenAccount
    )
    if (userReserveTokenAccountInfo == null) {
      createReserveAcctIx = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        vaultClient.getVaultState().reserveTokenMint,
        userReserveTokenAccount,
        lpTokenAccountOwner,
        wallet.publicKey
      )
    }

    console.log('userReserveTokenAccount', userReserveTokenAccount.toBase58())
    console.log(
      'vaultClient.getVaultState().vaultReserveToken',
      vaultClient.getVaultState().vaultReserveToken.toBase58()
    )
    // Get withdraw instruction. User selects the LP token to deposit back
    // into the vault in exchange for the reserve token
    const { decimals } = governedTokenAccount.extensions.mint.account
    const withdrawIx = vaultClient.program.instruction.withdraw(
      new BN(amount * Math.pow(10, decimals)),
      {
        accounts: {
          vault: vaultClient.vaultId,
          vaultAuthority: vaultClient.getVaultState().vaultAuthority,
          userAuthority: lpTokenAccountOwner,
          userLpToken: governedTokenAccount.pubkey,
          userReserveToken: userReserveTokenAccount,
          vaultReserveToken: vaultClient.getVaultState().vaultReserveToken,
          lpTokenMint: vaultClient.getVaultState().lpTokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
      }
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
    shouldSplitIntoSeparateTxs: true,
  }
  console.log('cas: obj', obj)

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

  console.log('Grabbed', amount, 'from proposal instruction')

  return await vaultClient.getReconcileTxs(amount)
}

/**
 * Constructs refresh transaction based on network and vault and mint and strategy
 * @param connection
 * @param wallet
 * @param instructionOption
 * @returns Refresh transaction for the specified mint vault
 */
export async function getCastleRefreshInstruction(
  connection: Connection,
  wallet: any,
  instruction: ProgramAccount<ProposalTransaction>
) {
  const vaultClient = await getCastleVaultClientFromProposal(
    wallet,
    connection,
    instruction
  )

  const refreshIx = vaultClient.getRefreshIx()

  return refreshIx
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
  const provider = new Provider(
    connection.current,
    (wallet as unknown) as AnchorWallet,
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
  const provider = new Provider(
    connection,
    (wallet as unknown) as AnchorWallet,
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
