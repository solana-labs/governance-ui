import { useEffect } from 'react'
import { useRouter } from 'next/router'

import useLocalStorageState from '@hooks/useLocalStorageState'
import { isWizardValid } from '@utils/formValidation'

import CreateDAOWizard from '@components/NewRealmWizard/CreateDAOWizard'
import useWalletStore from 'stores/useWalletStore'

export const Section = ({ children }) => {
  return (
    <div className="relative w-full">
      <div className="w-full mx-auto lg:w-5/6  max-w-[770px] px-0">
        {children}
      </div>
    </div>
  )
}

export default function FormPage({
  type,
  ssFormKey,
  steps,
  handleSubmit,
  submissionPending,
}) {
  const [formData, setFormData] = useLocalStorageState(ssFormKey, {})
  const { connected, current: wallet } = useWalletStore((s) => s)
  const { pathname, query, push, replace } = useRouter()
  const currentStep =
    typeof query !== 'undefined'
      ? query.currentStep
        ? Number(query.currentStep)
        : 0
      : 0

  useEffect(() => {
    window.addEventListener('beforeunload', promptUserBeforeLeaving)
    window.addEventListener('unload', purgeFormData)
    return () => {
      window.removeEventListener('beforeunload', promptUserBeforeLeaving)
      window.removeEventListener('unload', purgeFormData)
    }
  }, [])

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
        if (currentStep > 0) handlePreviousButton(1)
      }
    }

    tryToConnect()
  }, [connected])

  useEffect(() => {
    if (currentStep > 0 && !isWizardValid({ currentStep, steps, formData })) {
      handlePreviousButton(currentStep, true)
    }
  }, [currentStep])

  function promptUserBeforeLeaving(ev) {
    ev.preventDefault()
    if (formData) {
      ev.returnValue = true
    }
  }

  function purgeFormData() {
    setFormData({})
  }

  function handleNextButtonClick({ step: fromStep, data }) {
    const updatedFormState = {
      ...formData,
      ...data,
    }

    for (const key in updatedFormState) {
      if (updatedFormState[key] == null) {
        delete updatedFormState[key]
      }
    }
    setFormData(updatedFormState)

    const nextStep = steps
      .map(
        ({ required }) =>
          required === 'true' ||
          !!eval(required.replace('form', 'updatedFormState'))
      )
      .indexOf(true, fromStep + 1)

    console.log('next button clicked', fromStep, nextStep)

    push(
      {
        pathname,
        query: {
          ...query,
          currentStep: nextStep > -1 ? nextStep : steps.length + 1,
        },
      },
      undefined,
      {
        shallow: true,
      }
    )
  }

  function handlePreviousButton(fromStep, overwriteHistory = false) {
    console.log(
      'previous button clicked from step:',
      fromStep,
      currentStep,
      query
    )

    if (fromStep === 0) {
      purgeFormData()
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
            required === 'true' || !!eval(required.replace('form', 'formData'))
        )
        .lastIndexOf(true, fromStep - 1)

      let transferFunction
      if (overwriteHistory) {
        transferFunction = replace
      } else {
        transferFunction = push
      }
      transferFunction(
        { pathname, query: { ...query, currentStep: previousStep } },
        undefined,
        { shallow: true }
      )
    }
  }

  return (
    <div className="relative pb-8 md:pb-20 landing-page">
      <div className="">
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
      </div>
    </div>
  )
}
