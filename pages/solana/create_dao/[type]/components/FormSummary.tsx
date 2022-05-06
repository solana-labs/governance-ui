import { useEffect } from 'react'
import FormHeader from './FormHeader'
import FormFooter from './FormFooter'

export default function WizardSummary({
  currentStep,
  ssFormkey,
  onSubmit,
  onPrevClick,
}) {
  const wizardData = JSON.parse(sessionStorage.getItem(ssFormkey) || '{}')

  useEffect(() => {
    // do some checking that user has not skipped the previous step
    wizardData[`step${currentStep - 1}`]
    if (!wizardData[`step${currentStep - 1}`]) {
      return onPrevClick(currentStep - 1)
    }
  }, [wizardData])

  return (
    <div data-testid="wizard-summary">
      <FormHeader
        currentStep={currentStep}
        totalSteps={currentStep}
        stepDescription="Summary"
        title="Here's what you created. Does everything look right?"
        imgSrc="/1-Landing-v2/dao-type-medium-govtoken.png"
        imgAlt="circles spirling"
      />
      <div className="pt-10 space-y-10 md:space-y-12"></div>
      <FormFooter
        isValid
        prevClickHandler={() => onPrevClick(currentStep)}
        submitClickHandler={onSubmit}
        faqTitle="About Multi-Sigs"
      />
    </div>
  )
}
