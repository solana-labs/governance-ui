import * as Tabs from '@radix-ui/react-tabs'
import React from 'react'
import cx from 'classnames'

import Overview from './Overview'
import Tab from '../../WalletDetails/Info/Tab'
import { useTabState } from '../../tabState'
import { Stake } from '@models/treasury/Asset'

enum Choice {
  Overview = 'Overview',
  Stats = 'Stats',
}

interface Props {
  className?: string
  account: Stake
}

export default function Info(props: Props) {
  const { get, set } = useTabState()

  return (
    <article className={cx(props.className, 'bg-bkg-3')}>
      <Tabs.Root
        value={get('programs') || Choice.Overview}
        onValueChange={(newValue) => set('programs', newValue)}
      >
        <Tabs.List className="flex items-center border-b border-white/30 w-full">
          <Tab value={Choice.Overview}>Overview</Tab>
        </Tabs.List>
        <Tabs.Content value={Choice.Overview}>
          <Overview className="py-8" account={props.account} />
        </Tabs.Content>
      </Tabs.Root>
    </article>
  )
}
