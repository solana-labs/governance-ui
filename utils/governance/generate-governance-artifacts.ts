import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  utils,
  createMint,
  createTokenAccount,
  sendTransactions,
  WalletSigner,
} from '@utils/governance/oyster/common'
import { AccountLayout, MintLayout, Token, u64 } from '@solana/spl-token'

export enum SequenceType {
  Sequential,
  Parallel,
  StopOnFailure,
}

export interface SourceEntryInterface {
  owner: PublicKey
  sourceAccount: PublicKey | undefined
  tokenAmount: number
}

export const generateGovernanceArtifacts = async (
  connection: Connection,
  wallet: WalletSigner,
  realmName: string,
  teamWallets: string[]
) => {
  const communityMintSigners: Keypair[] = []
  const communityMintInstruction: TransactionInstruction[] = []
  const otherOwnerWallet = new PublicKey(
    'ENmcpFCpxN1CqyUjuog9yyUVfdXBKF3LVCwLr7grJZpk'
  )

  const otherOwnersWallets = teamWallets
    .filter((_wallet) => _wallet !== wallet.publicKey.toBase58())
    .map((_wallet) => new PublicKey(_wallet))

  // Setup community mint
  const {
    mintAddress: communityMintAddress,
  } = await withMint(
    communityMintInstruction,
    communityMintSigners,
    connection,
    wallet,
    3,
    new u64('0'),
    new u64('0'),
    [otherOwnerWallet]
  )

  const councilMinSigners: Keypair[] = []
  const councilMintInstructions: TransactionInstruction[] = []

  // Setup council mint
  const { mintAddress: councilMintAddress } = await withMint(
    councilMintInstructions,
    councilMinSigners,
    connection,
    wallet,
    0,
    new u64('1'),
    new u64(otherOwnersWallets.length),
    otherOwnersWallets
  )

  // Setup Realm, Governance and Proposal instruction
  const governanceSigners: Keypair[] = []
  const governanceInstructions: TransactionInstruction[] = []

  // Token governance artifacts
  const tokenGovernance = await withTokenGovernance(
    governanceInstructions,
    governanceSigners,
    connection,
    wallet,
    0,
    new u64(200)
  )

  // notify({
  //   message: 'Creating Governance artifacts...',
  //   description: 'Please wait...',
  //   type: 'warn',
  // })

  try {
    const tx = await sendTransactions(
      connection,
      wallet,
      [
        communityMintInstruction,
        councilMintInstructions,
        governanceInstructions,
      ],
      [communityMintSigners, councilMinSigners, governanceSigners],
      SequenceType.Sequential
    )

    // notify({
    //   message: 'Governance artifacts created.',
    //   type: 'success',
    //   description: `Transaction - ${tx}`,
    // })

    return {
      tx,
      realmName,
      communityMintAddress,
      councilMintAddress,
      tokenGovernance,
    }
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

const withTokenGovernance = async (
  instructions: TransactionInstruction[],
  signers: Keypair[],
  connection: Connection,
  wallet: WalletSigner,
  decimals: number,
  amount: u64
) => {
  const { publicKey } = wallet
  if (!publicKey) throw new Error('Wallet not connected!')

  const { token: tokenId } = utils.programIds()

  const mintRentExempt = await connection.getMinimumBalanceForRentExemption(
    MintLayout.span
  )

  const tokenAccountRentExempt = await connection.getMinimumBalanceForRentExemption(
    AccountLayout.span
  )

  const mintAddress = createMint(
    instructions,
    publicKey,
    mintRentExempt,
    decimals,
    publicKey,
    publicKey,
    signers
  )

  const tokenAccountAddress = createTokenAccount(
    instructions,
    publicKey,
    tokenAccountRentExempt,
    mintAddress,
    publicKey,
    signers
  )

  instructions.push(
    Token.createMintToInstruction(
      tokenId,
      mintAddress,
      tokenAccountAddress,
      publicKey,
      [],
      new u64(amount)
    )
  )

  const beneficiaryTokenAccountAddress = createTokenAccount(
    instructions,
    publicKey,
    tokenAccountRentExempt,
    mintAddress,
    publicKey,
    signers
  )

  return {
    tokenAccountAddress: tokenAccountAddress.toBase58(),
    beneficiaryTokenAccountAddress: beneficiaryTokenAccountAddress.toBase58(),
  }
}

//////////////////////////////////////////
export const withMint = async (
  instructions: TransactionInstruction[],
  signers: Keypair[],
  connection: Connection,
  wallet: WalletSigner,
  decimals: number,
  amount: u64,
  supply: u64,
  otherOwnersWallets: PublicKey[]
) => {
  const { publicKey } = wallet
  if (!publicKey) throw new Error('Wallet not connected!')

  const { system: systemId, token: tokenId } = utils.programIds()

  const mintRentExempt = await connection.getMinimumBalanceForRentExemption(
    MintLayout.span
  )

  const tokenAccountRentExempt = await connection.getMinimumBalanceForRentExemption(
    AccountLayout.span
  )

  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(
    0
  )

  const mintAddress = createMint(
    instructions,
    publicKey,
    mintRentExempt,
    decimals,
    publicKey,
    publicKey,
    signers
  )

  const tokenAccountAddress = createTokenAccount(
    instructions,
    publicKey,
    tokenAccountRentExempt,
    mintAddress,
    publicKey,
    signers
  )

  instructions.push(
    Token.createMintToInstruction(
      tokenId,
      mintAddress,
      tokenAccountAddress,
      publicKey,
      [],
      new u64(amount)
    )
  )

  const otherOwner = new Keypair()
  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: otherOwner.publicKey,
      lamports: accountRentExempt,
      space: 0,
      programId: systemId,
    })
  )

  signers.push(otherOwner)

  const otherOwnersTokenAccounts = otherOwnersWallets.map((wallet) => {
    const otherOwnerTokenAccount = createTokenAccount(
      instructions,
      publicKey,
      tokenAccountRentExempt,
      mintAddress,
      wallet,
      signers
    )

    instructions.push(
      Token.createMintToInstruction(
        tokenId,
        mintAddress,
        otherOwnerTokenAccount,
        publicKey,
        [],
        new u64(supply.sub(amount).toArray())
      )
    )
    return otherOwnerTokenAccount
  })

  return { mintAddress, otherOwnersTokenAccounts }
}
