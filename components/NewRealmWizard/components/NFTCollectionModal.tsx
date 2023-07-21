import { useEffect, useState } from 'react'
import { abbreviateAddress } from '@utils/formatting'

import Header from '@components/Header'
import Button from '@components/Button'
import NFTCollectionSelector from '@components/NewRealmWizard/components/NFTCollectionSelector'
import { WalletIcon } from './steps/AddNFTCollectionForm'
import Modal from '@components/Modal'

import {
  dasByIdQueryFn,
  digitalAssetsQueryKeys,
  useDigitalAssetsByOwner,
} from '@hooks/queries/digitalAssets'
import { useConnection } from '@solana/wallet-adapter-react'
import { useAsync } from 'react-async-hook'
import queryClient from '@hooks/queries/queryClient'
import { getNetworkFromEndpoint } from '@utils/connection'
import { PublicKey } from '@solana/web3.js'

function filterAndMapVerifiedCollections(nfts) {
  return nfts
    ?.filter((nft) => {
      if (
        nft.grouping &&
        nft.grouping.find((x) => x.group_key === 'collection')
      ) {
        return true
      } else {
        return false
      }
    })
    .reduce((prev, curr) => {
      const collectionKey = curr.grouping.find(
        (x) => x.group_key === 'collection'
      )?.group_value
      if (typeof collectionKey === 'undefined') return prev

      if (prev[collectionKey]) {
        prev[collectionKey].push(curr)
      } else {
        prev[collectionKey] = [curr]
      }
      return prev
    }, {})
}

export const useOwnerVerifiedCollections = (owner: PublicKey) => {
  const { connection } = useConnection()
  const network = getNetworkFromEndpoint(connection.rpcEndpoint)
  if (network === 'localnet') throw new Error()
  const { data: ownedNfts } = useDigitalAssetsByOwner(owner)

  const enabled = owner !== undefined && ownedNfts !== undefined
  return useAsync(async () => {
    if (!enabled) throw new Error()

    const verifiedNfts = filterAndMapVerifiedCollections(ownedNfts)
    const verifiedCollections = await Promise.all(
      Object.keys(verifiedNfts).map(async (collectionKey) => {
        const { result: collection } = await queryClient.fetchQuery({
          queryKey: digitalAssetsQueryKeys.byId(
            network,
            new PublicKey(collectionKey)
          ),
          queryFn: () => dasByIdQueryFn(network, new PublicKey(collectionKey)),
          staleTime: Infinity,
        })
        if (collection !== undefined) {
          return {
            ...collection,
            collectionMintAddress: collectionKey,
            nfts: verifiedNfts[collectionKey],
          }
        } else {
          return null
        }
      })
    )

    return verifiedCollections.filter((x) => x !== null)
  }, [connection, ownedNfts, enabled])
}

export default function NFTCollectionModal({
  isShow,
  walletPk,
  setError,
  onClose,
  onSelect,
}) {
  const { result: collections, loading } = useOwnerVerifiedCollections(walletPk)
  const [show, setShow] = useState(false)
  const [selected, setSelected] = useState('')
  function close() {
    onClose()
    setSelected('')
  }

  function handleChoose() {
    onSelect({ key: selected, collection: collections![selected] })
    close()
  }

  useEffect(() => {
    if (collections && Object.keys(collections).length === 0) {
      setError(
        'collectionInput',
        {
          type: 'error',
          message: 'Current wallet has no verified collection',
        },
        { shouldFocus: true }
      )
    } else {
      setShow(isShow)
    }
  }, [isShow, collections, setError])

  if (!show) {
    return <></>
  }
  return (
    show && (
      <Modal isOpen={show} onClose={onClose} sizeClassName="sm:max-w-2xl">
        <div className="flex flex-col items-center py-4 mb-2 space-x-4 text-center">
          <Header as="h4" className="text-fgd-1">
            Choose a collection from your wallet
          </Header>
          <Header
            as="cta"
            className="flex items-center justify-center mt-1 space-x-1 text-fgd-2"
          >
            <WalletIcon />
            <div>{walletPk && abbreviateAddress(walletPk)}</div>
          </Header>
        </div>
        <NFTCollectionSelector
          isLoading={loading}
          collections={collections}
          onChange={setSelected}
          value={selected}
        />
        <div className="float-right mt-2">
          <Button onClick={handleChoose} disabled={!selected}>
            Choose
          </Button>
        </div>
      </Modal>
    )
  )
}
