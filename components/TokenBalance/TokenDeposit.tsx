import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintInfo,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import BN from 'bn.js'
import useRealm from '@hooks/useRealm'
import {
  getProposal,
  GoverningTokenType,
  ProposalState,
} from '@solana/spl-governance'
import { getUnrelinquishedVoteRecords } from '@models/api'
import { withRelinquishVote } from '@solana/spl-governance'
import { withWithdrawGoverningTokens } from '@solana/spl-governance'
import { sendTransaction } from '@utils/send'
import { SecondaryButton } from '../Button'
import { GoverningTokenRole } from '@solana/spl-governance'
import { fmtMintAmount } from '@tools/sdk/units'
import { getMintMetadata } from '../instructions/programs/splToken'
import { withFinalizeVote } from '@solana/spl-governance'
import { chunks } from '@utils/helpers'
import { getProgramVersionForRealm } from '@models/registry/api'
import { notify } from '@utils/notifications'
import { ExclamationIcon } from '@heroicons/react/outline'
import { useEffect } from 'react'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { VSR_PLUGIN_PKS } from '@constants/plugins'
import { useMaxVoteRecord } from '@hooks/useMaxVoteRecord'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import {
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import { fetchGovernanceByPubkey } from '@hooks/queries/governance'
import { useConnection } from '@solana/wallet-adapter-react'
import queryClient from '@hooks/queries/queryClient'
import { proposalQueryKeys } from '@hooks/queries/proposal'
import asFindable from '@utils/queries/asFindable'
import VanillaVotingPower from '@components/GovernancePower/Vanilla/VanillaVotingPower'
import { fetchTokenAccountByPubkey } from '@hooks/queries/tokenAccount'
import { DepositTokensButton } from '@components/DepositTokensButton'

export const TokenDeposit = ({
  mint,
  tokenRole,
  councilVote,
  inAccountDetails,
  setHasGovPower,
}: {
  mint: MintInfo | undefined
  tokenRole: GoverningTokenRole
  councilVote?: boolean
  inAccountDetails?: boolean
  setHasGovPower?: (hasGovPower: boolean) => void
}) => {
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const { connection } = useConnection()

  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )

  const maxVoterWeight = useMaxVoteRecord()?.pubkey || undefined
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data?.result
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result

  const relevantTokenConfig =
    tokenRole === GoverningTokenRole.Community
      ? config?.account.communityTokenConfig
      : config?.account.councilTokenConfig
  const isMembership =
    relevantTokenConfig?.tokenType === GoverningTokenType.Membership

  const {
    realmInfo,
    realmTokenAccount,
    councilTokenAccount,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()

  const depositTokenRecord =
    tokenRole === GoverningTokenRole.Community
      ? ownTokenRecord
      : ownCouncilTokenRecord

  const depositTokenAccount =
    tokenRole === GoverningTokenRole.Community
      ? realmTokenAccount
      : councilTokenAccount

  const depositMint =
    tokenRole === GoverningTokenRole.Community
      ? realm?.account.communityMint
      : realm?.account.config.councilMint

  const tokenName = getMintMetadata(depositMint)?.name ?? realm?.account.name

  const depositTokenName = `${tokenName} ${
    tokenRole === GoverningTokenRole.Community ? '' : 'Council'
  }`

  const withdrawAllTokens = async function () {
    const instructions: TransactionInstruction[] = []
    // If there are unrelinquished votes for the voter then let's release them in the same instruction as convenience
    if (depositTokenRecord!.account!.unrelinquishedVotesCount > 0) {
      const voteRecords = await getUnrelinquishedVoteRecords(
        connection,
        realmInfo!.programId,
        depositTokenRecord!.account!.governingTokenOwner
      )

      for (const voteRecord of Object.values(voteRecords)) {
        const proposalQuery = await queryClient.fetchQuery({
          queryKey: proposalQueryKeys.byPubkey(
            connection.rpcEndpoint,
            voteRecord.account.proposal
          ),
          staleTime: 0,
          queryFn: () =>
            asFindable(() =>
              getProposal(connection, voteRecord.account.proposal)
            )(),
        })
        const proposal = proposalQuery.result
        if (!proposal) {
          continue
        }

        if (proposal.account.state === ProposalState.Voting) {
          if (proposal.account.state === ProposalState.Voting) {
            const governance = (
              await fetchGovernanceByPubkey(
                connection,
                proposal.account.governance
              )
            ).result
            if (!governance) throw new Error('failed to fetch governance')
            if (proposal.account.getTimeToVoteEnd(governance.account) > 0) {
              // Note: It's technically possible to withdraw the vote here but I think it would be confusing and people would end up unconsciously withdrawing their votes
              notify({
                type: 'error',
                message: `Can't withdraw tokens while Proposal ${proposal.account.name} is being voted on. Please withdraw your vote first`,
              })
              throw new Error(
                `Can't withdraw tokens while Proposal ${proposal.account.name} is being voted on. Please withdraw your vote first`
              )
            } else {
              // finalize proposal before withdrawing tokens so we don't stop the vote from succeeding
              await withFinalizeVote(
                instructions,
                realmInfo!.programId,
                getProgramVersionForRealm(realmInfo!),
                realm!.pubkey,
                proposal.account.governance,
                proposal.pubkey,
                proposal.account.tokenOwnerRecord,
                proposal.account.governingTokenMint,
                maxVoterWeight
              )
            }
          }
        }
        // Note: We might hit single transaction limits here (accounts and size) if user has too many unrelinquished votes
        // It's not going to be an issue for now due to the limited number of proposals so I'm leaving it for now
        // As a temp. work around I'm leaving the 'Release Tokens' button on finalized Proposal to make it possible to release the tokens from one Proposal at a time
        await withRelinquishVote(
          instructions,
          realmInfo!.programId,
          realmInfo!.programVersion!,
          realmInfo!.realmId,
          proposal.account.governance,
          proposal.pubkey,
          depositTokenRecord!.pubkey,
          proposal.account.governingTokenMint,
          voteRecord.pubkey,
          depositTokenRecord!.account.governingTokenOwner,
          wallet!.publicKey!
        )
        await client.withRelinquishVote(
          instructions,
          proposal,
          voteRecord.pubkey,
          depositTokenRecord!.pubkey
        )
      }
    }

    const ataPk = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      depositMint!,
      wallet!.publicKey!,
      true
    )
    const ata = await fetchTokenAccountByPubkey(connection, ataPk)

    if (!ata.found) {
      const ataIx = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        depositMint!,
        ataPk,
        wallet!.publicKey!,
        wallet!.publicKey! // fee payer
      )
      instructions.push(ataIx)
    }

    await withWithdrawGoverningTokens(
      instructions,
      realmInfo!.programId,
      realmInfo!.programVersion!,
      realm!.pubkey,
      depositTokenAccount?.publicKey
        ? depositTokenAccount!.publicKey
        : new PublicKey(ataPk),
      depositTokenRecord!.account.governingTokenMint,
      wallet!.publicKey!
    )

    try {
      // use chunks of 8 here since we added finalize,
      // because previously 9 withdraws used to fit into one tx
      const ixChunks = chunks(instructions, 8)
      for (const [index, chunk] of ixChunks.entries()) {
        const transaction = new Transaction().add(...chunk)
        await sendTransaction({
          connection,
          wallet: wallet!,
          transaction,
          sendingMessage:
            index == ixChunks.length - 1
              ? 'Withdrawing tokens'
              : `Releasing tokens (${index}/${ixChunks.length - 2})`,
          successMessage:
            index == ixChunks.length - 1
              ? 'Tokens have been withdrawn'
              : `Released tokens (${index}/${ixChunks.length - 2})`,
        })
      }
    } catch (ex) {
      //TODO change to more friendly notification
      notify({ type: 'error', message: `${ex}` })
      console.error("Can't withdraw tokens", ex)
    }
  }

  const hasTokensInWallet =
    depositTokenAccount && depositTokenAccount.account.amount.gt(new BN(0))

  const hasTokensDeposited =
    depositTokenRecord &&
    depositTokenRecord.account.governingTokenDepositAmount.gt(new BN(0))

  const withdrawTooltipContent = !connected
    ? 'Connect your wallet to withdraw'
    : !hasTokensDeposited
    ? "You don't have any tokens deposited to withdraw."
    : !councilVote &&
      (toManyCouncilOutstandingProposalsForUse ||
        toManyCommunityOutstandingProposalsForUser)
    ? 'You have to many outstanding proposals to withdraw.'
    : ''

  const availableTokens =
    depositTokenRecord && mint
      ? fmtMintAmount(
          mint,
          depositTokenRecord.account.governingTokenDepositAmount
        )
      : '0'

  useEffect(() => {
    if (availableTokens != '0' || hasTokensDeposited || hasTokensInWallet) {
      if (setHasGovPower) setHasGovPower(true)
    }
  }, [availableTokens, hasTokensDeposited, hasTokensInWallet, setHasGovPower])

  const canShowAvailableTokensMessage = hasTokensInWallet && connected
  const tokensToShow =
    hasTokensInWallet && depositTokenAccount
      ? fmtMintAmount(mint, depositTokenAccount.account.amount)
      : hasTokensInWallet
      ? availableTokens
      : 0
  const isVsr =
    config?.account.communityTokenConfig.voterWeightAddin &&
    VSR_PLUGIN_PKS.includes(
      config?.account.communityTokenConfig.voterWeightAddin.toBase58()
    ) &&
    tokenRole === GoverningTokenRole.Community

  // Do not show deposits for mints with zero supply because nobody can deposit anyway
  if (!mint || mint.supply.isZero()) {
    return null
  }

  return (
    <div className="w-full">
      {(availableTokens != '0' || inAccountDetails) && (
        <div className="flex items-center space-x-4">
          {tokenRole === GoverningTokenRole.Community ? (
            <VanillaVotingPower className="w-full" role="community" />
          ) : (
            <VanillaVotingPower className="w-full" role="council" />
          )}
        </div>
      )}

      {
        <>
          <div
            className={`my-4 opacity-70 text-xs  ${
              canShowAvailableTokensMessage ? 'block' : 'hidden'
            }`}
          >
            You have {tokensToShow} {hasTokensDeposited ? `more ` : ``}
            {depositTokenName} tokens available to deposit.
          </div>

          <div className="flex flex-col mt-6 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            {hasTokensInWallet || inAccountDetails ? (
              <DepositTokensButton
                className="sm:w-1/2 max-w-[200px]"
                role={
                  tokenRole === GoverningTokenRole.Community
                    ? 'community'
                    : 'council'
                }
                as={inAccountDetails ? 'primary' : 'secondary'}
              />
            ) : null}
            {!isMembership && // Membership tokens can't be withdrawn (that is their whole point, actually)
              (inAccountDetails || isVsr) && (
                <SecondaryButton
                  tooltipMessage={withdrawTooltipContent}
                  className="sm:w-1/2 max-w-[200px]"
                  disabled={
                    !connected ||
                    !hasTokensDeposited ||
                    (!councilVote &&
                      toManyCommunityOutstandingProposalsForUser) ||
                    toManyCouncilOutstandingProposalsForUse ||
                    wallet?.publicKey?.toBase58() !==
                      depositTokenRecord.account.governingTokenOwner.toBase58()
                  }
                  onClick={withdrawAllTokens}
                >
                  Withdraw
                </SecondaryButton>
              )}
          </div>
        </>
      }
      {isVsr && (
        <small className="flex items-center mt-3 text-xs">
          <ExclamationIcon className="w-5 h-5 mr-2"></ExclamationIcon>
          Please withdraw your tokens and deposit again to get governance power
        </small>
      )}
    </div>
  )
}
