'use client'

import { web3 } from '@coral-xyz/anchor'
import { DialectSolanaSdk } from '@dialectlabs/react-sdk-blockchain-solana'
import { NotificationsButton } from '@dialectlabs/react-ui'

const REALMS_PUBLIC_KEY = new web3.PublicKey(
  'BUxZD6aECR5B5MopyvvYqJxwSKDBhx2jSSo1U32en6mj'
)

export default function DialectNotifications() {
  return (
    <DialectSolanaSdk dappAddress={REALMS_PUBLIC_KEY.toString()}>
      <NotificationsButton />
    </DialectSolanaSdk>
  )
}
