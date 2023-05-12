import { PublicKey } from '@solana/web3.js'
import type BN from 'bn.js'
import React, { useEffect, useState } from 'react'
import { pipe } from 'fp-ts/lib/function'
import cx from 'classnames'
// import ChevronRightIcon from '@carbon/icons-react/lib/ChevronRight'

import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'
import { ConnectionContext } from '@utils/connection'
import BigNumber from 'bignumber.js'
import * as RE from '@utils/uiTypes/Result'
import NFTIcon from '@components/treasuryV2/icons/NFTCollectionPreviewIcon'
import { tryGetMint, getNFTsByCollection } from '@utils/tokens'

interface CollectionConfig {
  collection: PublicKey
  size: number
  weight: BN
}

async function fetchCollection(
  address: PublicKey,
  count: number,
  connection: ConnectionContext
) {
  const nfts = await getNFTsByCollection(
    address,
    connection.cluster === 'devnet'
  )
  const collectionName = nfts[0]?.collection.name

  return {
    name: collectionName,
    nfts: nfts
      .map((nft) => ({
        name: nft.name,
        owner: nft.owner,
      }))
      .sort((a, b) => {
        return a.name
          .toLocaleLowerCase()
          .localeCompare(b.name.toLocaleLowerCase())
      }),
  } as {
    name: string
    nfts: {
      name: string
      owner: null | PublicKey
    }[]
  }
}

async function fetchCollections(
  configs: CollectionConfig[],
  connection: ConnectionContext,
  mintPublicKey?: null | PublicKey
) {
  const collections = await Promise.all(
    configs.map((config) =>
      fetchCollection(config.collection, config.size, connection).then(
        (details) => ({
          name: details.name,
          nfts: details.nfts,
          numNFTs: config.size,
          publicKey: config.collection,
          voteWeight: new BigNumber(config.weight.toString()),
        })
      )
    )
  )

  const mint = mintPublicKey
    ? await tryGetMint(connection.current, mintPublicKey)
    : undefined

  return { collections, mint }
}

type Data = Awaited<ReturnType<typeof fetchCollections>>
// type Collections = Data['collections']
// type NFTs = Collections[number]['nfts']

// function NFTList(props: { className?: string; nfts: NFTs }) {
//   const [expanded, setExpanded] = useState(false)

//   return (
//     <div className={props.className}>
//       <button
//         className="flex items-center text-xs text-primary-light"
//         onClick={() => setExpanded((cur) => !cur)}
//       >
//         <div>{expanded ? 'Hide' : 'View'} NFTs</div>
//         <ChevronRightIcon
//           className={cx(
//             'h-4',
//             'w-4',
//             'fill-current',
//             'transition-transform',
//             expanded && 'rotate-90'
//           )}
//         />
//       </button>
//       {expanded && (
//         <div className="mt-2">
//           <div className="grid grid-cols-[25%,1fr] text-white/50 text-xs gap-1">
//             <div>Name</div>
//             <div>Owner</div>
//           </div>
//           <div className="grid grid-cols-[25%,1fr] text-sm text-fgd-1 gap-1 mt-1 max-h-96 overflow-y-auto">
//             {props.nfts.map((nft, i) => (
//               <React.Fragment key={i}>
//                 <div className="truncate">{nft.name}</div>
//                 <div className="truncate">
//                   {nft.owner ? nft.owner.toBase58() : ''}
//                 </div>
//               </React.Fragment>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

interface Props {
  className?: string
}

export function NFTVotePluginSettingsDisplay(props: Props) {
  const connection = useWalletStore((s) => s.connection)
  const registrar = useVotePluginsClientStore((s) => s.state.nftMintRegistrar)
  const [collections, setCollections] = useState<RE.Result<Data>>(RE.pending())

  const collectionConfigs: CollectionConfig[] =
    registrar?.collectionConfigs || []

  useEffect(() => {
    setCollections(RE.pending())
    fetchCollections(
      collectionConfigs,
      connection,
      registrar?.governingTokenMint
    )
      .then((collections) => {
        setCollections(RE.ok(collections))
      })
      .catch((error: any) => setCollections(RE.failed(error)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    collectionConfigs.map(({ collection }) => collection.toBase58()).join('-'),
  ])

  if (!collectionConfigs.length) {
    return null
  }

  return pipe(
    collections,
    RE.match(
      () => <div className={props.className} />,
      () => (
        <div className={props.className}>
          <div className="text-xl text-fgd-1 font-bold flex items-center space-x-2">
            <NFTIcon className="h-5 w-5 stroke-current" />{' '}
            <span>NFT Voting Configuration</span>
          </div>
          <div className="rounded bg-bkg-2 px-6 py-4 mt-4 h-[140px] animate-pulse" />
        </div>
      ),
      ({ collections, mint }) => (
        <div className={props.className}>
          <div className="text-xl text-fgd-1 font-bold flex items-center space-x-2">
            <NFTIcon className="h-5 w-5 stroke-current" />{' '}
            <span>NFT Voting Configuration</span>
          </div>
          {collections.map((collection, i) => (
            <div className="rounded bg-bkg-2 px-6 py-4 mt-4" key={i}>
              <div className="grid grid-cols-[max-content,1fr] items-start gap-x-4">
                <div className="text-2xl text-fgd-1 font-bold">{i + 1}.</div>
                <div>
                  <div className="text-2xl text-fgd-2 font-semibold">
                    {collection.name}
                  </div>
                  <div className="text-xs text-white/50">
                    {collection.publicKey.toBase58()}
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
                    <div>{collection.numNFTs}</div>
                    <div className="text-white/50">Vote Weight per NFT:</div>
                    <div>
                      {collection.voteWeight
                        .shiftedBy(mint ? -mint.account.decimals : 0)
                        .toFormat()}
                    </div>
                  </div>
                  {/* <NFTList className="mt-4" nfts={collection.nfts} /> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    )
  )
}
