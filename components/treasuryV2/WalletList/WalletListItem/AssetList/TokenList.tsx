import React from 'react'
import cx from 'classnames'

import { AssetType, Token, Sol } from '@models/treasury/Asset'

import Collapsible from './Collapsible'
import TokenIcon from '../../../icons/TokenIcon'
import TokenListItem from './TokenListItem'

interface Props {
  className?: string
  disableCollapse?: boolean
  expanded?: boolean
  tokens: (Token | Sol)[]
  selectedAssetId?: string | null
  onSelect?(token: Token | Sol): void
  onToggleExpand?(): void
}

export default function TokenList(props: Props) {
  const tokens = props.tokens.sort((a, b) => {
    const aTotal = a.count.multipliedBy(a.value)
    const bTotal = b.count.multipliedBy(b.value)

    if (aTotal.eq(bTotal)) {
      return b.count.comparedTo(a.count)
    }

    return bTotal.comparedTo(aTotal)
  })

  const expandCutoff = Math.max(
    tokens.findIndex((token) =>
      token.value.multipliedBy(token.count).isEqualTo(0)
    ),
    3
  )

  return (
    <Collapsible
      className={cx(props.className)}
      count={props.tokens.length}
      disableCollapse={props.disableCollapse}
      expanded={props.expanded}
      expandCutoff={expandCutoff}
      icon={<TokenIcon className="fill-white/50" />}
      title="Tokens"
      onToggleExpand={props.onToggleExpand}
    >
      {tokens.map((token, i) => (
        <TokenListItem
          amount={token.count}
          key={i}
          name={token.type === AssetType.Sol ? 'Solana' : token.name}
          price={token.price}
          symbol={token.type === AssetType.Sol ? 'SOL' : token.symbol}
          thumbnail={token.icon}
          selected={props.selectedAssetId === token.id}
          onSelect={() => props.onSelect?.(token)}
        />
      ))}
    </Collapsible>
  )
}
