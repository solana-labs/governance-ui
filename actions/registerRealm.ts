import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import BN from 'bn.js'
import {
  GovernanceConfig,
  MintMaxVoteWeightSource,
  VoteThresholdPercentage,
  VoteWeightSource,
} from '../models/accounts'
import { withCreateRealm } from '../models/withCreateRealm'
import { RpcContext } from '../models/core/api'
import { sendTransaction } from '../utils/send'
import { ProgramVersion } from '@models/registry/constants'
import {
  sendTransactions,
  SequenceType,
  WalletSigner,
} from 'utils/sendTransactions'
import { withCreateMint } from '@tools/sdk/splToken/withCreateMint'
import { withCreateAssociatedTokenAccount } from '@tools/sdk/splToken/withCreateAssociatedTokenAccount'
import { withMintTo } from '@tools/sdk/splToken/withMintTo'
import { chunks } from '@utils/helpers'
import { WalletConnectionError } from '@solana/wallet-adapter-base'
import { withDepositGoverningTokens } from '@models/withDepositGoverningTokens'
import {
  getMintNaturalAmountFromDecimal,
  getTimestampFromDays,
} from '@tools/sdk/units'
import { withCreateMintGovernance } from '@models/withCreateMintGovernance'
import { withSetRealmAuthority } from '@models/withSetRealmAuthority'

/* 
  TODO: Check if the abstractions present here can be moved to a 
  separate util and replace some of the repeating code over the project
*/

/**
 * The default minimum amount of community tokens to create governance
 */
const MIN_COMM_TOKENS_TO_CREATE_GOV = 1000000

/**
 * The default amount of decimals for the community token
 */
const COMM_MINT_DECIMALS = 6

/**
 * Prepares the council instructions
 * @param connection
 * @param walletPubkey
 * @param councilMint
 * @param councilWalletPks
 */
async function prepareCouncilInstructions(
  connection: Connection,
  walletPubkey: PublicKey,
  councilMint?: PublicKey,
  councilWalletPks?: PublicKey[]
) {
  console.debug('preparing council instructions')

  let councilMintPk: PublicKey | undefined = undefined
  let walletAtaPk: PublicKey | undefined
  const councilMintInstructions: TransactionInstruction[] = []
  const councilMintSigners: Keypair[] = []

  // If the array of council wallets is not empty
  // then should create mints to the council
  if (councilWalletPks && councilWalletPks.length) {
    // If councilMint is undefined, then
    // should create the council mint
    councilMintPk =
      councilMint ??
      (await withCreateMint(
        connection,
        councilMintInstructions,
        councilMintSigners,
        walletPubkey,
        null,
        0,
        walletPubkey
      ))

    for (const teamWalletPk of councilWalletPks) {
      const ataPk = await withCreateAssociatedTokenAccount(
        councilMintInstructions,
        councilMintPk,
        teamWalletPk,
        walletPubkey
      )

      // Mint 1 council token to each team member
      await withMintTo(
        councilMintInstructions,
        councilMintPk,
        ataPk,
        walletPubkey,
        1
      )

      if (teamWalletPk.equals(walletPubkey)) {
        walletAtaPk = ataPk
      }
    }
  }

  const councilMembersChunks = chunks(councilMintInstructions, 10)
  // I tried to left as an empty array, but always get failed in signature verification
  const councilSignersChunks = Array(councilMembersChunks.length).fill(
    councilMintSigners
  )

  return {
    councilMintPk,
    walletAtaPk,
    councilMembersChunks,
    councilSignersChunks,
  }
}

/**
 * Prepares the instructions to create a community mint
 *
 * > This should be called if a community mint is not provided.
 * @param connection the current connection
 * @param walletPubkey payeer
 * @returns
 */
async function prepareCommunityInstructions(
  connection: Connection,
  walletPubkey: PublicKey
) {
  console.debug('preparing community instructions')

  const communityMintInstructions: TransactionInstruction[] = []
  const communityMintSigners: Keypair[] = []
  // Create community mint
  const communityMintPk = await withCreateMint(
    connection,
    communityMintInstructions,
    communityMintSigners,
    walletPubkey,
    null,
    COMM_MINT_DECIMALS,
    walletPubkey
  )

  return {
    communityMintPk,
    communityMintInstructions,
    communityMintSigners,
  }
}

/**
 * Creates a default governance config object
 * @param yesVoteThreshold
 * @returns
 */
function mountGovernanceConfig(yesVoteThreshold = 60): GovernanceConfig {
  console.debug('mounting governance config')

  const minCommunityTokensToCreateAsMintValue = new BN(
    getMintNaturalAmountFromDecimal(
      MIN_COMM_TOKENS_TO_CREATE_GOV,
      COMM_MINT_DECIMALS
    )
  )

  // Put community and council mints under the realm governance with default config
  return new GovernanceConfig({
    voteThresholdPercentage: new VoteThresholdPercentage({
      value: yesVoteThreshold,
    }),
    minCommunityTokensToCreateProposal: minCommunityTokensToCreateAsMintValue,
    // Do not use instruction hold up time
    minInstructionHoldUpTime: 0,
    // max voting time 3 days
    maxVotingTime: getTimestampFromDays(3),
    voteWeightSource: VoteWeightSource.Deposit,
    proposalCoolOffTime: 0,
    minCouncilTokensToCreateProposal: new BN(1),
  })
}

/**
 * Sets the governance instructions into the realm
 *
 * @param walletPubkey payeer wallet pub key
 * @param tokenMintPk the token mint to put under governance
 * @param yesVoteThreshold vote quorum
 * @param programId governance program id
 * @param realmPk realm pub key
 * @param tokenOwnerRecordPk
 * @param realmInstructions realm instructions array
 */
async function prepareGovernanceInstructions(
  walletPubkey: PublicKey,
  councilMintPk: PublicKey,
  communityMintPk: PublicKey,
  yesVoteThreshold: number,
  programId: PublicKey,
  realmPk: PublicKey,
  tokenOwnerRecordPk: PublicKey,
  realmInstructions: TransactionInstruction[]
) {
  console.debug('Preparing governance instructions')
  const config = mountGovernanceConfig(yesVoteThreshold)

  const {
    governanceAddress: communityMintGovPk,
  } = await withCreateMintGovernance(
    realmInstructions,
    programId,
    realmPk,
    communityMintPk,
    config,
    walletPubkey as any, // TODO: is it right? Shouldn't it be !! or a true boolean?
    walletPubkey,
    tokenOwnerRecordPk,
    walletPubkey
  )

  await withCreateMintGovernance(
    realmInstructions,
    programId,
    realmPk,
    councilMintPk,
    config,
    walletPubkey as any,
    walletPubkey,
    tokenOwnerRecordPk,
    walletPubkey
  )

  // Set the community governance as the realm authority
  withSetRealmAuthority(
    realmInstructions,
    programId,
    realmPk,
    walletPubkey,
    communityMintGovPk
  )
}

/**
 * Factories the send transaction method according to the parameters
 * @param wallet the payeer
 * @param connection current connection
 * @param councilMembersChunks Chunks of council members instructions
 * @param councilSignersChunks Chunks of council signers
 * @param communityMintInstructions Community mint instructions
 * @param communityMintSigners Community mint signers
 * @param realmInstructions Realm instructions
 * @returns a promise to be executed.
 */
function sendTransactionFactory(
  wallet: WalletSigner,
  connection: Connection,
  councilMembersChunks: TransactionInstruction[][],
  councilSignersChunks: Keypair[][],
  realmInstructions: TransactionInstruction[],
  communityMintInstructions?: TransactionInstruction[],
  communityMintSigners?: Keypair[]
) {
  console.debug('factoring sendtransaction')

  const instructions: TransactionInstruction[][] = [realmInstructions]
  const signerSets: Keypair[][] = [[]]

  if (councilMembersChunks.length) {
    instructions.unshift(...councilMembersChunks)
    signerSets.unshift(...councilSignersChunks)
  }

  if (communityMintInstructions && communityMintSigners) {
    instructions.unshift(communityMintInstructions)
    signerSets.unshift(communityMintSigners)
  }

  if (instructions.length > 1) {
    return sendTransactions(
      connection,
      wallet,
      instructions,
      signerSets,
      SequenceType.Sequential
    )
  } else {
    const transaction = new Transaction()
    transaction.add(...realmInstructions)
    return sendTransaction({ transaction, wallet, connection })
  }
}

export async function registerRealm(
  { connection, wallet, walletPubkey }: RpcContext,
  programId: PublicKey,
  programVersion: ProgramVersion,
  name: string,
  communityMint: PublicKey | undefined,
  councilMint: PublicKey | undefined,
  communityMintMaxVoteWeightSource: MintMaxVoteWeightSource,
  minCommunityTokensToCreateGovernance: BN,
  yesVoteThreshold = 60,
  councilWalletPks?: PublicKey[]
): Promise<PublicKey> {
  if (!wallet) throw WalletConnectionError
  console.debug('starting register realm')

  const realmInstructions: TransactionInstruction[] = []

  const {
    councilMintPk,
    walletAtaPk,
    councilMembersChunks,
    councilSignersChunks,
  } = await prepareCouncilInstructions(
    connection,
    walletPubkey,
    councilMint,
    councilWalletPks
  )

  let communityMintInstructions:
    | TransactionInstruction[]
    | undefined = undefined
  let communityMintPk: PublicKey | undefined = communityMint
  let communityMintSigners: Keypair[] | undefined = undefined

  // If user doens't provides a community mint, we'll generate it
  if (!communityMint) {
    const communityDetails = await prepareCommunityInstructions(
      connection,
      walletPubkey
    )
    communityMintInstructions = communityDetails.communityMintInstructions
    communityMintPk = communityDetails.communityMintPk
    communityMintSigners = communityDetails.communityMintSigners
  }

  if (!communityMintPk) throw new Error('Invalid community mint public key.')

  const realmAddress = await withCreateRealm(
    realmInstructions,
    programId,
    programVersion,
    name,
    walletPubkey,
    communityMintPk,
    walletPubkey,
    councilMintPk,
    communityMintMaxVoteWeightSource,
    minCommunityTokensToCreateGovernance,
    undefined
  )

  let tokenOwnerRecordPk: PublicKey | undefined = undefined

  // If the current wallet is in the team then deposit the council token
  if (councilMintPk) {
    if (walletAtaPk) {
      tokenOwnerRecordPk = await withDepositGoverningTokens(
        realmInstructions,
        programId,
        realmAddress,
        walletAtaPk,
        councilMintPk,
        walletPubkey,
        walletPubkey,
        walletPubkey
      )
    } else {
      // Let's throw for now if the current wallet isn't in the team
      // TODO: To fix it we would have to make it temp. as part of the team and then remove after the realm is created
      throw new Error('Current wallet must be in the team')
    }
  }

  // Checks if the council AND community tokens were generated by us
  // and put them under governance
  if (tokenOwnerRecordPk && councilMintPk && communityMintInstructions) {
    await prepareGovernanceInstructions(
      walletPubkey,
      councilMintPk,
      communityMintPk,
      yesVoteThreshold,
      programId,
      realmAddress,
      tokenOwnerRecordPk,
      realmInstructions
    )
  }

  const txnToSend = sendTransactionFactory(
    wallet,
    connection,
    councilMembersChunks,
    councilSignersChunks,
    realmInstructions,
    communityMintInstructions,
    communityMintSigners
  )
  console.debug('sending transaction')
  await txnToSend
  console.debug('transaction sent')

  return realmAddress
}
