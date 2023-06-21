import router from 'next/router'
import { NewProposalForm } from './Form/Form'
import { Secondary } from '@components/core/controls/Button/Secondary'
import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import cx from '@hub/lib/cx'
import Head from 'next/head'
import { Primary } from '@components/core/controls/Button'
import CheckmarkIcon from '@carbon/icons-react/lib/Checkmark'
import { NewProposalSummary } from './Summary'
import useGovernanceDefaults from '@hub/components/NewWallet/useGovernanceDefaults'
// import useGovernanceAssets from '@hooks/useGovernanceAssets'

enum Step {
  Form,
  Summary,
}

function stepNum(step: Step): number {
  switch (step) {
    case Step.Form:
      return 1
    case Step.Summary:
      return 2
  }
}

function stepName(step: Step): string {
  switch (step) {
    case Step.Form:
      return 'Rules & Options'
    case Step.Summary:
      return 'Create Wallet'
  }
}

interface Props {
  className?: string
}

function NewProposalWithDefaults({
  defaults,
  ...props
}: Props & {
  defaults: NonNullable<ReturnType<typeof useGovernanceDefaults>>
}) {
  const wallet = useWalletOnePointOh()
  const [step, setStep] = useState(Step.Form)

  if (!wallet?.publicKey) {
    return (
      <div className={cx(props.className, 'dark:bg-neutral-900')}>
        <Head>
          <title>Create Wallet</title>
          <meta property="og:title" content={`Create Wallet`} key="title" />
        </Head>
        <div className="w-full max-w-3xl pt-14 mx-auto grid place-items-center">
          <div className="my-16 py-8 px-16 dark:bg-black/40 rounded flex flex-col items-center">
            <div className="text-white mb-2 text-center">
              Please sign in to create a new wallet
            </div>
          </div>
        </div>
      </div>
    )
  }

  console.log('Step is: ', step)

  return (
    <>
      <div className={cx(props.className, 'dark:bg-neutral-900')}>
        <div className="w-full max-w-3xl pt-14 mx-auto">
          <Head>
            <title>Create Wallet</title>
            <meta property="og:title" content={`Create Wallet`} key="title" />
          </Head>
          <div className="flex items-center mt-4">
            <div className="text-sm dark:text-neutral-500">
              Step {stepNum(step)} of 2
            </div>
            <div className="text-sm dark:text-white ml-2">{stepName(step)}</div>
          </div>
          <div className="py-16">
            {step == Step.Form && (
              <>
                <NewProposalForm
                  className="mb-16"
                  //   communityRules={rules.communityTokenRules}
                  //   councilRules={rules.councilTokenRules}
                  //   initialCommunityRules={defaults.communityTokenRules}
                  //   initialCouncilRules={defaults.councilTokenRules}
                  //   onCommunityRulesChange={setRule('communityTokenRules')}
                  //   onCoolOffHoursChange={setRule('coolOffHours')}
                  //   onCouncilRulesChange={setRule('councilTokenRules')}
                  //   onDepositExemptProposalCountChange={setRule('depositExemptProposalCount')}
                  //   onMaxVoteDaysChange={setRule('maxVoteDays')}
                  //   onMinInstructionHoldupDaysChange={setRule('minInstructionHoldupDays')}
                />

                <footer className="flex items-center justify-between">
                  <button
                    className="flex items-center text-sm text-neutral-500"
                    onClick={() => router.back()}
                  >
                    <ChevronLeftIcon className="h-4 fill-current w-4" />
                    Go Back
                  </button>
                  <Secondary
                    className="h-14 w-44"
                    onClick={() => setStep(Step.Summary)}
                  >
                    Continue
                    <ChevronRightIcon className="h-4 fill-current w-4" />
                  </Secondary>
                </footer>
              </>
            )}
            {step === Step.Summary && (
              <>
                <NewProposalSummary
                  className="mb-16"
                  maxVoteDays={1}
                  initialCommunityRules={defaults.communityTokenRules}
                  initialCouncilRules={defaults.councilTokenRules}
                  // communityRules={rules.communityTokenRules}
                  // coolOffHours={rules.coolOffHours}
                  // councilRules={rules.councilTokenRules}
                  // initialCommunityRules={defaults.communityTokenRules}
                  initialCoolOffHours={defaults.coolOffHours}
                  // initialCouncilRules={defaults.councilTokenRules}
                  // initialDepositExemptProposalCount={
                  //   defaults.depositExemptProposalCount
                  // }
                  initialBaseVoteDays={defaults.maxVoteDays}
                  // initialMinInstructionHoldupDays={
                  //   defaults.minInstructionHoldupDays
                  // }
                  // depositExemptProposalCount={rules.depositExemptProposalCount}
                  // baseVoteDays={baseVoteDays}
                  // minInstructionHoldupDays={rules.minInstructionHoldupDays}
                  // proposalDescription={proposalDescription}
                  // proposalTitle={proposalTitle}
                  proposalVoteType="community"
                  // onProposalDescriptionChange={setProposalDescription}
                  // onProposalTitleChange={setProposalTitle}
                  // onProposalVoteTypeChange={setProposalVoteType}
                />
                <footer className="flex items-center justify-end">
                  <button
                    className="flex items-center text-sm text-neutral-500"
                    onClick={() => setStep(Step.Form)}
                  >
                    <ChevronLeftIcon className="h-4 fill-current mr-1 w-4" />
                    Edit Proposal
                  </button>
                  <Primary
                    className="ml-16 h-14 w-44"
                    // pending={submitting}
                    onClick={async () => {
                      console.log('Ok, creating proposal')
                      // setSubmitting(true)
                      // try {
                      //   await callback()
                      //   /* router.push(
                      //   fmtUrlWithCluster(`/dao/${symbol}/treasury/v2`),
                      // ); */
                      //   // this is how you navigate while forcing a reload.
                      //   // we just need to refetch the wallet data but that is too difficult to do in this god forsaken codebase
                      //   // so instead the page can just reload.
                      //   window.location.pathname = `/dao/${symbol}/treasury/v2`
                      // } catch (e) {
                      //   setSubmitting(false)
                      //   throw e
                      // }
                    }}
                  >
                    <CheckmarkIcon className="h-4 fill-current mr-1 w-4" />
                    Create Proposal
                  </Primary>
                </footer>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export const NewProposal = (props: Props) => {
  const defaults = useGovernanceDefaults()

  return defaults ? (
    <NewProposalWithDefaults {...props} defaults={defaults} />
  ) : null
}
