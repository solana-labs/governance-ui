import React from 'react'
import { capitalize } from '@utils/helpers'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { getAccountName } from '@components/instructions/tools'

const AccountsView = () => {
  return <div>AccountsView</div>
}

const DisplayField = ({ label, val, padding = false, bg = false }) => {
  const pubkey = tryParsePublicKey(val)
  const name = pubkey ? getAccountName(pubkey) : ''
  return (
    <div
      className={`flex flex-col mb-2 ${bg ? 'bg-bkg-1' : ''} ${
        padding ? 'py-1' : ''
      }`}
    >
      <div className="text-xs text-fgd-3">{capitalize(label)}</div>
      <div className="text-sm break-all">
        {pubkey && name ? (
          <>
            <div className="text-xs">{name}</div>
            <div>{val}</div>
          </>
        ) : (
          <div>{val}</div>
        )}
      </div>
    </div>
  )
}

export default AccountsView
