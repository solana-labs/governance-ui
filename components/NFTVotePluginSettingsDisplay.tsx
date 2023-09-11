import { PublicKey } from '@solana/web3.js'
import type BN from 'bn.js'
import cx from 'classnames'

import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import NFTIcon from '@components/treasuryV2/icons/NFTCollectionPreviewIcon'
import { useConnection } from '@solana/wallet-adapter-react'
import { useAsync } from 'react-async-hook'
import { fetchDigitalAssetById } from '@hooks/queries/digitalAssets'
import { getNetworkFromEndpoint } from '@utils/connection'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import BigNumber from 'bignumber.js'

interface CollectionConfig {
  collection: PublicKey
  size: number
  weight: BN
}

interface Props {
  className?: string
}

export function NFTVotePluginSettingsDisplay(props: Props) {
  const { connection } = useConnection()
  const registrar = useVotePluginsClientStore((s) => s.state.nftMintRegistrar)

  const { result: configsWithNames } = useAsync(async () => {
    const collectionConfigs = (registrar?.collectionConfigs ||
      []) as CollectionConfig[]
    const network = getNetworkFromEndpoint(connection.rpcEndpoint)
    if (network === 'localnet') throw new Error()

    return Promise.all(
      collectionConfigs.map(async (collectionConfig) => {
        const collectionNft = await fetchDigitalAssetById(
          network,
          collectionConfig.collection
        )
        const name = collectionNft?.result?.content.metadata.name
        return { name: name ?? 'Unknown Collection', ...collectionConfig }
      })
    )
  }, [connection.rpcEndpoint, registrar?.collectionConfigs])

  const governingMint = useMintInfoByPubkeyQuery(registrar?.governingTokenMint)
    .data?.result

  return configsWithNames === undefined ? (
    <div className={props.className}>
      <div className="text-xl text-fgd-1 font-bold flex items-center space-x-2">
        <NFTIcon className="h-5 w-5 stroke-current" />{' '}
        <span>NFT Voting Configuration</span>
      </div>
      <div className="rounded bg-bkg-2 px-6 py-4 mt-4 h-[140px] animate-pulse" />
    </div>
  ) : (
    <div className={props.className}>
      <div className="text-xl text-fgd-1 font-bold flex items-center space-x-2">
        <NFTIcon className="h-5 w-5 stroke-current" />{' '}
        <span>NFT Voting Configuration</span>
      </div>
      {configsWithNames.map((collection, i) => (
        <div className="rounded bg-bkg-2 px-6 py-4 mt-4" key={i}>
          <div className="grid grid-cols-[max-content,1fr] items-start gap-x-4">
            <div className="text-lg text-fgd-1 font-bold">{i + 1}.</div>
            <div>
              <div className="text-lg text-fgd-2 font-semibold">
                {collection.name}
              </div>
              <div className="text-xs text-white/50">
                {collection.collection.toBase58()}
              </div>
              <div
                className={cx(
                  'gap-x-4',
                  'gap-y-1',
                  'grid-cols-[max-content,max-content]',
                  'grid',
                  'mt-4',
                  'text-fgd-2',
                  'text-sm'
                )}
              >
                <div className="text-white/50"># NFTs in Collection:</div>
                <div>{collection.size}</div>
                {governingMint && (
                  <>
                    <div className="text-white/50">Vote Weight per NFT:</div>
                    <div>
                      {new BigNumber(collection.weight.toString())
                        .shiftedBy(-governingMint.decimals)
                        .toFormat()}
                    </div>
                  </>
                )}
              </div>
              {/* <NFTList className="mt-4" nfts={collection.nfts} /> */}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
