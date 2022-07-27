import * as Tabs from '@radix-ui/react-tabs'
import React from 'react'
import cx from 'classnames'

import { NFTCollection } from '@models/treasury/Asset'
import { formatNumber } from '@utils/formatNumber'

import Overview from './Overview'
import Tab from '../../WalletDetails/Info/Tab'

enum Choice {
  Overview = 'Overview',
  Stats = 'Stats',
}

interface Props {
  className?: string
  nftCollection: NFTCollection
}

export default function Info(props: Props) {
  return (
    <article className={cx(props.className, 'bg-bkg-3')}>
      <Tabs.Root defaultValue={Choice.Overview}>
        <Tabs.List className="flex items-center border-b border-white/30 w-full">
          <Tab value={Choice.Overview}>
            <div className="flex items-center space-x-2">
              <div>NFTs</div>
              <div className="px-1 rounded-full bg-white/10 text-center min-w-[32px]">
                {formatNumber(props.nftCollection.count, undefined, {})}
              </div>
            </div>
          </Tab>
          {/* <Tab value={Choice.Stats}>Statistics</Tab> */}
        </Tabs.List>
        <Tabs.Content value={Choice.Overview}>
          <Overview className="py-8" nftCollection={props.nftCollection} />
        </Tabs.Content>
        <Tabs.Content value={Choice.Stats}>
          {/* <Statistics className="py-8" statistics={props.programs} /> */}
        </Tabs.Content>
      </Tabs.Root>
    </article>
  )
}
