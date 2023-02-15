import React, { useState } from 'react'
import cx from 'classnames'
import {
  PencilIcon,
  PlusCircleIcon,
  UsersIcon,
  XCircleIcon,
} from '@heroicons/react/outline'
import { useRouter } from 'next/router'

import { Mint } from '@models/treasury/Asset'
import { formatNumber } from '@utils/formatNumber'
import { SecondaryButton } from '@components/Button'
import useRealm from '@hooks/useRealm'
import Modal from '@components/Modal'
import AddMemberForm from '@components/Members/AddMemberForm'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletStore from 'stores/useWalletStore'
import useQueryContext from '@hooks/useQueryContext'
import { Instructions } from '@utils/uiTypes/proposalCreationTypes'
import MetadataCreationModal from 'pages/dao/[symbol]/params/MetadataCreationModal'
import Address from '@components/Address'

import MintIcon from '../../icons/MintIcon'
import CouncilMintIcon from '../../icons/CouncilMintIcon'
import CommunityMintIcon from '../../icons/CommunityMintIcon'
import TokenIcon from '../../icons/TokenIcon'
import { GoverningTokenType } from '@solana/spl-governance'
import useProgramVersion from '@hooks/useProgramVersion'

interface Props {
  className?: string
  mint: Mint
}

const useTokenType = (govpop: 'community' | 'council' | undefined) => {
  const { config } = useRealm()
  switch (govpop) {
    case undefined:
      return undefined
    case 'community':
      return config?.account.communityTokenConfig.tokenType
    case 'council':
      return config?.account.councilTokenConfig.tokenType
  }
}

export default function Header(props: Props) {
  const programVersion = useProgramVersion()

  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false)
  const [createMetadataModalOpen, setCreateMetadataModalOpen] = useState(false)
  const {
    canUseAuthorityInstruction,
    canUseMintInstruction,
    canMintRealmCouncilToken,
  } = useGovernanceAssets()
  const {
    realmInfo,
    symbol,
    toManyCouncilOutstandingProposalsForUse,
    toManyCommunityOutstandingProposalsForUser,
  } = useRealm()
  const connected = useWalletStore((s) => s.connected)
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const tokenType = useTokenType(props.mint.tokenRole)

  const membership =
    programVersion >= 3
      ? tokenType === GoverningTokenType.Membership
      : props.mint.tokenRole === 'council'

  const typeLabel = membership ? 'Membership' : 'Token Mint'

  const subheading =
    props.mint.tokenRole === 'community'
      ? 'Community ' + typeLabel
      : props.mint.tokenRole === 'council'
      ? 'Council ' + typeLabel
      : ''

  let addNewMemberTooltip: string | undefined

  if (props.mint.tokenRole === 'council') {
    if (!connected) {
      addNewMemberTooltip =
        'Connect your wallet to add or remove council members'
    } else if (!canMintRealmCouncilToken()) {
      addNewMemberTooltip =
        'Your realm needs mint governance for council token to add or remove members'
    } else if (!canUseMintInstruction) {
      addNewMemberTooltip =
        "You don't have enough governance power to add or remove council members"
    }
  } else {
    if (!connected) {
      addNewMemberTooltip = 'You must connect your wallet'
    } else if (!canUseMintInstruction) {
      addNewMemberTooltip = "You don't have enough governance power"
    }
  }

  if (!addNewMemberTooltip) {
    if (toManyCommunityOutstandingProposalsForUser) {
      addNewMemberTooltip =
        'You have too many community outstanding proposals. You need to finalize them before you can create another one.'
    } else if (toManyCouncilOutstandingProposalsForUse) {
      addNewMemberTooltip =
        'You have too many council outstanding proposals. You need to finalize them before you can create another one.'
    }
  }

  return (
    <div
      className={cx(
        props.className,
        'bg-bkg-1',
        'gap-x-4',
        'grid-cols-[1fr_max-content]',
        'grid',
        'min-h-[128px]',
        'px-8',
        'py-4'
      )}
    >
      <div className="grid items-center gap-4 grid-cols-[repeat(auto-fill,minmax(275px,1fr))]">
        <div>
          <div className="grid items-center grid-cols-[40px_1fr] gap-x-4">
            <div className="h-10 relative w-10">
              {realmInfo?.ogImage && !!props.mint.tokenRole ? (
                <img className="h-10 w-10" src={realmInfo.ogImage} />
              ) : membership ? (
                <UsersIcon className="h-10 w-10" />
              ) : (
                <TokenIcon className="h-10 w-10 fill-fgd-1" />
              )}
              <div className="absolute bottom-1 right-1 translate-x-1/2 translate-y-1/2 h-5 w-5 rounded-full bg-fgd-1 flex items-center justify-center">
                <MintIcon className="stroke-black h-3 w-3" />
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="text-white/50 text-sm">{subheading}</div>
              <div className="text-fgd-1 font-bold text-2xl whitespace-nowrap text-ellipsis overflow-hidden">
                {props.mint.tokenRole ? realmInfo?.displayName : 'Token Mint'}
              </div>
            </div>
          </div>
          <Address address={props.mint.address} className="ml-14 text-xs" />
        </div>
        {props.mint.totalSupply && (
          <div className="pl-14">
            <div className="text-sm text-white/50 flex items-center space-x-1">
              {props.mint.tokenRole &&
                (props.mint.tokenRole === 'community' ? (
                  <CommunityMintIcon className="h-4 w-4 stroke-white/50" />
                ) : (
                  <CouncilMintIcon className="h-4 w-4 stroke-white/50" />
                ))}
              <div>
                Total{' '}
                {tokenType === GoverningTokenType.Membership
                  ? 'Members'
                  : 'Supply'}
              </div>
            </div>
            <div className="flex items-baseline space-x-1">
              <div className="text-xl text-fgd-1 font-bold">
                {formatNumber(props.mint.totalSupply, undefined, {})}
              </div>
              <div className="text-xs text-fgd-1">{props.mint.symbol}</div>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col space-y-2 max-h-[128px] justify-center">
        <SecondaryButton
          small={membership}
          className="w-48"
          disabled={!!addNewMemberTooltip}
          tooltipMessage={addNewMemberTooltip}
          onClick={() => {
            if (membership) {
              setAddMemberModalOpen(true)
            } else {
              router.push(
                fmtUrlWithCluster(
                  `/dao/${symbol}/proposal/new?i=${Instructions.Mint}&m=${props.mint.address}`
                )
              )
            }
          }}
        >
          <div className="flex items-center justify-center">
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            {membership ? 'Add Member' : 'Mint Tokens'}
          </div>
        </SecondaryButton>
        {membership && programVersion >= 3 && (
          <SecondaryButton
            className="w-48"
            small={membership}
            disabled={!!addNewMemberTooltip}
            tooltipMessage={addNewMemberTooltip}
            onClick={() => {
              router.push(
                fmtUrlWithCluster(
                  `/dao/${symbol}/proposal/new?i=${Instructions.RevokeGoverningTokens}&membershipPopulation=${props.mint.tokenRole}`
                )
              )
            }}
          >
            <div className="flex items-center justify-center">
              <XCircleIcon className="h-4 w-4 mr-1" />
              Remove Member
            </div>
          </SecondaryButton>
        )}
        <SecondaryButton
          small={membership}
          className="w-48"
          disabled={!canUseAuthorityInstruction}
          tooltipMessage={
            !canUseAuthorityInstruction
              ? 'Please connect a wallet with enough voting power to create realm config proposals'
              : undefined
          }
          onClick={() => setCreateMetadataModalOpen(true)}
        >
          <div className="flex items-center justify-center">
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit Token Info
          </div>
        </SecondaryButton>
      </div>
      {addMemberModalOpen && (
        <Modal
          isOpen
          sizeClassName="sm:max-w-3xl"
          onClose={() => setAddMemberModalOpen(false)}
        >
          <AddMemberForm
            close={() => setAddMemberModalOpen(false)}
            mintAccount={props.mint.raw}
          />
        </Modal>
      )}
      {createMetadataModalOpen && (
        <MetadataCreationModal
          isOpen
          governance={props.mint.raw.governance}
          initialMintAccount={props.mint.raw}
          closeModal={() => setCreateMetadataModalOpen(false)}
        />
      )}
    </div>
  )
}
