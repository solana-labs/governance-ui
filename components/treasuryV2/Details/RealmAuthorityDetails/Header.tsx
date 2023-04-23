import React from 'react'
import cx from 'classnames'

import LogoRealms from 'public/img/logo-realms.png'

import { RealmAuthority } from '@models/treasury/Asset'
import Address from '@components/Address'
import OutsideSrcImg from '@components/OutsideSrcImg'

interface Props {
  className?: string
  realmAuthority: RealmAuthority
}

export default function Header(props: Props) {
  return (
    <div
      className={cx(
        props.className,
        'bg-bkg-1',
        'flex',
        'gap-x-4',
        'items-center',
        'justify-between',
        'min-h-[128px]',
        'px-8',
        'py-4'
      )}
    >
      <div>
        <div className="grid items-center grid-cols-[40px_1fr] gap-x-4">
          <div className="h-10 relative w-10">
            {React.cloneElement(props.realmAuthority.icon, {
              className: cx(props.realmAuthority.icon.props, 'h-10', 'w-10'),
            })}
            <div
              className={cx(
                'absolute',
                'bg-fgd-1',
                'bottom-1',
                'flex',
                'h-5',
                'items-center',
                'justify-center',
                'right-1',
                'rounded-full',
                'translate-x-1/2',
                'translate-y-1/2',
                'w-5'
              )}
            >
              <OutsideSrcImg className="h-4 w-4" src={LogoRealms.src} />
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="text-white/50 text-sm">DAO</div>
            <div className="text-fgd-1 font-bold text-2xl whitespace-nowrap text-ellipsis overflow-hidden">
              {props.realmAuthority.name}
            </div>
          </div>
        </div>
        <Address
          address={props.realmAuthority.address}
          className="ml-14 text-xs"
        />
      </div>
    </div>
  )
}
