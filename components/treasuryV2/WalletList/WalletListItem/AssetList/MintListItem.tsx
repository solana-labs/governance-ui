import React from 'react'
import type { BigNumber } from 'bignumber.js'

import { formatNumber } from '@utils/formatNumber'
import useRealm from '@hooks/useRealm'

import MintIcon from '../../../icons/MintIcon'
import CouncilMintIcon from '../../../icons/CouncilMintIcon'
import CommunityMintIcon from '../../../icons/CommunityMintIcon'
import ListItem from './ListItem'

interface Props {
  className?: string
  selected?: boolean
  tokenName: string
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
          : (realmInfo?.displayName || props.tokenName) + ' Token Mint'
      }
      rhs={
        <div className="flex flex-col items-end">
          {props.totalSupply && (
            <div className="flex items-center space-x-1">
              <div className="text-xs text-fgd-1 font-bold">
                {formatNumber(props.totalSupply, undefined, {})}
              </div>
              <div className="text-xs text-fgd-1">{props.tokenName}</div>
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
          <img
            className="h-6 w-6"
            src={
              realmInfo?.ogImage ||
              'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
            }
          />
          <div className="absolute bottom-0 left-4 translate-y-1/2 h-4 w-4 rounded-full bg-fgd-1 flex items-center justify-center">
            <MintIcon className="fill-black h-2 w-2" />
          </div>
        </div>
      }
      onSelect={props.onSelect}
    />
  )
}
