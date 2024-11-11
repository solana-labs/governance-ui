import ReactMarkdown from 'react-markdown/react-markdown.min'
import remarkGfm from 'remark-gfm'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { useProposalGovernanceQuery } from 'hooks/useProposal'
import ProposalStateBadge from '@components/ProposalStateBadge'
import { TransactionPanel } from '@components/instructions/TransactionPanel'
import DiscussionPanel from 'components/chat/DiscussionPanel'
import VotePanel from '@components/VotePanel'
import { ApprovalProgress, VetoProgress } from '@components/QuorumProgress'
import useRealm from 'hooks/useRealm'
import useProposalVotes from 'hooks/useProposalVotes'
import ProposalTimeStatus from 'components/ProposalTimeStatus'
import { useEffect, useState } from 'react'
import ProposalActionsPanel from '@components/ProposalActions'
import { getRealmExplorerHost } from 'tools/routing'
import {
  GovernanceAccountType,
  ProposalState,
  VoteType,
} from '@solana/spl-governance'
import VoteResultStatus from '@components/VoteResultStatus'
import VoteResults from '@components/VoteResults'
import MultiChoiceVotes from '@components/MultiChoiceVotes'
import { resolveProposalDescription } from '@utils/helpers'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import Link from 'next/link'
import useQueryContext from '@hooks/useQueryContext'
import { ChevronRightIcon } from '@heroicons/react/solid'
import ProposalExecutionCard from '@components/ProposalExecutionCard'
import ProposalVotingPower from '@components/ProposalVotingPower'
import { useMediaQuery } from 'react-responsive'
import NftProposalVoteState from 'NftVotePlugin/NftProposalVoteState'
import ProposalWarnings from './ProposalWarnings'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import VotingRules from '@components/VotingRules'
import { useRouteProposalQuery } from '@hooks/queries/proposal'
import { AddToCalendarButton } from 'add-to-calendar-button-react'
import { CalendarAdd } from '@carbon/icons-react'
import Modal from '@components/Modal'
import dayjs from 'dayjs'
import { useConnection } from '@solana/wallet-adapter-react'
import { useTokenOwnerRecordByPubkeyQuery } from '@hooks/queries/tokenOwnerRecord'

const Proposal = () => {
  const { realmInfo, symbol } = useRealm()
  const proposal = useRouteProposalQuery().data?.result
  const governance = useProposalGovernanceQuery().data?.result
  const tor = useTokenOwnerRecordByPubkeyQuery(proposal?.account.tokenOwnerRecord).data?.result
  const { connection } = useConnection()
  const descriptionLink = proposal?.account.descriptionLink
  const allowDiscussion = realmInfo?.allowDiscussion ?? true
  const isMulti =
    proposal?.account.voteType !== VoteType.SINGLE_CHOICE &&
    proposal?.account.accountType === GovernanceAccountType.ProposalV2

  const [openCalendarModal, setOpenCalendarModal] = useState(false)
  const [description, setDescription] = useState('')
  const voteData = useProposalVotes(proposal?.account)
  const currentWallet = useWalletOnePointOh()
  const showResults =
    proposal &&
    proposal.account.state !== ProposalState.Cancelled &&
    proposal.account.state !== ProposalState.Draft

  const votingEnded =
    !!governance &&
    !!proposal &&
    proposal.account.getTimeToVoteEnd(governance.account) < 0

  const isTwoCol = useMediaQuery({ query: '(min-width: 768px)' })

  useEffect(() => {
    const handleResolveDescription = async () => {
      const description = await resolveProposalDescription(descriptionLink!)
      setDescription(description)
    }
    if (descriptionLink) {
      handleResolveDescription()
    } else {
      setDescription('')
    }
  }, [descriptionLink])

  const proposedBy =
    proposal &&
    tor?.account.governingTokenOwner.toBase58()

  const { fmtUrlWithCluster } = useQueryContext()
  const showTokenBalance = proposal
    ? proposal.account.state === ProposalState.Draft ||
      proposal.account.state === ProposalState.SigningOff ||
      (proposal.account.state === ProposalState.Voting && !votingEnded)
    : true
  const showProposalExecution =
    proposal &&
    (proposal.account.state === ProposalState.Succeeded ||
      proposal.account.state === ProposalState.Executing ||
      proposal.account.state === ProposalState.ExecutingWithErrors)

  const votingTimeEnds =
    proposal?.account.signingOffAt &&
    governance &&
    proposal.account.signingOffAt.toNumber() +
      governance.account.config.baseVotingTime

  const coolOffTimeEnds =
    proposal?.account.signingOffAt &&
    governance &&
    proposal.account.signingOffAt.toNumber() +
      governance.account.config.baseVotingTime +
      governance.account.config.votingCoolOffTime

  return (
    <div className="grid grid-cols-12 gap-4 overflow-y-auto">
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12 md:col-span-7 lg:col-span-8 space-y-3">
        {proposal ? (
          <>
            <div className="flex flex-items justify-between">
              <PreviousRouteBtn />
              <div className="flex items-center">
                <a
                  href={`https://${getRealmExplorerHost(
                    realmInfo
                  )}/account/${proposal.pubkey.toBase58()}${
                    connection.rpcEndpoint.includes('devnet')
                      ? '?cluster=devnet'
                      : ''
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
                </a>
              </div>
            </div>

            <div className="py-4">
              <div className="flex items-center justify-between mb-1">
                <h1 className="mr-2 overflow-wrap-anywhere">
                  {proposal?.account.name}
                </h1>
                <ProposalStateBadge proposal={proposal.account} />
              </div>
              {proposedBy && (
                <p className="text-[10px]">
                  Proposed by:{' '}
                  {tor?.account.governingTokenOwner.toBase58()}
                </p>
              )}
            </div>

            {description && (
              <div className="pb-2">
                <ReactMarkdown
                  className="markdown"
                  linkTarget="_blank"
                  remarkPlugins={[remarkGfm]}
                >
                  {description}
                </ReactMarkdown>
              </div>
            )}
            {proposal.account && (
              <ProposalWarnings proposal={proposal.account} />
            )}
            <TransactionPanel />
            {isTwoCol && allowDiscussion && <DiscussionPanel />}
          </>
        ) : (
          <>
            <div className="animate-pulse bg-bkg-3 h-12 rounded-lg" />
            <div className="animate-pulse bg-bkg-3 h-64 rounded-lg" />
            <div className="animate-pulse bg-bkg-3 h-64 rounded-lg" />
          </>
        )}
      </div>

      <div className="col-span-12 md:col-span-5 lg:col-span-4 space-y-4">
        <VotePanel />
        {showTokenBalance && <ProposalVotingPower />}
        {showResults ? (
          <div className="bg-bkg-2 rounded-lg">
            <div className="p-4 md:p-6">
              {proposal?.account.state === ProposalState.Voting ? (
                <div className="flex items-end justify-between mb-4">
                  <h3 className="mb-0 flex-row">
                    Voting Now
                    <CalendarAdd
                      onClick={() => setOpenCalendarModal(true)}
                      className="w-5"
                    ></CalendarAdd>
                    {openCalendarModal && (
                      <Modal
                        sizeClassName="sm:max-w-sm"
                        onClose={() => setOpenCalendarModal(false)}
                        isOpen={openCalendarModal}
                      >
                        <div>
                          <p>Remind me about voting time end</p>
                          {votingTimeEnds && (
                            <AddToCalendarButton
                              hideCheckmark
                              size="6|4|2"
                              name={`${realmInfo?.displayName} voting time for proposal: ${proposal.account.name} soon ends`}
                              location={`${window.location.pathname}`}
                              description={''}
                              startDate={dayjs
                                .unix(votingTimeEnds)
                                .format('YYYY-MM-DD')}
                              startTime={dayjs
                                .unix(votingTimeEnds)
                                .subtract(30, 'minute')
                                .format('HH:mm')}
                              endTime={dayjs
                                .unix(votingTimeEnds)
                                .format('HH:mm')}
                              options="Google"
                            />
                          )}
                        </div>
                        {governance?.account.config.votingCoolOffTime && (
                          <div>
                            <p>Remind me about cool off time end</p>
                            {coolOffTimeEnds && (
                              <AddToCalendarButton
                                hideCheckmark
                                size="6|4|2"
                                name={`${realmInfo?.displayName} cool off time for proposal: ${proposal.account.name} soon ends`}
                                location={`${window.location.pathname}`}
                                description={''}
                                startDate={dayjs
                                  .unix(coolOffTimeEnds)
                                  .format('YYYY-MM-DD')}
                                startTime={dayjs
                                  .unix(coolOffTimeEnds)
                                  .subtract(30, 'minute')
                                  .format('HH:mm')}
                                endTime={dayjs
                                  .unix(coolOffTimeEnds)
                                  .format('HH:mm')}
                                options="Google"
                              />
                            )}
                          </div>
                        )}
                      </Modal>
                    )}
                  </h3>
                  <ProposalTimeStatus proposal={proposal?.account} />
                </div>
              ) : (
                <h3 className="mb-4">Results</h3>
              )}
              {proposal?.account.state === ProposalState.Voting && !isMulti ? (
                <>
                  <div className="pb-3">
                    <ApprovalProgress
                      votesRequired={voteData.yesVotesRequired}
                      progress={voteData.yesVoteProgress}
                      showBg
                    />
                  </div>
                  {voteData._programVersion !== undefined &&
                  // @asktree: here is some typescript gore because typescript doesn't know that a number being > 3 means it isn't 1 or 2
                  voteData._programVersion !== 1 &&
                  voteData._programVersion !== 2 &&
                  voteData.veto !== undefined &&
                  (voteData.veto.voteProgress ?? 0) > 0 ? (
                    <div className="pb-3">
                      <VetoProgress
                        votesRequired={voteData.veto.votesRequired}
                        progress={voteData.veto.voteProgress}
                        showBg
                      />
                    </div>
                  ) : undefined}
                </>
              ) : (
                <div className="pb-3">
                  <VoteResultStatus />
                </div>
              )}

              {isMulti ? (
                <MultiChoiceVotes
                  proposal={proposal.account}
                  limit={proposal.account.options.length}
                />
              ) : (
                <VoteResults proposal={proposal.account} />
              )}
              {proposal && (
                <div className="flex justify-end mt-4">
                  <Link
                    href={fmtUrlWithCluster(
                      `/dao/${symbol}/proposal/${proposal.pubkey}/explore`
                    )}
                    passHref
                  >
                    <a className="text-sm flex items-center default-transition text-fgd-2 transition-all hover:text-fgd-3">
                      Explore
                      <ChevronRightIcon className="flex-shrink-0 h-6 w-6" />
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
        <VotingRules />
        <NftProposalVoteState proposal={proposal}></NftProposalVoteState>
        {proposal && currentWallet && showProposalExecution && (
          <ProposalExecutionCard />
        )}
        <ProposalActionsPanel />
        {!isTwoCol && proposal && allowDiscussion && (
          <div className="bg-bkg-2 rounded-lg p-4 md:p-6 ">
            <DiscussionPanel />
          </div>
        )}
      </div>
    </div>
  )
}

export default Proposal
