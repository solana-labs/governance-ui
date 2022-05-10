import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import * as yup from 'yup'

import { Section } from 'pages/solana'

import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import FormSummary from '../FormSummary'

export const SESSION_STORAGE_FORM_KEY = 'multisig-form-data'

export const STEP1_SCHEMA = {
  avatar: yup.string(),
  name: yup.string().typeError('Required').required('Required'),
  description: yup.string(),
}

export const STEP2_SCHEMA = {
  memberPks: yup
    .array()
    .of(yup.string())
    .min(1, 'A DAO needs at least one member')
    .required('Required'),
}

export const STEP3_SCHEMA = {
  quorumThreshold: yup
    .number()
    .typeError('Required')
    .max(100, 'Quorum cannot require more than 100% of members')
    .min(1, 'Quorum must be at least 1% of member')
    .required('Required'),
}

export function getFormData() {
  return JSON.parse(sessionStorage.getItem(SESSION_STORAGE_FORM_KEY) || '{}')
}

export function updateUserInput(schema, setValue) {
  const formData = getFormData()
  Object.keys(schema).forEach((fieldName) => {
    const value = formData[fieldName]
    setValue(fieldName, value, {
      shouldValidate: true,
      shouldDirty: true,
    })
  })
}

export default function MultiSigWizard() {
  const { query, push } = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  function handleNextButtonClick({ step, data }) {
    const formState = getFormData()

    const nextStep = step + 1
    const updatedFormState = {
      ...formState,
      ...data,
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
    console.log('submit clicked')
  }

  useEffect(() => {
    if (query?.currentStep && !Array.isArray(query.currentStep)) {
      setCurrentStep(Number(query.currentStep))
    } else {
      setCurrentStep(1)
    }
  }, [query])

  useEffect(() => {
    if (currentStep < 4) {
      return
    }
    const formData = getFormData()
    if (
      !yup
        .object({
          ...STEP1_SCHEMA,
          ...STEP2_SCHEMA,
          ...STEP3_SCHEMA,
        })
        .isValid(formData)
    ) {
      console.log(formData)
      return handlePreviousButton(4)
    }
  }, [currentStep])

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
            formData={getFormData()}
            onPrevClick={handlePreviousButton}
            onSubmit={handleSubmitClick}
          />
        )}
      </Section>
    </div>
  )
}
