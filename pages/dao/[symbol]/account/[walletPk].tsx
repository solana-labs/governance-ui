import React from 'react'
import useRealm from '@hooks/useRealm'
import { useRouter } from 'next/router'
import { default as Account } from '@components/Account'
import LockTokensAccount from 'VoteStakeRegistry/components/Account/LockTokensAccount'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import { useAsync } from 'react-async-hook'
import { fetchRealmByPubkey } from '@hooks/queries/realm'
import { useConnection } from '@solana/wallet-adapter-react'
import { getTokenOwnerRecordAddress } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'

/** This page is for viewing other people's accounts. only VSR uses it. */
const OtherAccountPage: React.FC = () => {
  const router = useRouter()
  const { vsrMode } = useRealm()
  const walletPk = router?.query?.walletPk
  const realmPk = useSelectedRealmPubkey()
  const { connection } = useConnection()

  const { result: tokenOwnerRecordPk } = useAsync(async () => {
    if (typeof walletPk !== 'string') throw new Error()
    if (realmPk === undefined) return undefined
    const { result: realm } = await fetchRealmByPubkey(connection, realmPk)
    if (!realm) throw new Error()
    return getTokenOwnerRecordAddress(
      realm.owner,
      realmPk,
      realm.account.communityMint,
      new PublicKey(walletPk)
    )
  }, [walletPk, realmPk, connection])

  if (vsrMode) {
    if (vsrMode === 'helium') {
      null
    }

    return tokenOwnerRecordPk ? (
      <LockTokensAccount tokenOwnerRecordPk={tokenOwnerRecordPk}>
        <Account withHeader={false} displayPanel={false} />
      </LockTokensAccount>
    ) : null
  }

  return null
}

export default OtherAccountPage
