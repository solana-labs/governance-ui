import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from '@solana/spl-token'
import { SignerWalletAdapter, WalletAdapter } from '@solana/wallet-adapter-base'
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { BN } from '@project-serum/anchor'
import { Marinade, MarinadeConfig } from '@marinade.finance/marinade-ts-sdk'
import {
  getMintNaturalAmountFromDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import { ConnectionContext } from 'utils/connection'
import { getATA } from './ataTools'
import { isFormValid } from './formValidation'
import { getTokenAccountsByMint } from './tokens'
import { UiInstruction } from './uiTypes/proposalCreationTypes'
import { AssetAccount } from '@utils/uiTypes/assets'

export const validateInstruction = async ({
  schema,
  form,
  setFormErrors,
}): Promise<boolean> => {
  const { isValid, validationErrors } = await isFormValid(schema, form)
  setFormErrors(validationErrors)
  return isValid
}

// export async function getCastleDepositInstruction({
//   schema,
//   form,
//   amount,
//   connection,
//   wallet,
//   setFormErrors,
// }: {
//   schema: any
//   form: CastleDepositForm
//   amount: number
//   programId: PublicKey | undefined
//   connection: ConnectionContext
//   wallet: WalletAdapter | undefined
//   setFormErrors: any
// }): Promise<UiInstruction> {
//   const isValid = await validateInstruction({ schema, form, setFormErrors })

//   // NOTE - this should be `let serializedInstruction = ''` but it's const so the current changeset passes eslint
//   let serializedInstruction = ''

//   const prerequisiteInstructions: TransactionInstruction[] = []
//   const governedTokenAccount = form.governedTokenAccount as AssetAccount

//   const signers: Keypair[] = []

//   if (
//     isValid &&
//     amount &&
//     amount > 0 &&
//     governedTokenAccount?.extensions.token?.publicKey &&
//     governedTokenAccount?.extensions.token &&
//     governedTokenAccount?.extensions.mint?.account &&
//     governedTokenAccount?.governance &&
//     wallet &&
//     wallet.publicKey
//   ) {
//     // Create a new provider
//     const provider = new Provider(
//       connection.current,
//       (wallet as unknown) as AnchorWallet,
//       {
//         preflightCommitment: 'confirmed',
//         commitment: 'confirmed',
//       }
//     )

//     const configResponse = await fetch('https://api.castle.finance/configs')
//     const vaults = (await configResponse.json()) as VaultConfig<DeploymentEnvs>[]

//     // Get the vault that matches the current network and reserve currency
//     // Note: Assumes one strategy
//     const vault = vaults
//       .filter((v) => v.cluster == connection.cluster)
//       .find((v) => v.vault_id === form.castleVaultId)

//     console.log('Depositing into vault:', vault)
//     if (!vault) {
//       console.log(vaults, form)
//       throw new Error('Vault not found in config')
//     }

//     // Load the vault
//     const vaultClient = await VaultClient.load(
//       provider,
//       new PublicKey(vault.vault_id),
//       connection.cluster == 'mainnet'
//         ? DeploymentEnvs.mainnet
//         : DeploymentEnvs.devnetParity
//     )

//     console.log(vaultClient)

//     const reserveTokenOwner =
//       governedTokenAccount.extensions.token.account.owner

//     // Create the DAOs LP ATA if it does not exist already
//     let createLpAcctIx: TransactionInstruction | undefined = undefined
//     const userLpTokenAccount = await Token.getAssociatedTokenAddress(
//       ASSOCIATED_TOKEN_PROGRAM_ID,
//       TOKEN_PROGRAM_ID,
//       vaultClient.getVaultState().lpTokenMint,
//       reserveTokenOwner,
//       true
//     )
//     const userLpTokenAccountInfo = await vaultClient.program.provider.connection.getAccountInfo(
//       userLpTokenAccount
//     )
//     if (userLpTokenAccountInfo == null) {
//       createLpAcctIx = Token.createAssociatedTokenAccountInstruction(
//         ASSOCIATED_TOKEN_PROGRAM_ID,
//         TOKEN_PROGRAM_ID,
//         vaultClient.getVaultState().lpTokenMint,
//         userLpTokenAccount,
//         reserveTokenOwner,
//         wallet.publicKey
//       )
//     }

//     // Get the deposit instruction
//     const { decimals } = governedTokenAccount.extensions.mint.account
//     const depositIx = vaultClient.program.instruction.deposit(
//       new BN(amount * Math.pow(10, decimals)),
//       {
//         accounts: {
//           vault: vaultClient.vaultId,
//           vaultAuthority: vaultClient.getVaultState().vaultAuthority,
//           vaultReserveToken: vaultClient.getVaultState().vaultReserveToken,
//           lpTokenMint: vaultClient.getVaultState().lpTokenMint,
//           userReserveToken: governedTokenAccount.pubkey,
//           userLpToken: userLpTokenAccount,
//           userAuthority: reserveTokenOwner,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           clock: SYSVAR_CLOCK_PUBKEY,
//         },
//       }
//     )

//     // Create the LP token account if necessary
//     if (createLpAcctIx) {
//       prerequisiteInstructions.push(createLpAcctIx)
//     }

//     serializedInstruction = serializeInstructionToBase64(depositIx)
//   }

//   // Build + return UI instruction
//   const obj: UiInstruction = {
//     serializedInstruction,
//     isValid,
//     governance: governedTokenAccount?.governance,
//     prerequisiteInstructions: prerequisiteInstructions,
//     signers,
//     shouldSplitIntoSeparateTxs: true,
//   }
//   console.log('cas: obj', obj)

//   return obj
// }

// export async function getCastleWithdrawInstruction({
//   schema,
//   form,
//   amount,
//   connection,
//   wallet,
//   setFormErrors,
// }: {
//   schema: any
//   form: CastleDepositForm
//   amount: number
//   programId: PublicKey | undefined
//   connection: ConnectionContext
//   wallet: WalletAdapter | undefined
//   setFormErrors: any
// }): Promise<UiInstruction> {
//   const isValid = await validateInstruction({ schema, form, setFormErrors })

//   // NOTE - this should be `let serializedInstruction = ''` but it's const so the current changeset passes eslint
//   let serializedInstruction = ''

//   const prerequisiteInstructions: TransactionInstruction[] = []
//   const governedTokenAccount = form.governedTokenAccount as AssetAccount

//   const signers: Keypair[] = []

//   if (
//     isValid &&
//     amount &&
//     amount > 0 &&
//     governedTokenAccount?.extensions.token?.publicKey &&
//     governedTokenAccount?.extensions.token &&
//     governedTokenAccount?.extensions.mint?.account &&
//     governedTokenAccount?.governance &&
//     wallet &&
//     wallet.publicKey
//   ) {
//     // Create a new provider
//     const provider = new Provider(
//       connection.current,
//       (wallet as unknown) as AnchorWallet,
//       {
//         preflightCommitment: 'confirmed',
//         commitment: 'confirmed',
//       }
//     )

//     const configResponse = await fetch('https://api.castle.finance/configs')
//     const vaults = (await configResponse.json()) as VaultConfig<DeploymentEnvs>[]

//     // Get the vault that matches the current network and reserve currency
//     // Note: Assumes one strategy
//     const vault = vaults
//       .filter((v) => v.cluster == connection.cluster)
//       .find((v) => v.vault_id === form.castleVaultId)

//     console.log('Withdrawing from vault:', vault)
//     if (!vault) {
//       console.log(vaults, form)
//       throw new Error('Vault not found in config')
//     }

//     // Load the vault
//     const vaultClient = await VaultClient.load(
//       provider,
//       new PublicKey(vault.vault_id),
//       connection.cluster == 'mainnet'
//         ? DeploymentEnvs.mainnet
//         : DeploymentEnvs.devnetParity
//     )

//     const lpTokenAccountOwner =
//       governedTokenAccount.extensions.token.account.owner

//     // Create the DAOs Reserve ATA if it does not exist already
//     let createReserveAcctIx: TransactionInstruction | undefined = undefined
//     const userReserveTokenAccount = await Token.getAssociatedTokenAddress(
//       ASSOCIATED_TOKEN_PROGRAM_ID,
//       TOKEN_PROGRAM_ID,
//       vaultClient.getVaultState().reserveTokenMint,
//       lpTokenAccountOwner,
//       true
//     )
//     const userReserveTokenAccountInfo = await vaultClient.program.provider.connection.getAccountInfo(
//       userReserveTokenAccount
//     )
//     if (userReserveTokenAccountInfo == null) {
//       createReserveAcctIx = Token.createAssociatedTokenAccountInstruction(
//         ASSOCIATED_TOKEN_PROGRAM_ID,
//         TOKEN_PROGRAM_ID,
//         vaultClient.getVaultState().reserveTokenMint,
//         userReserveTokenAccount,
//         lpTokenAccountOwner,
//         wallet.publicKey
//       )
//     }

//     console.log('userReserveTokenAccount', userReserveTokenAccount.toBase58())
//     console.log(
//       'vaultClient.getVaultState().vaultReserveToken',
//       vaultClient.getVaultState().vaultReserveToken.toBase58()
//     )
//     // Get withdraw instruction. User selects the LP token to deposit back
//     // into the vault in exchange for the reserve token
//     const { decimals } = governedTokenAccount.extensions.mint.account
//     const withdrawIx = vaultClient.program.instruction.withdraw(
//       new BN(amount * Math.pow(10, decimals)),
//       {
//         accounts: {
//           vault: vaultClient.vaultId,
//           vaultAuthority: vaultClient.getVaultState().vaultAuthority,
//           userAuthority: lpTokenAccountOwner,
//           userLpToken: governedTokenAccount.pubkey,
//           userReserveToken: userReserveTokenAccount,
//           vaultReserveToken: vaultClient.getVaultState().vaultReserveToken,
//           lpTokenMint: vaultClient.getVaultState().lpTokenMint,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           clock: SYSVAR_CLOCK_PUBKEY,
//         },
//       }
//     )

//     // Create the reserve token account if necessary
//     if (createReserveAcctIx) {
//       prerequisiteInstructions.push(createReserveAcctIx)
//     }

//     serializedInstruction = serializeInstructionToBase64(withdrawIx)
//   }

//   // Build + return UI instruction
//   const obj: UiInstruction = {
//     serializedInstruction,
//     isValid,
//     governance: governedTokenAccount?.governance,
//     prerequisiteInstructions: prerequisiteInstructions,
//     signers,
//     shouldSplitIntoSeparateTxs: true,
//   }
//   console.log('cas: obj', obj)

//   return obj
// }

// /**
//  * Pulls the reconcile amount out of the proposal
//  * @param connection
//  * @param wallet
//  * @param proposalTx
//  */
// export async function getCastleReconcileInstruction(
//   connection: Connection,
//   wallet: WalletAdapter | undefined,
//   instruction: ProgramAccount<ProposalTransaction>
// ) {
//   // Initialize a new provider
//   const provider = new Provider(
//     connection,
//     (wallet as unknown) as AnchorWallet,
//     {
//       preflightCommitment: 'confirmed',
//       commitment: 'confirmed',
//     }
//   )

//   // Look up the current network from the endpoint
//   const network = getNetworkFromEndpoint(connection.rpcEndpoint)

//   // Get the vaults from the config api
//   const configResponse = await fetch('https://api.castle.finance/configs')
//   const vaults = (await configResponse.json()) as VaultConfig<DeploymentEnvs>[]

//   // Get the vault that matches the current network and its vault id exists inside the proposal
//   const vault = vaults
//     .filter((v) =>
//       network == 'mainnet'
//         ? v.deploymentEnv == DeploymentEnvs.mainnet
//         : v.deploymentEnv == DeploymentEnvs.devnetParity
//     )
//     .find((v) =>
//       instruction.account.instructions
//         .map((i) => i.accounts.map((a) => a.pubkey.toBase58()))
//         .flat()
//         .includes(v.vault_id)
//     )

//   console.log('Targeted Vault:', vault)

//   if (!vault) {
//     throw new Error('Vault not found in config')
//   }

//   // Load the vault
//   const vaultClient = await VaultClient.load(
//     provider,
//     new PublicKey(vault.vault_id),
//     network == 'mainnet' ? 'mainnet' : 'devnet-parity'
//   )

//   // Bundle reconcile and refresh into the same tx
//   const ix = instruction.account.getSingleInstruction()

//   // Grab the amount parameter from the instruction :^)
//   const amount = new BN(
//     [...ix.data.slice(8, 16)]
//       .reverse()
//       .map((i) => `00${i.toString(16)}`.slice(-2))
//       .join(''),
//     16
//   ).toNumber()

//   console.log('Grabbed', amount, 'from proposal instruction')

//   return await vaultClient.getReconcileTxs(amount)
// }

// /**
//  * Constructs refresh transaction based on network and vault and mint and strategy
//  * @param connection
//  * @param wallet
//  * @param instructionOption
//  * @returns Refresh transaction for the specified mint vault
//  */
// export async function getCastleRefreshInstruction(
//   connection: Connection,
//   wallet: WalletAdapter | undefined,
//   instruction: ProgramAccount<ProposalTransaction>
// ) {
//   // Initialize a new provider
//   const provider = new Provider(
//     connection,
//     (wallet as unknown) as AnchorWallet,
//     {
//       preflightCommitment: 'confirmed',
//       commitment: 'confirmed',
//     }
//   )

//   // Look up the current network from the endpoint
//   const network = getNetworkFromEndpoint(connection.rpcEndpoint)

//   // Get the vaults from the config api
//   const configResponse = await fetch('https://api.castle.finance/configs')
//   const vaults = (await configResponse.json()) as VaultConfig<DeploymentEnvs>[]

//   // Get the vault that matches the current network and its vault id exists inside the proposal
//   const vault = vaults
//     .filter((v) =>
//       network == 'mainnet'
//         ? v.deploymentEnv == DeploymentEnvs.mainnet
//         : v.deploymentEnv == DeploymentEnvs.devnetParity
//     )
//     .find((v) =>
//       instruction.account.instructions
//         .map((i) => i.accounts.map((a) => a.pubkey.toBase58()))
//         .flat()
//         .includes(v.vault_id)
//     )

//   console.log('Targeted Vault:', vault?.vault_id)

//   if (!vault) {
//     throw new Error('Vault not found in config')
//   }

//   console.log(network)

//   // Load the vault
//   const vaultClient = await VaultClient.load(
//     provider,
//     new PublicKey(vault.vault_id),
//     network == 'mainnet' ? DeploymentEnvs.mainnet : DeploymentEnvs.devnetParity
//   )

//   console.log(vaultClient)

//   // Get refresh ix
//   const refreshIx = vaultClient.getRefreshIx()

//   return refreshIx
// }

export async function getGenericTransferInstruction({
  schema,
  form,
  programId,
  connection,
  wallet,
  setFormErrors,
  requiredStateInfo,
}: {
  schema: any
  form: any
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  requiredStateInfo: {
    /// The mint that is being transfered
    mint: PublicKey
    /// The TokenAccount address that will be sending the tokens
    tokenSource: PublicKey
    /// The number of decimals for this token's mint
    mintDecimals: number
    /// The governance that controls this account
    governance: ProgramAccount<Governance>
    /// The key that has to sign for the token transfer
    owner: PublicKey
  }
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  if (isValid && programId) {
    const sourceAccount = requiredStateInfo.tokenSource
    //this is the original owner
    const destinationAccount = new PublicKey(form.destinationAccount)
    const mintPK = requiredStateInfo.mint
    const mintAmount = parseMintNaturalAmountFromDecimal(
      form.amount!,
      requiredStateInfo.mintDecimals
    )

    //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
    const { currentAddress: receiverAddress, needToCreateAta } = await getATA({
      connection: connection,
      receiverAddress: destinationAccount,
      mintPK,
      wallet: wallet!,
    })

    //we push this createATA instruction to transactions to create right before creating proposal
    //we don't want to create ata only when instruction is serialized
    if (needToCreateAta) {
      prerequisiteInstructions.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
          mintPK, // mint
          receiverAddress, // ata
          destinationAccount, // owner of token account
          wallet!.publicKey! // fee payer
        )
      )
    }
    const transferIx = Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      sourceAccount,
      receiverAddress,
      requiredStateInfo.owner,
      [],
      new u64(mintAmount.toString())
    )
    serializedInstruction = serializeInstructionToBase64(transferIx)
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: requiredStateInfo.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  }
  return obj
}

export async function getTransferInstruction({
  schema,
  form,
  programId,
  connection,
  wallet,
  currentAccount,
  setFormErrors,
}: {
  schema: any
  form: any
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  currentAccount: AssetAccount | null
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  const governedTokenAccount = form.governedTokenAccount as AssetAccount
  if (
    isValid &&
    programId &&
    governedTokenAccount.extensions?.token?.publicKey &&
    governedTokenAccount.extensions?.token &&
    governedTokenAccount.extensions?.mint?.account
  ) {
    const sourceAccount = governedTokenAccount.extensions.transferAddress
    //this is the original owner
    const destinationAccount = new PublicKey(form.destinationAccount)
    const mintPK = form.governedTokenAccount.extensions.mint.publicKey
    const mintAmount = parseMintNaturalAmountFromDecimal(
      form.amount!,
      governedTokenAccount.extensions.mint.account.decimals
    )

    //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
    const { currentAddress: receiverAddress, needToCreateAta } = await getATA({
      connection: connection,
      receiverAddress: destinationAccount,
      mintPK,
      wallet: wallet!,
    })
    //we push this createATA instruction to transactions to create right before creating proposal
    //we don't want to create ata only when instruction is serialized
    if (needToCreateAta) {
      prerequisiteInstructions.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
          mintPK, // mint
          receiverAddress, // ata
          destinationAccount, // owner of token account
          wallet!.publicKey! // fee payer
        )
      )
    }
    const transferIx = Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      sourceAccount!,
      receiverAddress,
      currentAccount!.extensions!.token!.account.owner,
      [],
      new u64(mintAmount.toString())
    )
    serializedInstruction = serializeInstructionToBase64(transferIx)
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: currentAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  }
  return obj
}

export async function getSolTransferInstruction({
  schema,
  form,
  programId,
  currentAccount,
  setFormErrors,
}: {
  schema: any
  form: any
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  currentAccount: AssetAccount | null
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  const governedTokenAccount = form.governedTokenAccount as AssetAccount
  if (isValid && programId && governedTokenAccount?.extensions.mint?.account) {
    const sourceAccount = governedTokenAccount.extensions.transferAddress
    const destinationAccount = new PublicKey(form.destinationAccount)
    //We have configured mint that has same decimals settings as SOL
    const mintAmount = parseMintNaturalAmountFromDecimal(
      form.amount!,
      governedTokenAccount.extensions.mint.account.decimals
    )

    const transferIx = SystemProgram.transfer({
      fromPubkey: sourceAccount!,
      toPubkey: destinationAccount,
      lamports: mintAmount,
    })
    serializedInstruction = serializeInstructionToBase64(transferIx)
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: currentAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  }
  return obj
}

export async function getTransferNftInstruction({
  schema,
  form,
  programId,
  connection,
  wallet,
  currentAccount,
  setFormErrors,
  nftMint,
}: {
  schema: any
  form: any
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  currentAccount: AssetAccount | null
  setFormErrors: any
  nftMint: string
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  if (
    isValid &&
    programId &&
    form.governedTokenAccount?.extensions.mint?.account
  ) {
    const tokenAccountsWithNftMint = await getTokenAccountsByMint(
      connection.current,
      nftMint
    )
    const isSolAccSource = tokenAccountsWithNftMint.find(
      (x) =>
        x.account.owner.toBase58() ===
        form.governedTokenAccount.extensions.transferAddress.toBase58()
    )?.publicKey
    const isGovernanceSource = tokenAccountsWithNftMint.find(
      (x) =>
        x.account.owner.toBase58() ===
        form.governedTokenAccount.governance.pubkey.toBase58()
    )?.publicKey
    //we find ata from connected wallet that holds the nft
    const sourceAccount = isSolAccSource || isGovernanceSource
    if (!sourceAccount) {
      throw 'Nft ata not found for governance'
    }
    //this is the original owner
    const destinationAccount = new PublicKey(form.destinationAccount)
    const mintPK = new PublicKey(nftMint)
    const mintAmount = 1
    //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
    const { currentAddress: receiverAddress, needToCreateAta } = await getATA({
      connection: connection,
      receiverAddress: destinationAccount,
      mintPK,
      wallet: wallet!,
    })
    //we push this createATA instruction to transactions to create right before creating proposal
    //we don't want to create ata only when instruction is serialized
    if (needToCreateAta) {
      prerequisiteInstructions.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
          mintPK, // mint
          receiverAddress, // ata
          destinationAccount, // owner of token account
          wallet!.publicKey! // fee payer
        )
      )
    }
    const transferIx = Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      sourceAccount!,
      receiverAddress,
      isSolAccSource
        ? form.governedTokenAccount.extensions.transferAddress
        : form.governedTokenAccount.governance.pubkey,
      [],
      mintAmount
    )
    serializedInstruction = serializeInstructionToBase64(transferIx)
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: currentAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  }
  return obj
}

export async function getMintInstruction({
  schema,
  form,
  programId,
  connection,
  wallet,
  governedMintInfoAccount,
  setFormErrors,
}: {
  schema: any
  form: any
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  governedMintInfoAccount: AssetAccount | undefined
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  if (isValid && programId && form.mintAccount?.governance?.pubkey) {
    //this is the original owner
    const destinationAccount = new PublicKey(form.destinationAccount)
    const mintPK = form.mintAccount.governance.account.governedAccount
    const mintAmount = parseMintNaturalAmountFromDecimal(
      form.amount!,
      form.mintAccount.extensions.mint.account?.decimals
    )

    //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
    const { currentAddress: receiverAddress, needToCreateAta } = await getATA({
      connection,
      receiverAddress: destinationAccount,
      mintPK,
      wallet: wallet!,
    })
    //we push this createATA instruction to transactions to create right before creating proposal
    //we don't want to create ata only when instruction is serialized
    if (needToCreateAta) {
      prerequisiteInstructions.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
          mintPK, // mint
          receiverAddress, // ata
          destinationAccount, // owner of token account
          wallet!.publicKey! // fee payer
        )
      )
    }
    const transferIx = Token.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      form.mintAccount.governance.account.governedAccount,
      receiverAddress,
      form.mintAccount.governance!.pubkey,
      [],
      mintAmount
    )
    serializedInstruction = serializeInstructionToBase64(transferIx)
  }
  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: governedMintInfoAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  }
  return obj
}

export async function getConvertToMsolInstruction({
  schema,
  form,
  connection,
  setFormErrors,
}: {
  schema: any
  form: any
  connection: ConnectionContext
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  const prerequisiteInstructions: TransactionInstruction[] = []
  let serializedInstruction = ''

  if (
    isValid &&
    form.governedTokenAccount.extensions.transferAddress &&
    form.destinationAccount.governance.pubkey
  ) {
    const amount = getMintNaturalAmountFromDecimal(
      form.amount,
      form.governedTokenAccount.extensions.mint.account.decimals
    )
    const originAccount = form.governedTokenAccount.extensions.transferAddress
    const destinationAccount = form.destinationAccount.governance.pubkey

    const config = new MarinadeConfig({
      connection: connection.current,
      publicKey: originAccount,
    })
    const marinade = new Marinade(config)

    const { transaction } = await marinade.deposit(new BN(amount), {
      mintToOwnerAddress: destinationAccount,
    })

    if (transaction.instructions.length === 1) {
      serializedInstruction = serializeInstructionToBase64(
        transaction.instructions[0]
      )
    } else {
      throw Error('No mSOL Account can be found for the choosen account.')
    }
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: form.governedTokenAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  }

  return obj
}

export const getTransferInstructionObj = async ({
  connection,
  governedTokenAccount,
  destinationAccount,
  amount,
  wallet,
}: {
  connection: ConnectionContext
  governedTokenAccount: AssetAccount
  destinationAccount: string
  amount: number | BN
  wallet: SignerWalletAdapter
}) => {
  const obj: {
    transferInstruction: TransactionInstruction | null
    ataInstruction: TransactionInstruction | null
  } = {
    transferInstruction: null,
    ataInstruction: null,
  }
  const sourceAccount = governedTokenAccount.extensions.transferAddress
  //this is the original owner
  const destinationAccountPk = new PublicKey(destinationAccount)
  const mintPK = governedTokenAccount!.extensions!.mint!.publicKey!
  const mintAmount =
    typeof amount === 'number'
      ? parseMintNaturalAmountFromDecimal(
          amount,
          governedTokenAccount.extensions.mint!.account.decimals
        )
      : amount

  //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
  const { currentAddress: receiverAddress, needToCreateAta } = await getATA({
    connection: connection,
    receiverAddress: destinationAccountPk,
    mintPK,
    wallet: wallet!,
  })
  //we push this createATA instruction to transactions to create right before creating proposal
  //we don't want to create ata only when instruction is serialized
  if (needToCreateAta) {
    const ataInst = Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
      TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
      mintPK, // mint
      receiverAddress, // ata
      destinationAccountPk, // owner of token account
      wallet!.publicKey! // fee payer
    )
    obj.ataInstruction = ataInst
  }
  const transferIx = Token.createTransferInstruction(
    TOKEN_PROGRAM_ID,
    sourceAccount!,
    receiverAddress,
    governedTokenAccount!.extensions!.token!.account.owner,
    [],
    new u64(mintAmount.toString())
  )
  obj.transferInstruction = transferIx
  return obj
}
