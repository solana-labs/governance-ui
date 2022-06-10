import FormHeader from '@components/NewRealmWizard/components/FormHeader'
import FormFooter from '@components/NewRealmWizard/components/FormFooter'

import Header from '@components/Header'
import Text from '@components/Text'

import { FORM_NAME as MULTISIG_FORM } from 'pages/realms/new/multisig'

function SummaryModule({
  className = '',
  title,
  advancedOption = false,
  rightSide = <></>,
  children,
}) {
  return (
    <div
      className={`bg-night-grey rounded-md pl-6 pr-8 py-6 grow ${className} flex justify-between items-center`}
    >
      <div className="flex flex-col">
        <Text level="2" className="flex mb-2 text-white/50">
          {title}
          {advancedOption && (
            <Text
              level="3"
              className="flex items-center px-2 ml-2 rounded bg-bkg-grey text-white/70"
            >
              Advanced Option
            </Text>
          )}
        </Text>
        {children}
      </div>
      <div>{rightSide ? rightSide : <></>}</div>
    </div>
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
      <div>
        <Text level="1" className="mt-6">
          Community info
        </Text>
      </div>
      {nftIsCommunityToken ? (
        <SummaryModule
          title="Selected NFT collection"
          rightSide={
            <Text
              level="2"
              className="flex items-center px-6 py-1 ml-2 text-white rounded bg-bkg-grey"
            >
              {nftInfo?.nftCollectionCount?.toLocaleString()} NFTs
            </Text>
          }
        >
          <div className="flex items-center">
            <img
              src={nftInfo.image || '/icons/threshold-icon.svg'}
              className="w-8"
            />
            <Text level="0" className="ml-3 input-base">
              {nftInfo?.name || '(Collection has no name)'}
            </Text>
          </div>
        </SummaryModule>
      ) : (
        <SummaryModule
          title="Community token"
          rightSide={
            <Text
              level="2"
              className="flex items-center px-6 py-1 ml-2 text-white rounded bg-bkg-grey"
            >
              {tokenInfo?.symbol ? `#${tokenInfo.symbol}` : '(No symbol)'}
            </Text>
          }
        >
          <div className="flex items-center">
            <img
              src={tokenInfo?.logoURI || '/icons/generic-token-icon.svg'}
              className="w-8"
            />
            <Text level="0" className="ml-3 input-base">
              {tokenInfo?.name || '(Unnamed)'}
            </Text>
          </div>
        </SummaryModule>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <SummaryModule title="Approval threshold">
          <Text level="0" className="input-base">
            {yesVotePercentage}%
          </Text>
        </SummaryModule>
        <SummaryModule
          title={`Can DAO mint ${nftIsCommunityToken ? 'NFTs' : 'Tokens'}?`}
        >
          <Text level="0" className="input-base">
            {transferMintAuthority === true ? 'Yes' : 'No'}
          </Text>
        </SummaryModule>
        {minimumNumberOfTokensToGovern && (
          <SummaryModule title="Min. number of tokens needed to edit DAO">
            <Text level="0" className="input-base">
              {minimumNumberOfTokensToGovern.toLocaleString()}
            </Text>
          </SummaryModule>
        )}
        {mintSupplyFactor && (
          <SummaryModule title="Mint supply factor">
            <Text level="0" className="input-base">
              {mintSupplyFactor}
            </Text>
          </SummaryModule>
        )}
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
      <div>
        <Text level="1" className="mt-6">
          Council info
        </Text>
      </div>
      <SummaryModule
        title="Council token"
        rightSide={
          <Text
            level="2"
            className="flex items-center px-6 py-1 ml-2 text-white rounded bg-bkg-grey"
          >
            {tokenInfo.symbol !== '(No symbol)'
              ? `#${tokenInfo.symbol}`
              : '(No symbol)'}
          </Text>
        }
      >
        <div className="flex">
          <img
            src={tokenInfo?.logoURI || '/icons/generic-token-icon.svg'}
            className="w-8"
          />
          <Text level="0" className="ml-3 input-base">
            {tokenInfo?.name || '(Unnamed)'}
          </Text>
        </div>
      </SummaryModule>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        <SummaryModule title="Council members">
          <Text level="0" className="input-base">
            {numberOfMembers}
          </Text>
        </SummaryModule>
        <SummaryModule title="Approval threshold">
          <Text level="0" className="input-base">
            {yesVotePercentage}%
          </Text>
        </SummaryModule>
        <SummaryModule title="Can DAO add council members?">
          <Text level="0" className="input-base">
            {transferMintAuthority === true ? 'Yes' : 'No'}
          </Text>
        </SummaryModule>
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
  const nftCollectionMetadata =
    (formData?.collectionKey && formData?.collectionMetadata) || {}
  const nftCollectionCount = formData?.numberOfNFTs || 0
  const nftCollectionInfo = {
    ...nftCollectionMetadata,
    nftCollectionCount,
  }
  const programId = formData?.programId || ''

  return (
    <div data-testid="wizard-summary">
      <FormHeader
        type={type}
        currentStep={currentStep}
        totalSteps={currentStep}
        title="Here's what you created. Does everything look right?"
      />
      <div className="mt-10 space-y-2">
        <SummaryModule
          title={type === MULTISIG_FORM ? 'Wallet name' : 'DAO name'}
        >
          <Header as="h3">{formData?.name}</Header>
        </SummaryModule>
        {type === MULTISIG_FORM ? (
          <div className="grid grid-cols-2 gap-2">
            <SummaryModule title="Invited members">
              <Header as="h3">{formData?.memberAddresses?.length}</Header>
            </SummaryModule>
            <SummaryModule title="Approval threshold">
              <Header as="h3" className="flex items-end">
                {formData?.councilYesVotePercentage}

                <Header as="h4" className="mb-0">
                  %
                </Header>
              </Header>
            </SummaryModule>
          </div>
        ) : (
          <>
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
            {(formData.addCouncil || formData?.memberAddresses?.length > 0) && (
              <CouncilInfo
                tokenInfo={formData.councilTokenInfo}
                transferMintAuthority={
                  formData.transferCouncilMintAuthority ||
                  !formData.useExistingCouncilToken
                }
                yesVotePercentage={
                  formData?.councilYesVotePercentage ||
                  formData.communityYesVotePercentage
                }
                numberOfMembers={formData?.memberAddresses?.length}
              />
            )}
          </>
        )}
        {programId && (
          <SummaryModule title="Program ID" advancedOption>
            <Header as="h3">{programId}</Header>
          </SummaryModule>
        )}
      </div>
      <FormFooter
        isValid
        loading={submissionPending}
        ctaText={type === MULTISIG_FORM ? 'Create wallet' : 'Create DAO'}
        prevClickHandler={() => onPrevClick(currentStep)}
        submitClickHandler={onSubmit}
      />
    </div>
  )
}
