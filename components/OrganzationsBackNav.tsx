import React, { useState } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import { getResourcePathPart } from '../tools/core/resources'
import { useRouter } from 'next/router'
import useRealm from '../hooks/useRealm'

const OrganzationsBackNav = () => {
  const { realm, realmInfo } = useRealm()
  const { DAO } = process.env
  const router = useRouter()
  const [showAltImg, setShowAltImg] = useState(false)
  const realmName = realmInfo?.mainnetName ?? realm?.info?.name
  const onLogoError = () => {
    setShowAltImg(true)
  }
  return !DAO ? (
    <div>
      <div
        className="flex items-center hover:cursor-pointer"
        onClick={() => router.push('/realms')}
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light mr-2" />{' '}
        Organizations
      </div>
      <div>
        <a href={realmInfo?.website ? `${realmInfo?.website}` : ''}>
          {realmName &&
            (!showAltImg ? (
              <img
                className="h-14 w-24 mt-5"
                src={`/realms/${getResourcePathPart(realmName)}/img/logo.svg`}
                alt={realmName}
                width="auto"
                onError={onLogoError}
              />
            ) : (
              <div className="flex flex-columns items-center mt-5">
                <div className="rounded-full h-14 w-14 flex items-center justify-center border-2 font-bold border-gray-500 text-gray-300">
                  {realmName?.charAt(0)}
                </div>
                <span className="ml-2">{realmName}</span>
              </div>
            ))}
        </a>
      </div>
    </div>
  ) : null
}

export default OrganzationsBackNav
