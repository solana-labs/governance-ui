import Button from '@components/Button'
//import Loading from '@components/Loading'
//import NFTSelector from '@components/NFTS/NFTSelector'
import { ChevronRightIcon } from '@heroicons/react/outline'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
//import { NftVoterClient } from '@solana/governance-program-library'
import {
  getTokenOwnerRecordAddress,
  //SYSTEM_PROGRAM_ID,
  //withCreateTokenOwnerRecord,
} from '@solana/spl-governance'
//import { Transaction, TransactionInstruction } from '@solana/web3.js'
//import { sendTransaction } from '@utils/send'
import Link from 'next/link'
//import { getNftVoterWeightRecord } from 'NftVotePlugin/sdk/accounts'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import { useState, useEffect } from 'react'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'

const SwitchboardPermissionCard = () => {
  const { fmtUrlWithCluster } = useQueryContext()
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  );
  //const nfts = useNftPluginStore((s) => s.state.votingNfts)
  //const isLoading = useNftPluginStore((s) => s.state.isLoadingNfts)
  //const connection = useWalletStore((s) => s.connection)
  const [tokenOwnerRecordPk, setTokenOwneRecordPk] = useState('')
  const { tokenRecords, realm, symbol, mint, councilMint } = useRealm()
  //const { fetchRealm } = useWalletStore((s) => s.actions)
  const ownTokenRecord = wallet?.publicKey
    ? tokenRecords[wallet.publicKey!.toBase58()]
    : null

  useEffect(() => {
    const getTokenOwnerRecord = async () => {
      const defaultMint = !mint?.supply.isZero()
        ? realm!.account.communityMint
        : !councilMint?.supply.isZero()
        ? realm!.account.config.councilMint
        : undefined
      const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
        realm!.owner,
        realm!.pubkey,
        defaultMint!,
        wallet!.publicKey!
      )
      setTokenOwneRecordPk(tokenOwnerRecordAddress.toBase58())
    }
    if (realm && wallet?.connected) {
      getTokenOwnerRecord()
    }
  }, [realm?.pubkey.toBase58(), wallet?.connected])
  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="mb-0">Your Queue Voting Rights:</h3>
        <Link
          href={fmtUrlWithCluster(
            `/dao/${symbol}/account/${tokenOwnerRecordPk}`
          )}
        >
          <a
            className={`default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3 ${
              !connected || !tokenOwnerRecordPk
                ? 'opacity-50 pointer-events-none'
                : ''
            }`}
          >
            View
            <ChevronRightIcon className="flex-shrink-0 h-6 w-6" />
          </a>
        </Link>
      </div>
      <div className="space-y-4">Switchboard</div>
      {connected && !ownTokenRecord && (
        <Button className="w-full">Go to Switchboard.xyz</Button>
      )}
    </div>
  )
}
export default SwitchboardPermissionCard
