import React from 'react'
import type { BigNumber } from 'bignumber.js'

import { formatNumber } from '@utils/formatNumber'
import useRealm from '@hooks/useRealm'

import MintIcon from '../../../icons/MintIcon'
import CouncilMintIcon from '../../../icons/CouncilMintIcon'
import CommunityMintIcon from '../../../icons/CommunityMintIcon'
import TokenIcon from '../../../icons/TokenIcon'
import ListItem from './ListItem'

interface Props {
  className?: string
  selected?: boolean
  tokenName: string
  tokenSymbol: string
  tokenType?: 'council' | 'community'
  totalSupply?: BigNumber
  onSelect?(): void
}

export default function MintListItem(props: Props) {
  const { realmInfo } = useRealm()

  return (
    <ListItem
      className={props.className}
      name={
        props.tokenType === 'council'
          ? 'Council Token Mint'
          : props.tokenType === 'community'
          ? 'Community Token Mint'
          : props.tokenName + ' Mint'
      }
      rhs={
        <div className="flex flex-col items-end">
          {props.totalSupply && (
            <div className="flex items-center space-x-1">
              <div className="text-xs text-fgd-1 font-bold">
                {formatNumber(props.totalSupply, undefined, {})}
              </div>
              <div className="text-xs text-fgd-1">{props.tokenSymbol}</div>
            </div>
          )}
          <div className="text-xs text-white/50 flex items-center space-x-1">
            {props.tokenType &&
              (props.tokenType === 'community' ? (
                <CommunityMintIcon className="h-3 w-3 stroke-white/50" />
              ) : (
                <CouncilMintIcon className="h-3 w-3 stroke-white/50" />
              ))}
            <div>Total Supply</div>
          </div>
        </div>
      }
      selected={props.selected}
      thumbnail={
        <div className="h-6 relative w-6">
          {realmInfo?.ogImage && !!props.tokenType ? (
            <img className="h-6 w-6" src={realmInfo.ogImage} />
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
