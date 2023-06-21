// import BotIcon from '@carbon/icons-react/lib/Bot'
import type { PublicKey } from '@solana/web3.js'
import { ProposalTitle } from '../ProposalTitle'
import { ProposalDetails } from '../ProposalDetails'
import { VotingOptions } from '../VotingOptions'
import Bot from '@carbon/icons-react/lib/Bot'

// import { ProposalDetails } from '@components/core/ProposalDetails'
// import { ProposalVoteType } from '@components/core/ProposalVoteType'
// import { CommunityRules, CouncilRules } from '../types'
// import { UpdatesList } from '../UpdatesList'
// import { NewRulesList } from '../UpdatesList/NewRulesList'
// import { WalletDescription } from '../WalletDescription'
import { FormProps } from '@hub/types/FormProps'
import {
  CommunityRules,
  CouncilRules,
} from '@hub/components/EditWalletRules/types'

interface Props
  extends FormProps<{
    // proposalDescription: string
    maxVoteDays: number
    // proposalTitle: string
    proposalVoteType: 'council' | 'community'
  }> {
  className?: string
  // communityRules: CommunityRules
  // coolOffHours: number
  // councilRules: CouncilRules
  initialCommunityRules: CommunityRules
  initialCoolOffHours: number
  initialCouncilRules: CouncilRules
  // initialDepositExemptProposalCount: number
  initialBaseVoteDays: number
  // initialMinInstructionHoldupDays: number
  // depositExemptProposalCount: number
  // baseVoteDays: number
  // minInstructionHoldupDays: number
  // governanceAddress?: PublicKey
  walletAddress?: PublicKey
}

function Summary(
  props: Props & {
    title: string
    description: string
    proposalForm?: boolean
  }
) {
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
      <div className="text-neutral-500 mb-8">{props.description}</div>
      {/* {props.walletAddress && ( */}
      <>
        <ProposalTitle className="mb-8" />
      </>
      <>
        <div className="text-lg text-white font-bold mb-3">
          Proposal Details
        </div>

        <div className="flex items-center mb-4">
          <Bot className="text-emerald-400 mr-1" />
          <div className="text-xs text-emerald-400">
            This section is automatically generated
          </div>
        </div>

        <ProposalDetails
          initialCommunityRules={props.initialCommunityRules}
          initialCouncilRules={props.initialCouncilRules}
          maxVoteDays={props.maxVoteDays}
          proposalVoteType={props.proposalVoteType}
          initialBaseVoteDays={props.initialBaseVoteDays}
          initialCoolOffHours={props.initialCoolOffHours}
        />
      </>
      <>
        <VotingOptions />
      </>

      {/* )} */}
      {/* {props.proposalPreview} */}
    </article>
  )
}

// export const EditWalletSummary = (
//   props: Props & {
//     // governanceAddress: NonNullable<Props['governanceAddress']>
//     walletAddress: NonNullable<Props['walletAddress']>
//   }
// ) => (
//   <Summary
//     {...props}
//     proposalForm
//     title="Your proposal is almost ready. Does everything look correct?"
//     // proposalPreview={
//     //   <>
//     //     <div className="mt-14">
//     //       <div className="text-lg font-bold dark:text-white">
//     //         Proposed Rules Updates
//     //       </div>
//     //       <div className="flex items-center mt-3 dark:text-emerald-400">
//     //         <BotIcon className="h-3 fill-current mr-1 w-4" />
//     //         <div className="text-xs">
//     //           This section is automatically generated
//     //         </div>
//     //       </div>
//     //     </div>
//         /* <UpdatesList
//           className="mt-4"
//           communityRules={props.communityRules}
//           coolOffHours={props.coolOffHours}
//           councilRules={props.councilRules}
//           initialCommunityRules={props.initialCommunityRules}
//           initialCoolOffHours={props.initialCoolOffHours}
//           initialCouncilRules={props.initialCouncilRules}
//           initialDepositExemptProposalCount={
//             props.initialDepositExemptProposalCount
//           }
//           initialBaseVoteDays={props.initialBaseVoteDays}
//           initialMinInstructionHoldupDays={
//             props.initialMinInstructionHoldupDays
//           }
//           depositExemptProposalCount={props.depositExemptProposalCount}
//           baseVoteDays={props.baseVoteDays}
//           minInstructionHoldupDays={props.minInstructionHoldupDays}
//         /> */
//       // </>
//     // }
//   />
// )

export const NewProposalSummary = (
  props: Omit<Props, 'walletAddress' | 'governanceAddress'>
) => (
  <Summary
    {...props}
    title="Add a title and description to your proposal"
    description="Before submitting, ensure your description is correct and rules updates are accurate."
    // proposalPreview={
    //   <>
    //     <div className="mt-14">
    //       <div className="text-lg font-bold dark:text-white">
    //         Proposed Wallet Rules
    //       </div>
    //     </div>
    //  <NewRulesList
    //   className="mt-4"
    //   communityRules={props.communityRules}
    //   coolOffHours={props.coolOffHours}
    //   councilRules={props.councilRules}
    //   depositExemptProposalCount={props.depositExemptProposalCount}
    //   baseVoteDays={props.baseVoteDays}
    //   minInstructionHoldupDays={props.minInstructionHoldupDays}
    // />
    // </>
    // }
  />
)
