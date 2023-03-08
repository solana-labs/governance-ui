import * as Tabs from '@radix-ui/react-tabs'
import React from 'react'
import cx from 'classnames'

import { Wallet } from '@models/treasury/Wallet'

import Dashboard from './Dashboard'
import Tab from './Tab'
import Rules from './Rules'
import { SolanaBreakdowns } from '@multifarm/solana-realms'

import { useTabState } from '../../tabState'

enum Choice {
  Dashboard = 'Dashboard',
  Rules = 'Rules',
  Treasury = 'Treasury',
}

interface Props {
  className?: string
  wallet: Wallet
}

export default function Info(props: Props) {
  const hasRules = props.wallet.rules.community || props.wallet.rules.council
  const { get, set } = useTabState()

  return (
    <article className={cx(props.className, 'bg-bkg-3')}>
      <Tabs.Root
        value={get('wallet') || Choice.Dashboard}
        onValueChange={(newValue) => set('wallet', newValue)}
      >
        <Tabs.List className="flex items-center border-b border-white/30 w-full">
          <Tab value={Choice.Dashboard}>Activity</Tab>
          {hasRules && <Tab value={Choice.Rules}>Rules</Tab>}
          <Tab value={Choice.Treasury}>Treasury</Tab>
        </Tabs.List>
        <Tabs.Content value={Choice.Dashboard}>
          <Dashboard className="py-8" wallet={props.wallet} />
        </Tabs.Content>
        <Tabs.Content value={Choice.Rules}>
          <Rules className="py-8" wallet={props.wallet} />
        </Tabs.Content>
        <Tabs.Content value={Choice.Treasury}>
          <SolanaBreakdowns wallet={props.wallet} />
        </Tabs.Content>
      </Tabs.Root>
    </article>
  )
}
