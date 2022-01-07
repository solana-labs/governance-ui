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
import {
  SignerWalletAdapter,
  WalletConnectionError,
} from '@solana/wallet-adapter-base'
import { withDepositGoverningTokens } from '@models/withDepositGoverningTokens'
import {
  getMintNaturalAmountFromDecimal,
  getTimestampFromDays,
} from '@tools/sdk/units'
import { withCreateMintGovernance } from '@models/withCreateMintGovernance'
import { withSetRealmAuthority } from '@models/withSetRealmAuthority'
import { AccountInfo } from '@solana/spl-token'
import { ProgramAccount } from '@project-serum/common'
import { tryGetAta } from '@utils/validations'
import { ConnectionContext } from '@utils/connection'

/* 
  TODO: Check if the abstractions present here can be moved to a 
  separate util and replace some of the repeating code over the project
  and reduce the code complexity
*/

interface RegisterRealmRpc {
  connection: ConnectionContext
  wallet: SignerWalletAdapter
  walletPubkey: PublicKey
}

/**
 * The minimum amount of community tokens to create governance and proposals, for tokens with 0 supply
 */
export const MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY = 1000000

/**
 * The default amount of decimals for the community token
 */
export const COMMUNITY_MINT_DECIMALS = 6

/**
 * Prepares the mint instructions
 *
 * If `otherOwners` is given, then the token will be minted (1) to each wallet.
 * This option is usually used when using council.
 *
 * @param connection
 * @param walletPubkey
 * @param tokenDecimals
 * @param council if it is council, avoid creating the mint if otherowners is not filled
 * @param mintPk
 * @param otherOwners
 */
async function prepareMintInstructions(
  connection: ConnectionContext,
  walletPubkey: PublicKey,
  tokenDecimals: number,
  council = false,
  mintPk?: PublicKey,
  otherOwners?: PublicKey[]
) {
  console.debug('preparing mint instructions')

  let _mintPk: PublicKey | undefined = undefined
  let walletAtaPk: PublicKey | undefined
  const mintInstructions: TransactionInstruction[] = []
  const mintSigners: Keypair[] = []

  if (!council || (council && otherOwners?.length)) {
    // If mintPk is undefined, then
    // should create the mint
    _mintPk =
      mintPk ??
      (await withCreateMint(
        connection.current,
        mintInstructions,
        mintSigners,
        walletPubkey,
        null,
        tokenDecimals,
        walletPubkey
      ))

    // If the array of other owners is not empty
    // then should create mints to them
    if (otherOwners?.length) {
      for (const ownerPk of otherOwners) {
        const ata: ProgramAccount<AccountInfo> | undefined = await tryGetAta(
          connection,
          ownerPk,
          _mintPk
        )
        const shouldMint = !ata?.account.amount.gt(new BN(0))

        const ataPk =
          ata?.publicKey ??
          (await withCreateAssociatedTokenAccount(
            mintInstructions,
            _mintPk,
            ownerPk,
            walletPubkey
          ))

        // Mint 1 token to each owner
        if (shouldMint && ataPk) {
          console.debug('will mint to ', { ataPk })
          await withMintTo(mintInstructions, _mintPk, ataPk, walletPubkey, 1)
        }

        if (ownerPk.equals(walletPubkey)) {
          walletAtaPk = ataPk
        }
      }
    }
  }

  const instructionChunks = chunks(mintInstructions, 10)
  // I tried to left as an empty array, but always get failed in signature verification
  const signersChunks = Array(instructionChunks.length).fill([])
  signersChunks[0] = mintSigners
  return {
    mintPk: _mintPk,
    walletAtaPk,
    /**
     * Mint instructions in chunks of 10
     */
    instructionChunks,
    /**
     * Signer sets in chunks of 10
     */
    signersChunks,
    /**
     * Array with all the instructions
     */
    mintInstructions,
    /**
     * Array with all the signer sets
     */
    mintSigners,
  }
}

/**
 * Creates a default governance config object
 * @param yesVoteThreshold
 * @returns
 */
function mountGovernanceConfig(
  yesVoteThreshold = 60,
  tokenDecimals?: number,
  minCommunityTokensToCreateGovernance?: string
): GovernanceConfig {
  console.debug('mounting governance config')

  const minCommunityTokensToCreateAsMintValue = new BN(
    getMintNaturalAmountFromDecimal(
      minCommunityTokensToCreateGovernance &&
        +minCommunityTokensToCreateGovernance > 0
        ? +minCommunityTokensToCreateGovernance
        : MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY,
      tokenDecimals ?? COMMUNITY_MINT_DECIMALS
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
  councilMintPk: PublicKey | undefined,
  communityMintPk: PublicKey,
  communityTokenDecimals: number | undefined,
  yesVoteThreshold: number,
  minCommunityTokensToCreateGovernance: string,
  programId: PublicKey,
  realmPk: PublicKey,
  tokenOwnerRecordPk: PublicKey,
  realmInstructions: TransactionInstruction[],
  transferAuthority?: boolean
) {
  console.debug('Preparing governance instructions')

  const config = mountGovernanceConfig(
    yesVoteThreshold,
    communityTokenDecimals,
    minCommunityTokensToCreateGovernance
  )

  if (transferAuthority) {
    console.debug('transfer community mint authority')
    const {
      governanceAddress: communityMintGovPk,
    } = await withCreateMintGovernance(
      realmInstructions,
      programId,
      realmPk,
      communityMintPk,
      config,
      true,
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

  if (councilMintPk)
    // Put council token mint under realm governance
    await withCreateMintGovernance(
      realmInstructions,
      programId,
      realmPk,
      councilMintPk,
      config,
      true,
      walletPubkey,
      tokenOwnerRecordPk,
      walletPubkey
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

/**
 * Performs the necessary operations to register a realm, including:
 *
 *  - Create community mint instructions (if eligible)
 *  - Create council mint instructions (if eligible)
 *  - Deposit owner goverance tokens instruction (if eligible)
 *  - Create governance config
 *  - Create ATAs instructions
 *  - Create realm instruction
 *
 * @param RpcContext
 * @param programId Pubkey of the governance program
 * @param programVersion
 * @param name The name of the realm
 * @param communityMint the community mint id
 * @param councilMint the council mint id
 * @param communityMintMaxVoteWeightSource
 * @param minCommunityTokensToCreateGovernance Minimum amount of community tokens to create a governance
 * @param yesVoteThreshold minimum percentage of yes votes to the proposal to pass
 * @param transferAuthority if set to true, will transfer the authority of the community token to the realm
 * @param communityMintTokenDecimals Token amount decimals
 * @param councilWalletPks Array of wallets of the council/team
 */
export async function registerRealm(
  { connection, wallet, walletPubkey }: RegisterRealmRpc,
  programId: PublicKey,
  programVersion: ProgramVersion,
  name: string,
  communityMint: PublicKey | undefined,
  councilMint: PublicKey | undefined,
  communityMintMaxVoteWeightSource: MintMaxVoteWeightSource,
  minCommunityTokensToCreateGovernance: string,
  yesVoteThreshold = 60,
  transferAuthority = true,
  communityMintTokenDecimals?: number,
  councilWalletPks?: PublicKey[]
): Promise<PublicKey> {
  if (!wallet) throw WalletConnectionError
  console.debug('starting register realm')

  const realmInstructions: TransactionInstruction[] = []

  const {
    mintPk: councilMintPk,
    walletAtaPk,
    instructionChunks: councilMembersChunks,
    signersChunks: councilSignersChunks,
  } = await prepareMintInstructions(
    connection,
    walletPubkey,
    0,
    true,
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
    const communityDetails = await prepareMintInstructions(
      connection,
      walletPubkey,
      COMMUNITY_MINT_DECIMALS
    )
    communityMintInstructions = communityDetails.mintInstructions
    communityMintPk = communityDetails.mintPk
    communityMintSigners = communityDetails.mintSigners
  }

  if (!communityMintPk) throw new Error('Invalid community mint public key.')

  const _minCommunityTokensToCreateGovernance = new BN(
    getMintNaturalAmountFromDecimal(
      minCommunityTokensToCreateGovernance &&
        +minCommunityTokensToCreateGovernance > 0
        ? +minCommunityTokensToCreateGovernance
        : MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY,
      communityMintTokenDecimals ?? COMMUNITY_MINT_DECIMALS
    )
  )

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
    _minCommunityTokensToCreateGovernance,
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

  // Checks if the council token was generated by us and if transferAuthority is true
  // then put them under governance
  if (tokenOwnerRecordPk) {
    await prepareGovernanceInstructions(
      walletPubkey,
      councilMintPk,
      communityMintPk,
      communityMintTokenDecimals,
      yesVoteThreshold,
      minCommunityTokensToCreateGovernance,
      programId,
      realmAddress,
      tokenOwnerRecordPk,
      realmInstructions,
      transferAuthority
    )
  }

  const txnToSend = sendTransactionFactory(
    wallet,
    connection.current,
    councilMembersChunks,
    councilSignersChunks,
    realmInstructions,
    communityMintInstructions,
    communityMintSigners
  )
  console.debug('sending transaction')
  await txnToSend
  console.debug('transaction sent')
  console.debug({
    communityMintPk,
    councilMintPk,
  })
  return realmAddress
}
