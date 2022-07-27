import React, { useState } from 'react'
import cx from 'classnames'
import { DocumentDuplicateIcon, PlusIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'

import { Mint } from '@models/treasury/Asset'
import { abbreviateAddress } from '@utils/formatting'
import { formatNumber } from '@utils/formatNumber'
import { SecondaryButton } from '@components/Button'
import useRealm from '@hooks/useRealm'
import Modal from '@components/Modal'
import AddMemberForm from '@components/Members/AddMemberForm'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletStore from 'stores/useWalletStore'
import useQueryContext from '@hooks/useQueryContext'
import { Instructions } from '@utils/uiTypes/proposalCreationTypes'

import MintIcon from '../../icons/MintIcon'
import CouncilMintIcon from '../../icons/CouncilMintIcon'
import CommunityMintIcon from '../../icons/CommunityMintIcon'

interface Props {
  className?: string
  mint: Mint
}

export default function Header(props: Props) {
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false)
  const {
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

  const subheading =
    props.mint.tokenType === 'community'
      ? 'Community Token Mint'
      : props.mint.tokenType === 'council'
      ? 'Council Token Mint'
      : 'Token Mint'

  let addNewMemberTooltip: string | undefined

  if (props.mint.tokenType === 'council') {
    if (!connected) {
      addNewMemberTooltip = 'Connect your wallet to add new council member'
    } else if (!canMintRealmCouncilToken()) {
      addNewMemberTooltip =
        'Your realm need mint governance for council token to add new member'
    } else if (!canUseMintInstruction) {
      addNewMemberTooltip =
        "You don't have enough governance power to add new council member"
    }
  } else {
    if (!connected) {
      addNewMemberTooltip = 'You must connect your wallet'
    } else if (!canUseMintInstruction) {
      addNewMemberTooltip =
        "You don't have enough governance power to mint new tokens"
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
        'bg-black',
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
          <div className="grid items-center grid-cols-[40px_1fr] gap-x-2">
            <div className="h-10 relative w-10">
              <img
                className="h-9 w-9"
                src={
                  realmInfo?.ogImage ||
                  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
                }
              />
              <div className="absolute bottom-0 left-6 translate-y-1/2 h-4 w-4 rounded-full bg-fgd-1 flex items-center justify-center">
                <MintIcon className="fill-black h-2 w-2" />
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="text-white/50 text-sm">{subheading}</div>
              <div className="text-fgd-1 font-bold text-2xl whitespace-nowrap text-ellipsis overflow-hidden">
                {realmInfo?.displayName || props.mint.name}
              </div>
            </div>
          </div>
          <button
            className={cx(
              'cursor-pointer',
              'flex',
              'items-center',
              'ml-12',
              'space-x-2',
              'text-white/50',
              'text-xs',
              'transition-colors',
              'hover:text-fgd-1'
            )}
            onClick={async () => {
              try {
                await navigator?.clipboard?.writeText(props.mint.address)
              } catch {
                console.error('Could not copy address to clipboard')
              }
            }}
          >
            <div>{abbreviateAddress(props.mint.address)}</div>
            <DocumentDuplicateIcon className="h-4 w-4" />
          </button>
        </div>
        {props.mint.totalSupply && (
          <div className="pl-12">
            <div className="text-sm text-white/50 flex items-center space-x-1">
              {props.mint.tokenType &&
                (props.mint.tokenType === 'community' ? (
                  <CommunityMintIcon className="h-4 w-4 stroke-white/50" />
                ) : (
                  <CouncilMintIcon className="h-4 w-4 stroke-white/50" />
                ))}
              <div>Total Supply</div>
            </div>
            <div className="flex items-baseline space-x-1">
              <div className="text-xl text-fgd-1 font-bold">
                {formatNumber(props.mint.totalSupply, undefined, {})}
              </div>
              <div className="text-xs text-fgd-1">{props.mint.name}</div>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col space-y-2 max-h-[128px] justify-center">
        <SecondaryButton
          className="w-48"
          disabled={!!addNewMemberTooltip}
          tooltipMessage={addNewMemberTooltip}
          onClick={() => {
            if (props.mint.tokenType === 'council') {
              setAddMemberModalOpen(true)
            } else {
              router.push(
                fmtUrlWithCluster(
                  `/dao/${symbol}/proposal/new?i=${Instructions.Mint}`
                )
              )
            }
          }}
        >
          <div className="flex items-center justify-center">
            <PlusIcon className="h-4 w-4 mr-1 scale-x-[-1]" />
            {props.mint.tokenType === 'council' ? 'Add Member' : 'Mint Tokens'}
          </div>
        </SecondaryButton>
      </div>
      {addMemberModalOpen && (
        <Modal
          isOpen
          sizeClassName="sm:max-w-3xl"
          onClose={() => setAddMemberModalOpen(false)}
        >
          <AddMemberForm close={() => setAddMemberModalOpen(false)} />
        </Modal>
      )}
    </div>
  )
}
