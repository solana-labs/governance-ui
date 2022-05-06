import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { Section } from 'pages/solana'

import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import FormSummary from '../FormSummary'

export const SESSION_STORAGE_FORM_KEY = 'multisig-form-data'

export default function MultiSigWizard() {
  const { query, push } = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  function handleNextButtonClick(formData) {
    const formState = JSON.parse(
      sessionStorage.getItem(SESSION_STORAGE_FORM_KEY) || '{}'
    )
    const nextStep = formData.step + 1
    const updatedFormState = {
      ...formState,
      [`step${formData.step}`]: formData.data,
    }

    console.log('next button clicked', updatedFormState)
    sessionStorage.setItem(
      SESSION_STORAGE_FORM_KEY,
      JSON.stringify(updatedFormState)
    )
    push(
      {
        pathname: '/solana/create_dao/[type]',
        query: { type: 'multisig', currentStep: nextStep },
      },
      undefined,
      { shallow: true }
    )
  }

  function handlePreviousButton(currentStep) {
    if (currentStep === 1) {
      push(
        {
          pathname: '/solana/create_dao/',
        },
        undefined,
        { shallow: true }
      )
    } else {
      const previousStep = currentStep - 1
      console.log('Previous click')
      push(
        {
          pathname: '/solana/create_dao/[type]',
          query: { type: 'multisig', currentStep: previousStep },
        },
        undefined,
        { shallow: true }
      )
    }
  }

  function handleSubmitClick() {
    console.log('wizard complete')
  }

  useEffect(() => {
    if (query?.currentStep && !Array.isArray(query.currentStep)) {
      setCurrentStep(Number(query.currentStep))
    } else {
      setCurrentStep(1)
    }
  }, [query])

  return (
    <div className="pt-24 md:pt-28">
      <Section>
        {currentStep === 1 && (
          <Step1
            onPrevClick={handlePreviousButton}
            onSubmit={handleNextButtonClick}
          />
        )}
        {currentStep === 2 && (
          <Step2
            onPrevClick={handlePreviousButton}
            onSubmit={handleNextButtonClick}
          />
        )}
        {currentStep === 3 && (
          <Step3
            onPrevClick={handlePreviousButton}
            onSubmit={handleNextButtonClick}
          />
        )}
        {currentStep === 4 && (
          <FormSummary
            currentStep={currentStep}
            ssFormkey={SESSION_STORAGE_FORM_KEY}
            onPrevClick={handlePreviousButton}
            onSubmit={handleSubmitClick}
          />
        )}
      </Section>
    </div>
  )
}
