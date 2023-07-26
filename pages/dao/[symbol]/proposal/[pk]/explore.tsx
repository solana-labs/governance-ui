import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { ChevronLeftIcon } from '@heroicons/react/solid'

import { useProposalGovernanceQuery } from '@hooks/useProposal'
import useVoteRecords from '@hooks/useVoteRecords'
import ProposalStateBadge from '@components/ProposalStateBadge'
import ProposalTopVotersList from '@components/ProposalTopVotersList'
import ProposalTopVotersBubbleChart from '@components/ProposalTopVotersBubbleChart'
import useSignatories from '@hooks/useSignatories'
import ProposalSignatories from '@components/ProposalSignatories'
import ProposalVoteResult from '@components/ProposalVoteResults'
import ProposalRemainingVotingTime from '@components/ProposalRemainingVotingTime'
import { useRouteProposalQuery } from '@hooks/queries/proposal'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import Switch from '@components/Switch'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { NFT_PLUGINS_PKS } from '@constants/plugins'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import { fetchDigitalAssetsByOwner } from '@hooks/queries/digitalAssets'
import { PublicKey } from '@solana/web3.js'
import { getNetworkFromEndpoint } from '@utils/connection'
import { useConnection } from '@solana/wallet-adapter-react'
import { useAsync } from 'react-async-hook'

function filterAndMapVerifiedCollections(nfts, usedCollectionsPks) {
  return nfts
    ?.filter((nft) => {
      const collection = nft.grouping.find((x) => x.group_key === 'collection')
      if (
        collection &&
        usedCollectionsPks.includes(collection.group_value) &&
        (collection.verified || typeof collection.verified === 'undefined') &&
        nft.creators?.filter((x) => x.verified).length > 0
      ) {
        return true
      } else {
        return false
      }
    })
    .reduce((prev, curr) => {
      const collectionKey = curr.ownership.owner
      if (typeof collectionKey === 'undefined') return prev

      if (prev[collectionKey]) {
        prev[collectionKey].push(curr)
      } else {
        prev[collectionKey] = [curr]
      }
      return prev
    }, {})
}

export const useOwnerVerifiedCollections = (records) => {
  const { connection } = useConnection()
  const network = getNetworkFromEndpoint(connection.rpcEndpoint)
  if (network === 'localnet') throw new Error()
  const config = useRealmConfigQuery().data?.result
  const currentPluginPk = config?.account.communityTokenConfig.voterWeightAddin

  const [nftMintRegistrar] = useVotePluginsClientStore((s) => [
    s.state.nftMintRegistrar,
  ])

  const usedCollectionsPks: string[] = useMemo(
    () =>
      (currentPluginPk &&
        NFT_PLUGINS_PKS.includes(currentPluginPk?.toBase58()) &&
        nftMintRegistrar?.collectionConfigs.map((x) =>
          x.collection.toBase58()
        )) ||
      [],
    [currentPluginPk, nftMintRegistrar?.collectionConfigs]
  )

  const enabled = records !== undefined && usedCollectionsPks !== undefined
  return useAsync(async () => {
    if (!enabled) throw new Error()

    const ownersNfts = await Promise.all(
      records.map(async (record) => {
        const ownedNfts = await fetchDigitalAssetsByOwner(
          network,
          new PublicKey(record.key)
        )

        const verifiedNfts = filterAndMapVerifiedCollections(
          ownedNfts,
          usedCollectionsPks
        )
        console.log(verifiedNfts)
        return verifiedNfts
      })
    )
    return ownersNfts.filter((x) => x !== null)
  }, [connection, enabled, usedCollectionsPks])
}

export default function Explore() {
  const proposal = useRouteProposalQuery().data?.result
  const governance = useProposalGovernanceQuery().data?.result
  const [highlighted, setHighlighted] = useState<string | undefined>()
  const connection = useLegacyConnectionContext()
  const records = useVoteRecords(proposal)
  const signatories = useSignatories(proposal)
  const router = useRouter()
  const [showNfts, setShowNfts] = useState(false)
  const { result: votersNfts } = useOwnerVerifiedCollections(records)
  const config = useRealmConfigQuery().data?.result
  const currentPluginPk = config?.account.communityTokenConfig.voterWeightAddin

  const endpoint = connection.endpoint

  const toggleShowNfts = () => {
    setShowNfts(!showNfts)
  }

  return (
    <div className="bg-bkg-2 rounded-lg p-4 space-y-3 md:p-6">
      <button
        className={classNames(
          'default-transition',
          'flex',
          'items-center',
          'text-fgd-2',
          'text-sm',
          'transition-all',
          'hover:text-fgd-3'
        )}
        onClick={router.back}
      >
        <ChevronLeftIcon className="h-6 w-6 " />
        Back
      </button>
      {proposal && governance ? (
        <div className="py-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="mr-2">{proposal?.account.name}</h1>
            <ProposalStateBadge proposal={proposal.account} />
          </div>
          <div className="mb-4 mt-16 flex justify-between">
            <h3 className="">Top Voters</h3>
            <div
              className={`${
                currentPluginPk &&
                NFT_PLUGINS_PKS.includes(currentPluginPk.toBase58())
                  ? 'visible'
                  : 'hidden'
              } flex items-center`}
            >
              <p className="mb-0 mr-1 text-fgd-3">Show NFTs</p>
              <Switch
                checked={showNfts}
                onChange={() => {
                  toggleShowNfts()
                }}
              />
            </div>
          </div>

          <div
            className="grid gap-4 grid-cols-1 items-center lg:grid-cols-2"
            onMouseLeave={() => setHighlighted(undefined)}
          >
            <ProposalTopVotersList
              className="h-[500px]"
              data={records}
              endpoint={endpoint}
              highlighted={highlighted}
              onHighlight={setHighlighted}
            />
            <ProposalTopVotersBubbleChart
              className="h-[500px]"
              data={records}
              endpoint={endpoint}
              highlighted={highlighted}
              onHighlight={setHighlighted}
            />
          </div>
          <div className="grid gap-4 grid-cols-1 mt-16 lg:grid-cols-3">
            <ProposalSignatories
              endpoint={endpoint}
              proposal={proposal}
              signatories={signatories}
            />
            <ProposalVoteResult
              className="text-center"
              data={records}
              governance={governance}
              proposal={proposal}
            />
            <ProposalRemainingVotingTime
              align="right"
              governance={governance}
              proposal={proposal}
            />
          </div>
        </div>
      ) : (
        <div>
          <div className="animate-pulse bg-bkg-3 h-12 rounded-lg" />
          <div className="animate-pulse bg-bkg-3 h-[500px] rounded-lg mt-16" />
          <div className="animate-pulse bg-bkg-3 h-52 rounded-lg mt-16" />
        </div>
      )}
      {/* {highlighted && position && (
        <div
          className="w-32 bg-white absolute"
          style={{ left: position?.x + 300, top: position?.y + 100 }}
        >
          Helloworkd
        </div>
      )} */}
    </div>
  )
}
