import * as Tabs from '@radix-ui/react-tabs'
import React from 'react'
import cx from 'classnames'

import { Programs } from '@models/treasury/Asset'

import Overview from './Overview'
import Tab from '../../WalletDetails/Info/Tab'

enum Choice {
  Overview = 'Overview',
  Stats = 'Stats',
}

interface Props {
  className?: string
  programs: Programs
}

export default function Info(props: Props) {
  return (
    <article className={cx(props.className, 'bg-bkg-3')}>
      <Tabs.Root defaultValue={Choice.Overview}>
        <Tabs.List className="flex items-center border-b border-white/30 w-full">
          <Tab value={Choice.Overview}>Overview</Tab>
          {/* <Tab value={Choice.Stats}>Statistics</Tab> */}
        </Tabs.List>
        <Tabs.Content value={Choice.Overview}>
          <Overview className="py-8" programs={props.programs} />
        </Tabs.Content>
        <Tabs.Content value={Choice.Stats}>
          {/* <Statistics className="py-8" statistics={props.programs} /> */}
        </Tabs.Content>
      </Tabs.Root>
    </article>
  )
}
