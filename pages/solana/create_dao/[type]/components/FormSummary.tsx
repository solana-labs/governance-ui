import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'

import FormHeader from './FormHeader'
import FormFooter from './FormFooter'

import Header from 'components_2/Header'
import Text from 'components_2/Text'
import Button from 'components_2/Button'

function SummaryCell({ className = '', children }) {
  return (
    <div
      className={`bg-[#201f27] rounded-md px-4 py-6 md:p-8 grow ${className}`}
    >
      {children}
    </div>
  )
}
export default function WizardSummary({
  currentStep,
  formData,
  onSubmit,
  submissionPending = false,
  onPrevClick,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  function closeModal() {
    setIsModalOpen(false)
  }

  function openModal() {
    setIsModalOpen(true)
  }

  const tokenName = formData?.govTokenName || '' //'Gradiento'
  const tokenSymbol = formData?.govTokenSymbol || '' // 'GRADO'
  const nftCollectionName = formData?.nftCollectionName || '' // 'Bored Ape'
  const nftCollectionCount = formData?.nftCollectionCount || 0 // 1000000
  const quorumThreshold = formData?.quorumThreshold || 0 // 10
  const numberOfMembers = formData?.memberAddresses?.length || 0 // 1

  return (
    <>
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex flex-col items-center justify-center min-h-full text-center md:p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Overlay className="flex flex-col justify-center w-full grow md:grow-0 md:max-w-xl p-6 md:p-12 overflow-hidden text-left align-middle transition-all transform bg-[#201F27] md:rounded-lg space-y-3">
                  <img
                    src="/1-Landing-v2/logo-realms-blue.png"
                    className="w-8 h-8"
                  />
                  <Header as="h2">The Final Step</Header>
                  <Text className="opacity-60">
                    You are creating a new DAO on Solana and will have to
                    confirm a transaction with your currently-connected wallet.
                    The creation of your DAO will cost approximately 0.0001 SOL.
                    The exact amount will be determined by your wallet.
                  </Text>

                  <div className="flex flex-wrap items-center justify-center pt-6 space-y-8 sm:space-x-8 md:space-x-0 md:justify-between sm:space-y-0">
                    <Button withBorder onClick={closeModal}>
                      <div className="px-16 min-w-[300px] sm:min-w-[240px]">
                        Cancel
                      </div>
                    </Button>
                    <Button
                      onClick={onSubmit}
                      disabled={submissionPending}
                      isLoading={submissionPending}
                    >
                      <div className="px-16 min-w-[300px] sm:min-w-[240px]">
                        Create DAO
                      </div>
                    </Button>
                  </div>
                </Dialog.Overlay>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
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
            <SummaryCell className="flex mb-2 space-x-4 md:space-x-8">
              <div
                className={`h-[80px] md:h-[158px] min-w-[80px] md:w-[158px] rounded-full flex justify-center ${
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
          submitClickHandler={openModal}
          faqTitle="About Multi-Sigs"
        />
      </div>
    </>
  )
}
