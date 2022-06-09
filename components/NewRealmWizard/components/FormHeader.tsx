import Header from '@components/Header'
import Text from '@components/Text'

import { FORM_NAME as GOVTOKEN_FORM } from 'pages/realms/new/tokenized'
import { FORM_NAME as MULTISIG_FORM } from 'pages/realms/new/multisig'
import { FORM_NAME as NFT_FORM } from 'pages/realms/new/nft'

function StepProgressIndicator({ formType, currentStep, totalSteps }) {
  let stepTitle = ''

  if (formType == GOVTOKEN_FORM) {
    stepTitle = 'Tokenized DAO: '
  } else if (formType == MULTISIG_FORM) {
    stepTitle = 'Multisig wallet: '
  } else if (formType == NFT_FORM) {
    stepTitle = 'NFT community DAO: '
  }

  return (
    <div className="flex flex-col -mt-8">
      <div className="flex">
        <Text level="2">
          <span className="bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] bg-clip-text text-transparent mr-1">
            {stepTitle}
          </span>
          {currentStep === totalSteps
            ? 'Summary'
            : `Step ${currentStep + 1} of ${totalSteps}`}
        </Text>
      </div>
    </div>
  )
}

export default function FormHeader({ type, currentStep, totalSteps, title }) {
  return (
    <div>
      <StepProgressIndicator
        formType={type}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />
      <div className="flex items-center w-full mt-6 md:mt-10">
        <Header as="h2" className="md:max-w-[550px]">
          {title}
        </Header>
      </div>
    </div>
  )
}
