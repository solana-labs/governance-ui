import Header from '@components/Header'
import Text from '@components/Text'

import { FORM_NAME as GOVTOKEN_FORM } from 'pages/realms/new/tokenized'
import { FORM_NAME as MULTISIG_FORM } from 'pages/realms/new/multisig'
import { FORM_NAME as NFT_FORM } from 'pages/realms/new/nft'

function StepProgressIndicator({
  formType,
  currentStep,
  totalSteps,
  stepDescription = '',
}) {
  const elementsWithGradient: JSX.Element[] = []
  const elementsWithoutGradient: JSX.Element[] = []
  let stepTitle = ''

  if (formType == GOVTOKEN_FORM) {
    stepTitle = 'Tokenized DAO:'
  } else if (formType == MULTISIG_FORM) {
    stepTitle = 'Multisig wallet:'
  } else if (formType == NFT_FORM) {
    stepTitle = 'NFT community DAO:'
  }

  for (let i = 0; i < totalSteps + 1; i++) {
    if (i <= currentStep) {
      elementsWithGradient.push(
        <div key={i} dangerouslySetInnerHTML={{ __html: '&mdash;' }}></div>
      )
    } else {
      elementsWithoutGradient.push(
        <div key={i} dangerouslySetInnerHTML={{ __html: '&mdash;' }}></div>
      )
    }
  }

  return (
    <div className="flex flex-col -mt-8">
      <div className="flex space-x-1 step-indicator">
        <div className="flex text-[24px] leading-[0.5] space-x-1 text-transparent bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] bg-clip-text">
          {elementsWithGradient}
        </div>
        <div className="flex text-[24px] leading-[0.5] space-x-1 text-black">
          {elementsWithoutGradient}
        </div>
      </div>
      <div className="flex">
        <Text level="2">
          <span className="bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] bg-clip-text text-transparent mr-1">
            {stepTitle}
          </span>
          {stepDescription}
        </Text>
      </div>
    </div>
  )
}

export default function FormHeader({
  type,
  currentStep,
  totalSteps,
  stepDescription,
  title,
}) {
  return (
    <div>
      <StepProgressIndicator
        formType={type}
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepDescription={stepDescription}
      />
      <div className="flex items-center w-full pt-10 md:pt-20">
        <Header as="h2" className="md:max-w-[550px]">
          {title}
        </Header>
      </div>
    </div>
  )
}
