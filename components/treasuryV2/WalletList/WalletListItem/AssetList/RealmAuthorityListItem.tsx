import React from 'react'
import cx from 'classnames'

import LogoRealms from 'public/img/logo-realms.png'

import ListItem from './ListItem'
import OutsideSrcImg from '@components/OutsideSrcImg'

interface Props {
  className?: string
  name: string
  selected?: boolean
  thumbnail: JSX.Element
  onSelect?(): void
}

export default function RealmAuthorityListItem(props: Props) {
  return (
    <ListItem
      className={props.className}
      name={props.name}
      rhs={
        <div className="flex items-end flex-col text-xs text-white/50">DAO</div>
      }
      selected={props.selected}
      thumbnail={
        <div className="relative">
          {React.cloneElement(props.thumbnail, {
            className: cx(
              props.thumbnail.props.className,
              'h-6',
              'rounded-sm',
              'stroke-fgd-1',
              'w-6'
            ),
          })}
          <div
            className={cx(
              'absolute',
              'bg-fgd-1',
              'bottom-0',
              'flex',
              'h-5',
              'items-center',
              'justify-center',
              'right-0',
              'rounded-full',
              'translate-x-1/2',
              'translate-y-1/2',
              'w-5'
            )}
          >
            <OutsideSrcImg className="h-4 w-4" src={LogoRealms.src} />
          </div>
        </div>
      }
      onSelect={props.onSelect}
    />
  )
}
