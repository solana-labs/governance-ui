// import { useEffect } from 'react'
import FormHeader from './FormHeader'
import FormFooter from './FormFooter'

import Header from 'components_2/Header'
import Text from 'components_2/Text'

function SummaryCell({ className = '', children }) {
  return (
    <div className={`bg-[#201f27] rounded-md p-8 grow ${className}`}>
      {children}
    </div>
  )
}
export default function WizardSummary({
  currentStep,
  formData,
  onSubmit,
  onPrevClick,
}) {
  const tokenName = formData?.govTokenName || '' //'Gradiento'
  const tokenSymbol = formData?.govTokenSymbol || '' // 'GRADO'
  const nftCollectionName = formData?.nftCollectionName || '' // 'Bored Ape'
  const nftCollectionCount = formData?.nftCollectionCount || 0 // 1000000
  const quorumThreshold = formData?.quorumThreshold || 0 // 10
  const numberOfMembers = formData?.memberPks?.length || 0 // 1

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
          <SummaryCell className="flex mb-2 space-x-8">
            <div
              className={`h-[158px] w-[158px] rounded-full flex justify-center ${
                formData?.step1?.daoAvatar ? '' : 'bg-[#292833]'
              }`}
            >
              {formData?.avatar ? (
                <img src={formData.avatar} />
              ) : (
                <div className="my-auto opacity-50">No avatar</div>
              )}
            </div>
            <div className="flex flex-col">
              <Header as="h1" className="mb-4">
                {formData?.name}
              </Header>
              {formData?.description ? (
                <Text>{formData.description}</Text>
              ) : (
                <Text className="text-white/60">No DAO description...</Text>
              )}
            </div>
          </SummaryCell>
          <div className="flex w-full space-x-2">
            {nftCollectionName && nftCollectionCount && (
              <SummaryCell className="flex flex-col">
                <div className="h-10 m-auto">
                  <img
                    src="/1-Landing-v2/icon-quorum-gradient.png"
                    className="h-full"
                  />
                </div>
                <Header as="h3" className="mt-6 text-center">
                  {nftCollectionName}
                </Header>
                <div className="px-2 rounded-full bg-[#424050] w-fit mx-auto mt-2">
                  <Text>
                    {Number(nftCollectionCount).toLocaleString()} NFTs
                  </Text>
                </div>
              </SummaryCell>
            )}
            {tokenName && tokenSymbol && (
              <SummaryCell className="flex flex-col">
                <div className="h-10 m-auto">
                  <img
                    src="/1-Landing-v2/icon-token-generic-gradient.png"
                    className="h-full"
                  />
                </div>
                <Header as="h3" className="mt-6 text-center">
                  {tokenName}
                </Header>
                <Text className="mt-2 text-center uppercase text-white/50">
                  #{tokenSymbol}
                </Text>
              </SummaryCell>
            )}
            <SummaryCell className="flex flex-col">
              <div className="h-10 m-auto">
                <img
                  src="/1-Landing-v2/icon-members-gradient.png"
                  className="h-full"
                />
              </div>
              <Header as="h1" className="mt-6 text-center">
                {numberOfMembers}
              </Header>
              <Text className="mt-2 text-center text-white/50">members</Text>
            </SummaryCell>
            <SummaryCell className="flex flex-col">
              <div className="h-10 m-auto">
                <img
                  src="/1-Landing-v2/icon-quorum-gradient.png"
                  className="h-full"
                />
              </div>
              <Header as="h1" className="mt-6 text-center">
                {quorumThreshold}%
              </Header>
              <Text className="mt-2 text-center text-white/50">quroum</Text>
            </SummaryCell>
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
