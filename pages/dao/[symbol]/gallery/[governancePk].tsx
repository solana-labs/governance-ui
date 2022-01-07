import { getExplorerUrl } from '@components/explorer/tools'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { PhotographIcon } from '@heroicons/react/outline'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import { getNfts } from '@utils/tokens'
import { PublicKey } from '@solana/web3.js'
import Loading from '@components/Loading'
import { DEFAULT_NFT_TREASURY_MINT } from '@components/instructions/tools'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Select from '@components/inputs/Select'
import AccountItemNFT from '@components/TreasuryAccount/AccountItemNFT'
import useRealm from '@hooks/useRealm'
import useQueryContext from '@hooks/useQueryContext'

const gallery = () => {
  const router = useRouter()
  const connection = useWalletStore((s) => s.connection)
  const { symbol } = useRealm()
  const governancePk = router?.query?.governancePk
  const { nftsGovernedTokenAccounts } = useGovernanceAssets()
  const { fmtUrlWithCluster } = useQueryContext()
  const fetchAllNftsForRealm = DEFAULT_NFT_TREASURY_MINT === governancePk
  const currentAccount = nftsGovernedTokenAccounts.find(
    (x) => x.governance?.pubkey.toBase58() === governancePk
  )
  const [nfts, setNfts] = useState<NFTWithMint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const getAllNftData = async () => {
      if (governancePk) {
        setIsLoading(true)
        let realmNfts: NFTWithMint[] = []

        //TODO If we will have many nft accounts we would need to rethink performance of this.
        if (fetchAllNftsForRealm) {
          for (const acc of nftsGovernedTokenAccounts) {
            const nfts = acc.governance?.pubkey
              ? await getNfts(connection, acc.governance.pubkey)
              : []
            realmNfts = [...realmNfts, ...nfts]
          }
        } else {
          realmNfts = await getNfts(connection, new PublicKey(governancePk))
        }

        setNfts(realmNfts)
        setIsLoading(false)
      }
    }
    if (governancePk) {
      getAllNftData()
    }
  }, [governancePk, connection.endpoint, nftsGovernedTokenAccounts.length])
  return (
    <div className="grid grid-cols-12">
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12 space-y-3">
        <div className="flex flex-row items-center">
          <PreviousRouteBtn />
          <h1 className="ml-3">Collectables</h1>
          <div className="ml-auto">
            <Select
              className="w-44 border-0"
              onChange={(value) => {
                router.push(
                  fmtUrlWithCluster(`/dao/${symbol}/gallery/${value}`)
                )
              }}
              value={currentAccount?.governance?.pubkey.toBase58()}
              componentLabel={
                currentAccount ? (
                  <AccountItemNFT
                    className="m-0 p-0 py-0 px-0 border-0 hover:bg-bkg-1"
                    onClick={() => null}
                    governedAccountTokenAccount={currentAccount}
                  ></AccountItemNFT>
                ) : (
                  <div>All</div>
                )
              }
            >
              <Select.Option
                key={DEFAULT_NFT_TREASURY_MINT}
                value={DEFAULT_NFT_TREASURY_MINT}
              >
                <div>All</div>
              </Select.Option>

              {nftsGovernedTokenAccounts.map((accountWithGovernance) => (
                <Select.Option
                  key={accountWithGovernance?.governance?.pubkey.toBase58()}
                  value={accountWithGovernance.governance?.pubkey.toBase58()}
                >
                  <AccountItemNFT
                    onClick={() => null}
                    className="m-0 p-0 py-0 px-0 border-0 hover:bg-bkg-2"
                    governedAccountTokenAccount={accountWithGovernance}
                  />
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>

        {isLoading ? (
          <Loading></Loading>
        ) : nfts.length ? (
          <div className="flex flex-row flex-wrap gap-4">
            {nfts.map((x, idx) => (
              <a
                key={idx}
                href={getExplorerUrl(connection.endpoint, x.mint)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  className="bg-bkg-2 cursor-pointer default-transition rounded-lg border border-transparent hover:border-primary-dark"
                  style={{
                    width: '150px',
                    height: '150px',
                  }}
                  src={x.val.image}
                />
              </a>
            ))}
          </div>
        ) : (
          <div className="text-fgd-3 flex flex-col items-center">
            There are no NFTs in the treasury
            <PhotographIcon className="opacity-5 w-56 h-56"></PhotographIcon>
          </div>
        )}
      </div>
    </div>
  )
}

export default gallery
