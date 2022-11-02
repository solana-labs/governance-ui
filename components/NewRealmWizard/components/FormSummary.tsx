import FormHeader from '@components/NewRealmWizard/components/FormHeader'
import FormFooter from '@components/NewRealmWizard/components/FormFooter'

import Header from '@components/Header'
import Text from '@components/Text'

import { FORM_NAME as MULTISIG_FORM } from 'pages/realms/new/multisig'
import { FORM_NAME as COMMUNITY_TOKEN_FORM } from 'pages/realms/new/community-token'
import { GenericTokenIcon } from './TokenInfoTable'

const TO_BE_GENERATED = '(To be generated)'

function SummaryModule({
  className = '',
  title,
  advancedOption = false,
  rightSide = <></>,
  children,
}) {
  return (
    <div
      className={`bg-bkg-2 rounded-md pl-6 pr-8 py-6 grow ${className} flex flex-wrap justify-between items-center`}
    >
      <div className="flex flex-col">
        <Text level="2" className="flex mb-2 text-fgd-2">
          {title}
          {advancedOption && (
            <Text
              level="3"
              className="flex items-center px-2 ml-2 rounded bg-bkg-3 text-fgd-2"
            >
              Advanced Option
            </Text>
          )}
        </Text>
        {children}
      </div>
      <div className="mt-2 md:mt-0">{rightSide ? rightSide : <></>}</div>
    </div>
  )
}

function TokenInfoSummary({ title, name, symbol, logoURI }) {
  return (
    <SummaryModule
      title={title}
      rightSide={
        symbol && (
          <Text
            level="2"
            className="flex items-center px-6 py-1 rounded bg-bkg-3"
          >
            #{symbol}
          </Text>
        )
      }
    >
      <div className="flex items-center">
        {logoURI ? (
          <img src={logoURI} className="w-8" />
        ) : (
          <div className="w-8 text-fgd-2">
            <GenericTokenIcon />
          </div>
        )}
        <Text level="0" className="ml-2 input-base">
          {name || '(Unnamed)'}
        </Text>
      </div>
    </SummaryModule>
  )
}

function CommunityInfo({
  tokenInfo,
  mintAddress,
  transferMintAuthority,
  mintSupplyFactor,
  communityAbsoluteMaxVoteWeight,
  yesVotePercentage,
  minimumNumberOfTokensToGovern,
  nftInfo,
}) {
  const nftIsCommunityToken = !!nftInfo?.name
  const updatedTokenInfo = {
    ...tokenInfo,
    name: tokenInfo?.name || mintAddress || TO_BE_GENERATED,
  }

  return (
    <>
      <div>
        <Text level="1" className="mt-6">
          Community Info
        </Text>
      </div>
      {nftIsCommunityToken ? (
        <SummaryModule
          title="Selected NFT collection"
          rightSide={
            <Text
              level="2"
              className="flex items-center px-6 py-1 rounded bg-bkg-3"
            >
              {nftInfo?.nftCollectionCount?.toLocaleString()}
              {nftInfo?.nftCollectionCount !== 1 ? ' NFTs' : ' NFT'}
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
        <TokenInfoSummary title="Community token" {...updatedTokenInfo} />
      )}
      <div
        className={`grid grid-cols-1 gap-2 ${
          !nftIsCommunityToken ? 'sm:grid-cols-2' : ''
        }`}
      >
        <SummaryModule title="Approval threshold">
          <Text level="0" className="input-base">
            {yesVotePercentage}%
          </Text>
        </SummaryModule>
        {updatedTokenInfo.name !== TO_BE_GENERATED && !nftIsCommunityToken && (
          <SummaryModule title="Transfer mint authority?">
            <Text level="0" className="input-base">
              {transferMintAuthority === true ? 'Yes' : 'No'}
            </Text>
          </SummaryModule>
        )}
        {minimumNumberOfTokensToGovern && (
          <SummaryModule title="Min. number of tokens needed to manage DAO">
            <Text level="0" className="input-base">
              {minimumNumberOfTokensToGovern.toLocaleString()}
            </Text>
          </SummaryModule>
        )}
        {mintSupplyFactor && (
          <SummaryModule title="Circulation supply factor">
            <Text level="0" className="input-base">
              {mintSupplyFactor}
            </Text>
          </SummaryModule>
        )}
        {communityAbsoluteMaxVoteWeight && (
          <SummaryModule title="Absolute max voter weight">
            <Text level="0" className="input-base">
              {communityAbsoluteMaxVoteWeight}
            </Text>
          </SummaryModule>
        )}
      </div>
    </>
  )
}

function CouncilInfo({
  tokenInfo,
  mintAddress,
  transferMintAuthority,
  // yesVotePercentage,
  numberOfMembers,
}) {
  const updatedTokenInfo = {
    ...tokenInfo,
    name: tokenInfo?.name || mintAddress || TO_BE_GENERATED,
  }

  return (
    <>
      <div>
        <Text level="1" className="mt-6">
          Council info
        </Text>
      </div>
      <TokenInfoSummary title="Council token" {...updatedTokenInfo} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <SummaryModule title="Council members">
          <Text level="0" className="input-base">
            {numberOfMembers}
          </Text>
        </SummaryModule>
        {/* <SummaryModule title="Approval threshold">
          <Text level="0" className="input-base">
            {yesVotePercentage}%
          </Text>
        </SummaryModule> */}
        {updatedTokenInfo.name !== TO_BE_GENERATED && (
          <SummaryModule title="Transfer mint authority?">
            <Text level="0" className="input-base">
              {transferMintAuthority === true ? 'Yes' : 'No'}
            </Text>
          </SummaryModule>
        )}
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
        title={`Nearly done, let's check that things look right.`}
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

                <div className="mb-0 heading-sm">%</div>
              </Header>
            </SummaryModule>
          </div>
        ) : (
          <>
            <CommunityInfo
              mintAddress={formData.communityTokenMintAddress}
              tokenInfo={formData.communityTokenInfo}
              transferMintAuthority={formData.transferCommunityMintAuthority}
              mintSupplyFactor={formData.communityMintSupplyFactor}
              communityAbsoluteMaxVoteWeight={
                formData.communityAbsoluteMaxVoteWeight
              }
              yesVotePercentage={formData.communityYesVotePercentage}
              minimumNumberOfTokensToGovern={
                formData.minimumNumberOfCommunityTokensToGovern
              }
              nftInfo={nftCollectionInfo}
            />
            {(formData.addCouncil || formData?.memberAddresses?.length > 0) && (
              <CouncilInfo
                tokenInfo={formData.councilTokenInfo}
                mintAddress={formData.councilTokenMintAddress}
                transferMintAuthority={
                  formData.transferCouncilMintAuthority ||
                  !formData.useExistingCouncilToken
                }
                // yesVotePercentage={
                //   formData?.councilYesVotePercentage ||
                //   formData.communityYesVotePercentage
                // }
                numberOfMembers={formData?.memberAddresses?.length}
              />
            )}
          </>
        )}
        {programId && (
          <SummaryModule title="Program ID" advancedOption>
            <div className="grid">
              <div className="truncate input-base">{programId}</div>
            </div>
          </SummaryModule>
        )}
      </div>
      <FormFooter
        isValid
        loading={submissionPending}
        ctaText={
          type === MULTISIG_FORM
            ? 'Create wallet'
            : `Create ${
                type === COMMUNITY_TOKEN_FORM
                  ? 'Community Token'
                  : 'NFT Community'
              } DAO`
        }
        prevClickHandler={() => onPrevClick(currentStep)}
        submitClickHandler={() => onSubmit(formData)}
      />
    </div>
  )
}
