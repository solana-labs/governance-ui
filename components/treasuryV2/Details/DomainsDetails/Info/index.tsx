import React from 'react'
import cx from 'classnames'

import * as Tabs from '@radix-ui/react-tabs'
import Tab from '../../WalletDetails/Info/Tab'
import { useTabState } from '../../tabState'

import { Domains } from '@models/treasury/Asset'

import Domain from './Domain'

enum Choice {
  Overview = 'Overview',
}

interface Props {
  className?: string
  domains: Domains
}

export default function Info(props: Props) {
  const { get, set } = useTabState()

  return (
    <article className={cx(props.className, 'bg-bkg-3')}>
      <Tabs.Root
        value={get('domains') || Choice.Overview}
        onValueChange={(newValue) => set('domains', newValue)}
      >
        <Tabs.List className="flex items-center border-b border-white/30 w-full">
          <Tab value={Choice.Overview}>
            <div className="flex items-center space-x-2">
              <div>Overview</div>
            </div>
          </Tab>
        </Tabs.List>
        <Tabs.Content value={Choice.Overview}>
          {props.domains.list.map((domain) => (
            <Domain domain={domain} key={domain.address} />
          ))}
        </Tabs.Content>
      </Tabs.Root>
    </article>
  )
}
