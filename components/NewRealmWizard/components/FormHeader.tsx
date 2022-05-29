import Header from '@components/Header'
import Text from '@components/Text'

import { FORM_NAME as GOVTOKEN_FORM } from 'pages/realms/new/gov-token'
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
    stepTitle = 'Gov token DAO:'
  } else if (formType == MULTISIG_FORM) {
    stepTitle = 'Multisig wallet DAO:'
  } else if (formType == NFT_FORM) {
    stepTitle = 'NFT community DAO:'
  }

  for (let i = 0; i < totalSteps + 1; i++) {
    let className = `w-[18px] h-[1px] `
    if (i <= currentStep) {
      // className += 'step-indicator-with-gradient'
      elementsWithGradient.push(<div key={i} className={className}></div>)
    } else {
      className += 'bg-black'
      elementsWithoutGradient.push(<div key={i} className={className}></div>)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex space-x-1 step-indicator">
        <div className="flex space-x-1 step-indicator__with-gradient">
          {elementsWithGradient}
        </div>
        <div className="flex space-x-1 step-indicator__without-gradient">
          {elementsWithoutGradient}
        </div>
      </div>
      <div className="flex pt-2">
        <Text level="2">
          <span className="text-[#6de9ff] mr-1">{stepTitle}</span>
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
