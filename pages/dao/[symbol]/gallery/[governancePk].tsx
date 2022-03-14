import { getExplorerUrl } from '@components/explorer/tools'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { PhotographIcon, PlusCircleIcon } from '@heroicons/react/outline'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import { DEFAULT_NFT_TREASURY_MINT } from '@components/instructions/tools'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Select from '@components/inputs/Select'
import AccountItemNFT from '@components/TreasuryAccount/AccountItemNFT'
import useRealm from '@hooks/useRealm'
import useQueryContext from '@hooks/useQueryContext'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import ImgWithLoader from '@components/ImgWithLoader'
import Modal from '@components/Modal'
import DepositNFT from '@components/TreasuryAccount/DepositNFT'
import { LinkButton } from '@components/Button'

const gallery = () => {
  const router = useRouter()
  const connection = useWalletStore((s) => s.connection)
  const { getNfts } = useTreasuryAccountStore()
  const realmNfts = useTreasuryAccountStore((s) => s.allNfts)
  const isLoading = useTreasuryAccountStore((s) => s.isLoadingNfts)
  const governanceNfts = useTreasuryAccountStore((s) => s.governanceNfts)
  const { symbol } = useRealm()
  const governancePk = router?.query?.governancePk
  const { nftsGovernedTokenAccounts } = useGovernanceAssets()
  const { fmtUrlWithCluster } = useQueryContext()
  const fetchAllNftsForRealm = DEFAULT_NFT_TREASURY_MINT === governancePk
  const currentAccount = nftsGovernedTokenAccounts.find(
    (x) => x.governance?.pubkey.toBase58() === governancePk
  )
  const { setCurrentAccount } = useTreasuryAccountStore()
  const [nfts, setNfts] = useState<NFTWithMint[]>([])
  const [openNftDepositModal, setOpenNftDepositModal] = useState(false)
  const handleCloseModal = () => {
    setOpenNftDepositModal(false)
  }
  useEffect(() => {
    if (governancePk) {
      getNfts(nftsGovernedTokenAccounts, connection.current)
    }
  }, [
    governancePk,
    connection.endpoint,
    JSON.stringify(nftsGovernedTokenAccounts),
  ])
  useEffect(() => {
    const governedNfts = governanceNfts[governancePk as string]
    if (fetchAllNftsForRealm) {
      setNfts(realmNfts)
    } else if (governedNfts) {
      setNfts(governanceNfts[governancePk as string])
    }
  }, [realmNfts.length, JSON.stringify(governanceNfts), governancePk])
  return (
    <div className="bg-bkg-2 rounded-lg p-4 md:p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <div className="mb-4">
            <PreviousRouteBtn />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:space-x-6">
            <div className="flex items-center justify-between w-full">
              <h1 className="mb-0">NFTs</h1>
              <LinkButton
                onClick={() => {
                  setCurrentAccount(nftsGovernedTokenAccounts[0], connection)
                  setOpenNftDepositModal(true)
                }}
                className="flex items-center text-primary-light whitespace-nowrap"
              >
                <PlusCircleIcon className="h-5 mr-2 w-5" />
                Deposit NFT
              </LinkButton>
            </div>
            <Select
              className="sm:w-44 mt-2 sm:mt-0"
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
                  />
                ) : (
                  <div>
                    <div className="mb-0.5 text-xs text-fgd-1">Show All</div>
                    <div className="text-xs text-fgd-3">{nfts.length} NFTs</div>
                  </div>
                )
              }
            >
              <Select.Option
                key={DEFAULT_NFT_TREASURY_MINT}
                value={DEFAULT_NFT_TREASURY_MINT}
              >
                <div>
                  <div className="mb-0.5 text-xs text-fgd-1">Show All</div>
                  <div className="text-xs text-fgd-3">{nfts.length} NFTs</div>
                </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-flow-row gap-6">
            {isLoading ? (
              <>
                <div className="animate-pulse bg-bkg-3 col-span-1 h-48 rounded-lg" />
                <div className="animate-pulse bg-bkg-3 col-span-1 h-48 rounded-lg" />
                <div className="animate-pulse bg-bkg-3 col-span-1 h-48 rounded-lg" />
                <div className="animate-pulse bg-bkg-3 col-span-1 h-48 rounded-lg" />
              </>
            ) : nfts.length ? (
              nfts.map((x, idx) => (
                <a
                  className="bg-bkg-4 col-span-1 flex items-center justify-center rounded-lg filter drop-shadow-xl"
                  key={idx}
                  href={
                    connection.endpoint && x.mint
                      ? getExplorerUrl(connection.endpoint, x.mint)
                      : ''
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ImgWithLoader
                    className="bg-bkg-2 cursor-pointer default-transition h-full w-full rounded-md border border-transparent transform scale-90 hover:scale-95"
                    src={x.val.image}
                  />
                </a>
              ))
            ) : (
              <div className="col-span-4 text-fgd-3 flex flex-col items-center">
                <PhotographIcon className="opacity-5 w-56 h-56" />
              </div>
            )}
          </div>
        </div>
      </div>
      {openNftDepositModal && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={handleCloseModal}
          isOpen={openNftDepositModal}
        >
          <DepositNFT onClose={handleCloseModal}></DepositNFT>
        </Modal>
      )}
    </div>
  )
}

export default gallery
