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
      className={`bg-night-grey rounded-md px-4 py-6 md:p-8 grow ${className}`}
    >
      {children}
    </div>
  )
}
export default function WizardSummary({
  type,
  currentStep,
  formData,
  onSubmit,
  submissionPending = false,
  onPrevClick,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  function closeModal() {
    if (!submissionPending) {
      setIsModalOpen(false)
    }
  }

  function openModal() {
    setIsModalOpen(true)
  }

  const tokenName = formData?.tokenInfo?.name || formData?.tokenName || '' //'Gradiento'
  const tokenSymbol = formData?.tokenInfo?.symbol || formData?.tokenSymbol || '' // 'GRADO'
  const tokenLogo = formData?.tokenInfo?.logoURI
  const editRights = formData?.minimumNumberOfTokensToEditDao
  const mintSupplyFactor = formData?.mintSupplyFactor
  const mintAuthority = formData?.transferMintAuthorityToDao
  const nftCollectionName = formData?.nftCollectionName || '' // 'Bored Ape'
  const nftCollectionCount = formData?.nftCollectionCount || 0 // 1000000
  const approvalThreshold = formData?.approvalThreshold || 0
  const quorumThreshold = formData?.quorumThreshold || 0 // 10
  const numberOfMembers = formData?.memberAddresses?.length || 0 // 1
  const programId = formData?.programId || ''

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
                <Dialog.Overlay className="flex flex-col justify-center w-full p-6 space-y-3 overflow-hidden text-left align-middle transition-all transform grow md:grow-0 md:max-w-xl md:p-12 bg-night-grey md:rounded-lg">
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
                    <Button
                      withBorder
                      disabled={submissionPending}
                      onClick={closeModal}
                    >
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
              {formData?.avatar && (
                <div className="h-[80px] md:h-[158px] min-w-[80px] md:w-[158px] rounded-full flex justify-center">
                  <img src={formData.avatar} />
                </div>
              )}
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
            <div
              className={`grid ${
                type !== 'multisig' ? 'grid-cols-3' : 'grid-cols-2'
              } w-full gap-2 mb-2`}
            >
              {type === 'nft' && (
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
              {type === 'gov-token' && (
                <>
                  <SummaryCell className="flex flex-col">
                    <div className="h-10 m-auto">
                      <img
                        src={
                          tokenLogo ||
                          '/1-Landing-v2/icon-token-generic-gradient.png'
                        }
                        className="h-full"
                      />
                    </div>
                    <Header as="h3" className="mt-6 text-center truncate">
                      {tokenName || '(Unnamed)'}
                    </Header>
                    <Text className="mt-2 text-center uppercase text-white/50">
                      #{tokenSymbol || '(No symbol)'}
                    </Text>
                  </SummaryCell>
                  <SummaryCell className="flex flex-col">
                    <div className="h-10 m-auto">
                      <img
                        src="/1-Landing-v2/icon-quorum-gradient.png"
                        className="h-full"
                      />
                    </div>
                    <Header as="h1" className="mt-6 text-center">
                      {approvalThreshold}%
                    </Header>
                    <Text className="mt-2 text-center text-white/50">
                      Approval threshold
                    </Text>
                  </SummaryCell>
                  {editRights && (
                    <SummaryCell className="flex flex-col">
                      <Header as="h1" className="mt-6 text-center">
                        {Number(editRights).toLocaleString()}
                      </Header>
                      <Text className="mt-2 text-center text-white/50">
                        Min. tokens needed to edit DAO
                      </Text>
                    </SummaryCell>
                  )}
                  {mintSupplyFactor && (
                    <SummaryCell className="flex flex-col">
                      <Header as="h1" className="mt-6 text-center">
                        {Number(mintSupplyFactor).toLocaleString()}
                      </Header>
                      <Text className="mt-2 text-center text-white/50">
                        Mint supply factor
                      </Text>
                    </SummaryCell>
                  )}
                  {mintAuthority && (
                    <SummaryCell className="flex flex-col">
                      <Header as="h1" className="mt-6 text-center">
                        {String(mintAuthority)}
                      </Header>
                      <Text className="mt-2 text-center text-white/50">
                        DAO has authority to mint tokens
                      </Text>
                    </SummaryCell>
                  )}
                </>
              )}
              {numberOfMembers > 0 && (
                <>
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
                    <Text className="mt-2 text-center text-white/50">
                      Council members
                    </Text>
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
                    <Text className="mt-2 text-center text-white/50">
                      Council quorum
                    </Text>
                  </SummaryCell>
                </>
              )}
            </div>
            <div className="space-y-2">
              {programId && (
                <SummaryCell>
                  <div className="flex items-baseline space-x-3">
                    <div className="text-lg md:text-xl">Program ID</div>
                    <div className="px-2 rounded bg-bkg-grey text-white/60">
                      Advanced Option
                    </div>
                  </div>
                  <div className="mt-2 text-lg text-white/50">{programId}</div>
                </SummaryCell>
              )}
            </div>
          </div>
        </div>
        <FormFooter
          isValid
          prevClickHandler={() => onPrevClick(currentStep)}
          submitClickHandler={openModal}
          faqTitle=""
        />
      </div>
    </>
  )
}
