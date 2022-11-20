import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

import { isWizardValid, validateSolAddress } from '@utils/formValidation'

import CreateDAOWizard from '@components/NewRealmWizard/CreateDAOWizard'
import useWalletStore from 'stores/useWalletStore'

// import { FORM_NAME as NFT_FORM } from 'pages/realms/new/nft'
import { FORM_NAME as MULTISIG_WALLET_FORM } from 'pages/realms/new/multisig'
import { FORM_NAME as COMMUNITY_TOKEN_FORM } from 'pages/realms/new/community-token'
import { useProgramVersionByIdQuery } from '@hooks/queries/useProgramVersionQuery'
import { PublicKey } from '@blockworks-foundation/mango-client'
import { DEFAULT_GOVERNANCE_PROGRAM_VERSION } from '@components/instructions/tools'

export const Section = ({ children }) => {
  return (
    <div className="w-full mx-auto lg:w-5/6  max-w-[770px] px-0 pb-[130px] sm:pb-[250px] relative min-h-[calc(100vh_-_75px)]">
      {children}
    </div>
  )
}

export default function FormPage({
  autoInviteWallet = false,
  type,
  steps,
  handleSubmit,
  submissionPending,
}) {
  const { connected, current: wallet } = useWalletStore((s) => s)
  const userAddress = wallet?.publicKey?.toBase58()
  const [formData, setFormData] = useState<any>({
    _programVersion: DEFAULT_GOVERNANCE_PROGRAM_VERSION,
    memberAddresses:
      autoInviteWallet && userAddress ? [userAddress] : undefined,
  })
  const { query, push } = useRouter()
  const currentStep = formData?.currentStep || 0
  const title = `Create ${
    type === MULTISIG_WALLET_FORM
      ? 'multi-signature wallet'
      : type === COMMUNITY_TOKEN_FORM
      ? 'community token DAO'
      : 'NFT community DAO'
  } | Realms`

  // Update formData's _programVersion
  const programIdInput = formData.programId
  const validProgramId =
    programIdInput && validateSolAddress(programIdInput)
      ? new PublicKey(programIdInput)
      : undefined
  const programVersionQuery = useProgramVersionByIdQuery(validProgramId)

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      _programVersion:
        programVersionQuery.data ?? DEFAULT_GOVERNANCE_PROGRAM_VERSION,
    }))
  }, [programVersionQuery.data])

  useEffect(() => {
    async function tryToConnect() {
      try {
        if (!connected) {
          if (wallet) await wallet.connect()
        }
        if (!wallet?.publicKey) {
          throw new Error('No valid wallet connected')
        }
      } catch (err) {
        // @asktree: why would this be the correct behavior if the user isn't connected?
        if (currentStep > 0) handlePreviousButton(1)
      }
    }

    tryToConnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [connected])

  useEffect(() => {
    if (currentStep > 0 && !isWizardValid({ currentStep, steps, formData })) {
      // @asktree: Why would this be the correct behavior for validation failure? It just seems silently confusing for the user (or the dev as the case may be).
      handlePreviousButton(currentStep)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [currentStep])

  function handleNextButtonClick({ step: fromStep, data }) {
    const updatedFormState = {
      ...formData,
      ...data,
    }
    const nextStep = steps
      .map(
        ({ required }) =>
          required === 'true' ||
          !!eval(required.replaceAll('form', 'updatedFormState'))
      )
      .indexOf(true, fromStep + 1)

    updatedFormState.currentStep = nextStep > -1 ? nextStep : steps.length + 1

    console.log(
      'required steps',
      steps.map(
        ({ required }) =>
          required === 'true' ||
          !!eval(required.replaceAll('form', 'updatedFormState'))
      )
    )
    console.log(
      'next button clicked',
      fromStep,
      nextStep,
      updatedFormState.currentStep
    )

    for (const key in updatedFormState) {
      if (updatedFormState[key] == null) {
        delete updatedFormState[key]
      }
    }
    setFormData(updatedFormState)
  }

  function handlePreviousButton(fromStep) {
    console.log(
      'previous button clicked from step:',
      fromStep,
      currentStep,
      query
    )

    if (fromStep === 0) {
      push(
        {
          pathname: '/realms/new/',
          query: query?.cluster ? { cluster: query.cluster } : {},
        },
        undefined,
        { shallow: true }
      )
    } else {
      const previousStep = steps
        .map(
          ({ required }) =>
            required === 'true' ||
            !!eval(required.replaceAll('form', 'formData'))
        )
        .lastIndexOf(true, fromStep - 1)

      const updatedFormState = {
        ...formData,
        currentStep: previousStep,
      }

      setFormData(updatedFormState)
    }
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Section>
        <CreateDAOWizard
          type={type}
          steps={steps}
          currentStep={currentStep}
          formData={formData}
          handlePreviousButton={handlePreviousButton}
          handleNextButtonClick={handleNextButtonClick}
          handleSubmit={handleSubmit}
          submissionPending={submissionPending}
        />
      </Section>
    </>
  )
}
