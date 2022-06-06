import { FunctionComponent, Fragment, useState, ReactElement } from 'react'

import FormHeader from '@components/NewRealmWizard/components/FormHeader'
import FormFooter from '@components/NewRealmWizard/components/FormFooter'

import Header from '@components/Header'
import Text from '@components/Text'
import { NewButton as Button } from '@components/Button'
import { ConfirmationDialog } from '@components/Modal'

import { FORM_NAME as MULTISIG_FORM } from 'pages/realms/new/multisig'

function SummaryCell({ className = '', children }) {
  return (
    <div
      className={`bg-night-grey rounded-md px-4 py-6 md:p-8 grow ${className}`}
    >
      {children}
    </div>
  )
}

interface FieldProps {
  className?: string
  img?: string
  icon?: ReactElement
  header: string
  footer: string
}
const FieldValue: FunctionComponent<FieldProps> = ({
  className = '',
  img = '',
  icon,
  header,
  footer,
}) => {
  return (
    <SummaryCell className={`grid grid-rows-3 ${className}`}>
      {img || icon ? (
        <>
          <div className="h-10 m-auto">
            {img?.length ? <img src={img} className="h-full" /> : icon}
          </div>
          <Header as="h3" className="text-center">
            {header}
          </Header>
        </>
      ) : (
        <>
          <div />
          <Header as="h1" className="text-center truncate">
            {header}
          </Header>
        </>
      )}

      <Text className="mt-2 text-center uppercase text-white/50">{footer}</Text>
    </SummaryCell>
  )
}

const COMMUNITY_TYPE = 'COMMUNITY'
const COUNCIL_TYPE = 'COUNCIL'

function TokenInfo({
  type = COMMUNITY_TYPE,
  tokenInfo,
  transferMintAuthority,
  mintSupplyFactor = 1,
}) {
  return (
    <>
      <FieldValue
        img={tokenInfo?.logoURI || '/icons/generic-token-icon.svg'}
        header={tokenInfo?.name || '(Unnamed)'}
        footer={`#${tokenInfo?.symbol || '(No symbol)'}`}
      />
      <FieldValue
        header={transferMintAuthority === false ? 'False' : 'True'}
        footer={
          type === COMMUNITY_TYPE
            ? 'DAO can mint tokens'
            : type === COUNCIL_TYPE
            ? 'DAO can add members'
            : 'DAO can mint'
        }
      />
      {type === COMMUNITY_TYPE && (
        <FieldValue
          header={Number(mintSupplyFactor).toLocaleString()}
          footer={'Mint supply factor'}
        />
      )}
    </>
  )
}

function CommunityInfo({
  tokenInfo,
  transferMintAuthority,
  mintSupplyFactor,
  yesVotePercentage,
  minimumNumberOfTokensToGovern,
  nftInfo,
}) {
  const nftIsCommunityToken = !!nftInfo?.name

  return (
    <>
      <Header as="h2">Community info</Header>
      <div
        className={`grid ${
          nftIsCommunityToken ? 'grid-cols-3' : 'grid-cols-3'
        } gap-4 mt-4`}
      >
        {!nftIsCommunityToken && (
          <TokenInfo
            type={COMMUNITY_TYPE}
            tokenInfo={tokenInfo}
            transferMintAuthority={transferMintAuthority}
            mintSupplyFactor={mintSupplyFactor}
          />
        )}
        {nftIsCommunityToken && (
          <FieldValue
            img={nftInfo.image || '/icons/threshold-icon.svg'}
            header={nftInfo?.name}
            footer={`${Number(
              nftInfo?.nftCollectionCount
            ).toLocaleString()} NFTs`}
          />
        )}
        <FieldValue
          img="/icons/threshold-icon.svg"
          header={`${yesVotePercentage}%`}
          footer="Approval threshold"
        />
        <FieldValue
          header={
            minimumNumberOfTokensToGovern
              ? Number(minimumNumberOfTokensToGovern).toLocaleString()
              : 'Disabled'
          }
          footer="Min. tokens to edit DAO"
        />
      </div>
    </>
  )
}

function CouncilInfo({
  tokenInfo,
  transferMintAuthority,
  yesVotePercentage,
  numberOfMembers,
}) {
  return (
    <>
      <Header as="h2">Council info</Header>
      <div className="grid grid-cols-2 gap-4">
        <TokenInfo
          type={COUNCIL_TYPE}
          tokenInfo={tokenInfo}
          transferMintAuthority={transferMintAuthority}
        />
        <FieldValue
          img="/icons/council-members-icon.svg"
          header={numberOfMembers}
          footer="Council members"
        />
        <FieldValue
          img="/icons/threshold-icon.svg"
          header={`${yesVotePercentage}%`}
          footer="Council approval"
        />
      </div>
    </>
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

  const nftCollectionMetadata =
    (formData?.collectionKey && formData?.collectionMetadata) || {}
  const nftCollectionCount = formData?.numberOfNFTs || 0
  const nftCollectionInfo = {
    ...nftCollectionMetadata,
    nftCollectionCount,
  }
  const programId = formData?.programId || ''

  return (
    <>
      <ConfirmationDialog
        isOpen={isModalOpen}
        onClose={submissionPending ? undefined : closeModal}
        header={
          <div className="flex items-center justify-center mb-2 space-x-2">
            <img src="/img/logo-realms-blue.png" className="w-8 h-8" />
            <Header as="h2" className="mb-0">
              The Final Step
            </Header>
          </div>
        }
        closeButton={
          <Button secondary disabled={submissionPending} onClick={closeModal}>
            Cancel
          </Button>
        }
        confirmButton={
          <Button
            onClick={onSubmit}
            disabled={submissionPending}
            loading={submissionPending}
          >
            Create DAO
          </Button>
        }
      >
        <Text level="2" className="opacity-60">
          You are creating a new DAO on Solana and will have to confirm a
          transaction with your currently-connected wallet. The creation of your
          DAO will cost approximately 0.0001 SOL. The exact amount will be
          determined by your wallet.
        </Text>
      </ConfirmationDialog>
      <div data-testid="wizard-summary">
        <FormHeader
          type={type}
          currentStep={currentStep}
          totalSteps={currentStep}
          stepDescription="Summary"
          title="Here's what you created. Does everything look right?"
        />
        <div className="pt-10">
          <div className="flex flex-col space-y-4">
            <SummaryCell className="flex space-x-4 md:space-x-8">
              <div className="flex flex-col">
                <Header as="h1" className="mb-4">
                  {formData?.name}
                </Header>
                {formData?.description ? (
                  <Text>{formData.description}</Text>
                ) : (
                  <Text level="2" className="text-white/60">
                    No DAO description...
                  </Text>
                )}
              </div>
            </SummaryCell>
            {type !== MULTISIG_FORM && (
              <CommunityInfo
                tokenInfo={formData.communityTokenInfo}
                transferMintAuthority={formData.transferCommunityMintAuthority}
                mintSupplyFactor={formData.communityMintSupplyFactor}
                yesVotePercentage={formData.communityYesVotePercentage}
                minimumNumberOfTokensToGovern={
                  formData.minimumNumberOfCommunityTokensToGovern
                }
                nftInfo={nftCollectionInfo}
              />
            )}
            {(formData.addCouncil || formData?.memberAddresses?.length > 0) && (
              <CouncilInfo
                tokenInfo={formData.councilTokenInfo}
                transferMintAuthority={formData.transferCouncilMintAuthority}
                yesVotePercentage={
                  formData?.councilYesVotePercentage ||
                  formData.communityYesVotePercentage
                }
                numberOfMembers={formData?.memberAddresses?.length}
              />
            )}

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
        />
      </div>
    </>
  )
}
