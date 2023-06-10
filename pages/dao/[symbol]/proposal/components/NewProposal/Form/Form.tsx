// import ChevronDownIcon from '@carbon/icons-react/lib/ChevronDown'
import type { PublicKey } from '@solana/web3.js'
// import { useState } from 'react'

// import { AdvancedOptions } from '../AdvancedOptions'
// import { CommunityDetails } from '../CommunityDetails'
// import { CouncilDetails } from '../CouncilDetails'
// import { CommunityRules, CouncilRules } from '../types'
// import { VotingDuration } from '../VotingDuration'
// import { WalletDescription } from '../WalletDescription'
// import cx from '@hub/lib/cx'
import { FormProps } from '@hub/types/FormProps'
import { ProposalRules } from '../ProposalRules'
import { ProposalType } from '../ProposalType'
import { useState } from 'react'
import { AddActions } from '../AddActions'
import { AddVotingChoices } from '../AddVotingChoices'

interface Props
  extends FormProps<{
    // communityRules: CommunityRules
    // councilRules: CouncilRules
    coolOffHours: number
    depositExemptProposalCount: number
    maxVoteDays: number
    minInstructionHoldupDays: number
  }> {
  className?: string
  //   initialCommunityRules: CommunityRules
  //   initialCouncilRules: CouncilRules
  governanceAddress?: PublicKey
  programVersion: number
  walletAddress?: PublicKey
}

function Form(props: Props & { title: string; description: string }) {
  const [isOnChainProposal, setIsOnChainProposal] = useState(true)
  console.log('form props', props)
  //   const [showCouncilOptions, setShowCouncilOptions] = useState(
  //     props.initialCouncilRules?.canVote || false
  //   )
  //   const [showCommunityOptions, setShowCommunityOptions] = useState(
  //     props.initialCommunityRules.canVote
  //   )
  //   const [showAdvanceOptions, setShowAdvanceOptions] = useState(false)
  //   const showCommunityFirst = props.initialCommunityRules.canVote

  return (
    <article className={props.className}>
      {/* {props.governanceAddress && props.walletAddress && (
        <WalletDescription
          className="mb-3"
          governanceAddress={props.governanceAddress}
          walletAddress={props.walletAddress}
        />
      )} */}
      <h1 className="text-5xl font-medium m-0 mb-4 dark:text-white ">
        {props.title}
      </h1>
      <p className="m-0 mb-16 dark:text-neutral-300">{props.description}</p>
      <div>
        <ProposalRules
          className="mb-8"
          coolOffHours={props.coolOffHours}
          maxVoteDays={props.maxVoteDays}
          programVersion={props.programVersion}
        />

        <ProposalType
          className="mb-8"
          setIsOnChainProposal={setIsOnChainProposal}
          isOnChainProposal={isOnChainProposal}
        />

        {isOnChainProposal ? (
          <AddActions className="mb-8" />
        ) : (
          <div>
            <AddVotingChoices className="mb-8" />
          </div>
        )}

        {/* <VotingDuration
          className="mb-8"
          coolOffHours={props.coolOffHours}
          maxVoteDays={props.maxVoteDays}
          programVersion={props.programVersion}
          onCoolOffHoursChange={props.onCoolOffHoursChange}
          onMaxVoteDaysChange={props.onMaxVoteDaysChange}
        /> */}
        {/* {showCommunityOptions && showCommunityFirst && (
          <CommunityDetails
            className="mb-8"
            communityRules={props.communityRules}
            initialCommunityRules={props.initialCommunityRules}
            initialCouncilRules={props.initialCouncilRules}
            programVersion={props.programVersion}
            onCommunityRulesChange={props.onCommunityRulesChange}
          />
        )} */}
        {/* {!props.initialCouncilRules?.canVote && props.initialCouncilRules && (
          <button
            className="flex items-center text-sm text-neutral-500 mt-16 mb-2.5"
            onClick={() => setShowCouncilOptions((cur) => !cur)}
          >
            Council Options{' '}
            <ChevronDownIcon
              className={cx(
                'fill-current',
                'h-4',
                'transition-transform',
                'w-4',
                showCouncilOptions && '-rotate-180'
              )}
            />
          </button>
        )} */}
        {/* {showCouncilOptions &&
          props.councilRules &&
          props.initialCouncilRules && (
            <CouncilDetails
              className="mb-8"
              councilRules={props.councilRules}
              initialCouncilRules={props.initialCouncilRules}
              initialCommunityRules={props.initialCommunityRules}
              programVersion={props.programVersion}
              onCouncilRulesChange={props.onCouncilRulesChange}
            />
          )} */}
        {/* {!props.initialCommunityRules.canVote && !showCommunityFirst && (
          <button
            className="flex items-center text-sm text-neutral-500 mt-16 mb-2.5"
            onClick={() => setShowCommunityOptions((cur) => !cur)}
          >
            Community Options{' '}
            <ChevronDownIcon
              className={cx(
                'fill-current',
                'h-4',
                'transition-transform',
                'w-4',
                showCommunityOptions && '-rotate-180'
              )}
            />
          </button>
        )} */}
        {/* {showCommunityOptions && !showCommunityFirst && (
          <CommunityDetails
            communityRules={props.communityRules}
            initialCommunityRules={props.initialCommunityRules}
            initialCouncilRules={props.initialCouncilRules}
            programVersion={props.programVersion}
            onCommunityRulesChange={props.onCommunityRulesChange}
          />
        )} */}
      </div>
      {/* <div className="mt-16">
        <button
          className="flex items-center text-sm text-neutral-500"
          onClick={() => setShowAdvanceOptions((cur) => !cur)}
        >
          Advanced Options{' '}
          <ChevronDownIcon
            className={cx(
              'fill-current',
              'h-4',
              'transition-transform',
              'w-4',
              showAdvanceOptions && '-rotate-180'
            )}
          />
        </button>
        {showAdvanceOptions && (
          <AdvancedOptions
            className="mt-2.5"
            depositExemptProposalCount={props.depositExemptProposalCount}
            minInstructionHoldupDays={props.minInstructionHoldupDays}
            programVersion={props.programVersion}
            onDepositExemptProposalCountChange={
              props.onDepositExemptProposalCountChange
            }
            onMinInstructionHoldupDaysChange={
              props.onMinInstructionHoldupDaysChange
            }
          />
        )}
      </div> */}
    </article>
  )
}

export const NewProposalForm = (
  props: Omit<Props, 'walletAddress' | 'governanceAddress'>
) => (
  <>
    <Form title="Let's create a proposal" description="" {...props} />
  </>
)
