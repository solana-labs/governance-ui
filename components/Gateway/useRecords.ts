import useVotePluginsClientStore from '../../stores/useVotePluginsClientStore'
import { PublicKey } from '@solana/web3.js'
import { useCallback, useEffect, useState } from 'react'
import useWalletStore from '../../stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import { getVoterWeightRecord as getPluginVoterWeightRecord } from '@utils/plugin/accounts'
import { Client } from '@utils/uiTypes/VotePlugin'

// A data structure that indicates if a record that a plugin relies on (token owner record or voter weight recird)
// exists on chain or not - if not, it will trigger the "Join" button to create it.
// TODO aside from generalising this out of the GatewayClient, and moving it out of the UI,
//  we might want to change this in the future to return the actual accounts instead of just booleans
// for whether the accounts exist. But this would need some kind of common interface across plugins
type AvailableRecord = {
  publicKey: PublicKey | null
  accountExists: boolean
  accountRequired: boolean
}
type AvailableRecordAccounts = {
  tokenOwnerRecord: AvailableRecord
  voteWeightRecord: AvailableRecord
}

export const useRecords = (): AvailableRecordAccounts => {
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { tokenRecords, realm } = useRealm()
  const ownTokenRecord = wallet?.publicKey
    ? tokenRecords[wallet.publicKey!.toBase58()]
    : null

  // TODO replace these with useDispatch
  const [tokenOwnerRecord, setTokenOwnerRecord] = useState<AvailableRecord>({
    publicKey: null,
    accountExists: false,
    accountRequired: true,
  })
  const [voteWeightRecord, setVoteWeightRecord] = useState<AvailableRecord>({
    publicKey: null,
    accountExists: false,
    accountRequired: true,
  })

  const getVoteWeightRecordPK = useCallback(
    async (client: Client) => {
      if (realm && wallet && wallet.publicKey) {
        const { voterWeightPk } = await getPluginVoterWeightRecord(
          realm.pubkey,
          realm.account.communityMint,
          wallet.publicKey,
          client.program.programId
        )
        return voterWeightPk
      } else {
        return undefined
      }
    },
    [realm, wallet, client]
  )

  const accountExists = useCallback(
    async (publicKey: PublicKey) => {
      const account = await connection.current.getAccountInfo(publicKey)
      return !!account
    },
    [connection]
  )

  useEffect(() => {
    (async () => {
      // tokenOwnerRecord
      if (ownTokenRecord) {
        setTokenOwnerRecord({
          publicKey: ownTokenRecord.pubkey,
          accountExists: true,
          accountRequired: true,
        })
      } else {
        console.log('useRecords: token owner record not found')
      }

      // voteWeightRecord
      if (client && client.client) {
        const voteWeightRecordPK = await getVoteWeightRecordPK(client.client)
        if (voteWeightRecordPK) {
          setVoteWeightRecord({
            publicKey: voteWeightRecordPK,
            accountExists: await accountExists(voteWeightRecordPK),
            accountRequired: true,
          })
        } else {
          console.log('useRecords: voter weight record not found')
        }
      } else {
        console.log('useRecords: voter weight record not needed')
        setVoteWeightRecord({
          publicKey: null,
          accountExists: false,
          accountRequired: true,
        })
      }
    })()
  }, [client, wallet])

  return {
    tokenOwnerRecord,
    voteWeightRecord,
  }
}
