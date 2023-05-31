import React from 'react'

import { formatNumber } from '@utils/formatNumber'
import useRealm from '@hooks/useRealm'

import MintIcon from '../../../icons/MintIcon'
import CouncilMintIcon from '../../../icons/CouncilMintIcon'
import CommunityMintIcon from '../../../icons/CommunityMintIcon'
import TokenIcon from '../../../icons/TokenIcon'
import ListItem from './ListItem'
import { Mint } from '@models/treasury/Asset'
import { GoverningTokenType } from '@solana/spl-governance'
import { UsersIcon } from '@heroicons/react/outline'
import useProgramVersion from '@hooks/useProgramVersion'
import { DEFAULT_GOVERNANCE_PROGRAM_VERSION } from '@components/instructions/tools'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'

interface Props {
  className?: string
  selected?: boolean
  mint: Mint
  onSelect?(): void
}

const useTokenType = (govpop: 'community' | 'council' | undefined) => {
  const config = useRealmConfigQuery().data?.result
  switch (govpop) {
    case undefined:
      return undefined
    case 'community':
      return config?.account.communityTokenConfig.tokenType
    case 'council':
      return config?.account.councilTokenConfig.tokenType
  }
}

export default function MintListItem(props: Props) {
  const { realmInfo } = useRealm()
  const tokenType = useTokenType(props.mint.tokenRole)
  const programVersion = useProgramVersion()

  const membership =
    (programVersion ?? DEFAULT_GOVERNANCE_PROGRAM_VERSION) >= 3
      ? tokenType === GoverningTokenType.Membership
      : props.mint.tokenRole === 'council'

  const typeLabel = membership ? 'Membership' : 'Token Mint'

  return (
    <ListItem
      className={props.className}
      name={
        props.mint.tokenRole === 'council'
          ? `Council ` + typeLabel
          : props.mint.tokenRole === 'community'
          ? 'Community ' + typeLabel
          : props.mint.name + ' Mint'
      }
      rhs={
        <div className="flex flex-col items-end">
          {props.mint.totalSupply && (
            <div className="flex items-center space-x-1">
              <div className="text-xs text-fgd-1 font-bold">
                {formatNumber(props.mint.totalSupply, undefined, {})}
              </div>
              <div className="text-xs text-fgd-1">{props.mint.symbol}</div>
            </div>
          )}
          <div className="text-xs text-white/50 flex items-center space-x-1">
            {props.mint.tokenRole &&
              (props.mint.tokenRole === 'community' ? (
                <CommunityMintIcon className="h-3 w-3 stroke-white/50" />
              ) : (
                <CouncilMintIcon className="h-3 w-3 stroke-white/50" />
              ))}
            <div>Total {membership ? 'Members' : 'Supply'}</div>
          </div>
        </div>
      }
      selected={props.selected}
      thumbnail={
        <div className="h-6 relative w-6">
          {realmInfo?.ogImage && !!props.mint.tokenRole ? (
            <img className="h-6 w-6" src={realmInfo.ogImage} />
          ) : membership ? (
            <UsersIcon className="h-6 w-6" />
          ) : (
            <TokenIcon className="h-6 w-6 fill-fgd-1" />
          )}
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 h-5 w-5 rounded-full bg-fgd-1 flex items-center justify-center">
            <MintIcon className="stroke-black h-3 w-3" />
          </div>
        </div>
      }
      onSelect={props.onSelect}
    />
  )
}
