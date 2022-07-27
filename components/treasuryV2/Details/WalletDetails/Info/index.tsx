import * as Tabs from '@radix-ui/react-tabs'
import React from 'react'
import cx from 'classnames'

import { Wallet } from '@models/treasury/Wallet'

import Tab from './Tab'
import Rules from './Rules'
import Statistics from './Statistics'

enum Choice {
  Rules = 'Rules',
  Stats = 'Stats',
}

interface Props {
  className?: string
  wallet: Wallet
}

export default function Info(props: Props) {
  const hasRules = props.wallet.rules.community || props.wallet.rules.council

  return (
    <article className={cx(props.className, 'bg-bkg-3')}>
      <Tabs.Root defaultValue={hasRules ? Choice.Rules : Choice.Stats}>
        <Tabs.List className="flex items-center border-b border-white/30 w-full">
          {hasRules && <Tab value={Choice.Rules}>Rules</Tab>}
          <Tab value={Choice.Stats}>Statistics</Tab>
        </Tabs.List>
        <Tabs.Content value={Choice.Rules}>
          <Rules className="py-8" wallet={props.wallet} />
        </Tabs.Content>
        <Tabs.Content value={Choice.Stats}>
          <Statistics className="py-8" statistics={props.wallet.stats} />
        </Tabs.Content>
      </Tabs.Root>
    </article>
  )
}
