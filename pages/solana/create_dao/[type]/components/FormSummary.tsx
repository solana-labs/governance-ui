import { useEffect } from 'react'
import FormHeader from './FormHeader'
import FormFooter from './FormFooter'

import Header from 'components_2/Header'
export default function WizardSummary({
  currentStep,
  ssFormkey,
  onSubmit,
  onPrevClick,
}) {
  const wizardData = JSON.parse(sessionStorage.getItem(ssFormkey) || '{}')
  const tokenName = wizardData?.step3?.daoGovTokenName || ''
  const tokenSymbol = wizardData?.step3?.daoGovTokenSymbol || ''
  const nftCollectionName = wizardData?.step2?.nftCollectionName || ''
  const nftCollectionCount = wizardData?.step2?.nftCollectionCount || 0

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
      <div className="pt-10">
        <div className="flex flex-col">
          <div className="flex bg-[#201f27] rounded-md p-8">
            <div
              className={`h-[158px] w-[158px] rounded-full flex justify-center ${
                wizardData?.step1?.daoAvatar ? '' : 'bg-black/80'
              }`}
            >
              {wizardData?.step1?.daoAvatar ? (
                <img src={wizardData.step1.daoAvatar} />
              ) : (
                <div className="my-auto opacity-50">No avatar</div>
              )}
            </div>
            <div className="flex flex-col">
              <Header as="h1">{wizardData?.step1?.daoName}</Header>
              <div>{wizardData?.step1?.daoDescription}</div>
            </div>
          </div>
        </div>
      </div>
      <FormFooter
        isValid
        prevClickHandler={() => onPrevClick(currentStep)}
        submitClickHandler={onSubmit}
        faqTitle="About Multi-Sigs"
      />
    </div>
  )
}
