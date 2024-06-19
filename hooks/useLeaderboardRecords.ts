import { useEffect, useState } from 'react'
import { pipe } from 'fp-ts/function'
import { matchW, fromTaskOption } from 'fp-ts/TaskEither'
import {
  ProgramAccount,
  TokenOwnerRecord,
} from '@solana/spl-governance'

import { getTokenOwnerRecords } from '@models/proposal'
import { getLockTokensVotingPowerPerWallet } from 'VoteStakeRegistry/tools/deposits'
import { BN } from '@coral-xyz/anchor'
import { useRealmQuery } from './queries/realm'
import {useVsrClient} from "../VoterWeightPlugins/useVsrClient";
import { useConnection, useWallet } from '@solana/wallet-adapter-react'

export default function useLeaderboardRecords() {
  const realm = useRealmQuery().data?.result
  const { connection } = useConnection()
  const { wallet } = useWallet()
  const { vsrClient } = useVsrClient();
  const [tokenOwnerRecords, setTokenOwnerRecords] = useState<ProgramAccount<TokenOwnerRecord>[] | null>(null)
  const [votePowerRecords, setVotePowerRecords] = useState<Record<string, BN> | null>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (connection && realm) {
      pipe(
        () =>
          getTokenOwnerRecords({
            governingTokenMint: realm.account.communityMint,
            connection: connection,
            programId: realm.owner,
            realm: realm.pubkey,
          }),
        fromTaskOption(() => new Error('Could not fetch token records.')),
        matchW((reason) => {
          console.log(reason)
          setError("Could not fetch token records.")
        }, setTokenOwnerRecords)
      )()
    }
  }, [connection, realm])

  useEffect(() => {
    //VSR only
    if (realm && connection && vsrClient && tokenOwnerRecords && tokenOwnerRecords.length) {
      const walletsPks = tokenOwnerRecords.map((t) => t.account.governingTokenOwner)
      getLockTokensVotingPowerPerWallet(walletsPks, realm, vsrClient, connection)
        .then(setVotePowerRecords)
        .catch(() => setError("Could not fetch voting powers."))
    }
  }, [
    tokenOwnerRecords?.length,
    tokenOwnerRecords,
    realm,
    vsrClient,
    connection,
  ])

  const leaders = tokenOwnerRecords?.map((t) => {
    const w = t.account.governingTokenOwner.toBase58()
    const votingPower = votePowerRecords && votePowerRecords[w] ? votePowerRecords[w] : new BN(0)

    return {
      wallet: w,
      votingPower,
      isYou: w === wallet?.adapter.publicKey?.toBase58()
    }
  })
    .filter((l) => !l.votingPower.isZero())
    .sort((a, b) => b.votingPower.toNumber() - a.votingPower.toNumber())
    .map((l, i) => ({...l, rank: i + 1}))

  return {
    error,
    loading: !tokenOwnerRecords || !votePowerRecords,
    leaders
  }
}
