import React from 'react'
import useRealm from 'hooks/useRealm'

const AboutRealm = () => {
  const { realmInfo, symbol } = useRealm()

  return (
    <div className="pb-4 space-y-3">
      <div>
        <p className="text-xs text-fgd-3">Name</p>
        <p className="text-fgd-1">{realmInfo?.displayName || symbol}</p>
      </div>
      {realmInfo?.isCertified ? (
        <div>
          <p className="text-xs text-fgd-3">Token</p>
          <p className="text-fgd-1">{symbol}</p>
        </div>
      ) : null}
      {realmInfo?.website ? (
        <div>
          <p className="text-xs text-fgd-3">Website</p>
          <a
            className="default-transition flex items-center text-primary-light hover:text-primary-dark text-sm"
            href={realmInfo?.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            {realmInfo?.website}
          </a>
        </div>
      ) : null}
      {realmInfo?.twitter ? (
        <div>
          <p className="text-xs text-fgd-3">Twitter</p>
          <a
            className="default-transition flex items-center text-primary-light hover:text-primary-dark text-sm"
            href={`https://twitter.com/${realmInfo?.twitter}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {realmInfo?.twitter}
          </a>
        </div>
      ) : null}
      <div>
        <p className="text-xs text-fgd-3">Program Version</p>
        <p className="text-fgd-1">{realmInfo?.programVersion}</p>
      </div>
    </div>
  )
}

export default AboutRealm
