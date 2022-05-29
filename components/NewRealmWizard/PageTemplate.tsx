import { useEffect } from 'react'
import { useRouter } from 'next/router'

import useLocalStorageState from '@hooks/useLocalStorageState'
import { isWizardValid } from '@utils/formValidation'

import Image from 'next/image'
import CreateDAOWizard from '@components/NewRealmWizard/CreateDAOWizard'

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
  bgImg = '/1-Landing-v2/creation-bg-desktop.png',
  type,
  ssFormKey,
  steps,
  handleSubmit,
  submissionPending,
}) {
  const [formData, setFormData] = useLocalStorageState(ssFormKey, {})
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
    if (!isWizardValid({ currentStep, steps, formData })) {
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
    console.log('previous button clicked from step:', fromStep, currentStep)

    if (fromStep === 0) {
      purgeFormData()
      push({ pathname: '/solana/create_dao/' }, undefined, { shallow: true })
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
      <div className="z-[-1] fixed top-0 left-0 w-[100vw] h-[100vh]">
        <Image
          alt="background image"
          src={bgImg}
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
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
