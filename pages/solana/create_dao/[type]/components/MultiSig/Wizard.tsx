import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { Section } from 'pages/solana'

import Step1 from './Step1'
import Step2 from './Step2'

export default function MultiSigWizard() {
  const { query, push } = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  function handleSubmit(formData) {
    const nextStep = formData.step + 1
    const updatedQueryState = {
      ...query,
      currentStep: nextStep,
      [`step${formData.step}`]: JSON.stringify(formData.data),
    }
    console.log('submission', updatedQueryState)

    push({
      pathname: '/solana/create_dao/[type]',
      query: { type: 'multisig', ...updatedQueryState },
    })
  }

  function handlePreviousButton(currentStep) {
    if (currentStep === 1) {
      push({
        pathname: '/solana/create_dao/',
      })
    } else {
      const previousStep = currentStep - 1
      const updatedQueryState = {
        ...query,
        currentStep: previousStep,
      }
      console.log('Previous click', updatedQueryState)
      push({
        pathname: '/solana/create_dao/[type]',
        query: { type: 'multisig', ...updatedQueryState },
      })
    }
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
          <Step1 onPrevClick={handlePreviousButton} onSubmit={handleSubmit} />
        )}
        {currentStep === 2 && (
          <Step2 onPrevClick={handlePreviousButton} onSubmit={handleSubmit} />
        )}
      </Section>
    </div>
  )
}
