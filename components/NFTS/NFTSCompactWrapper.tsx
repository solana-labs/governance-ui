import { getExplorerUrl } from '@components/explorer/tools'
import ImgWithLoader from '@components/ImgWithLoader'
import { DEFAULT_NFT_TREASURY_MINT } from '@components/instructions/tools'
import Loading from '@components/Loading'
import Modal from '@components/Modal'
import DepositNFT from '@components/TreasuryAccount/DepositNFT'
import { ArrowsExpandIcon, PhotographIcon } from '@heroicons/react/outline'
import { PlusIcon } from '@heroicons/react/solid'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'

const NFTSCompactWrapper = () => {
  const router = useRouter()
  const { nftsGovernedTokenAccounts } = useGovernanceAssets()
  const connection = useWalletStore((s) => s.connection)
  const realmNfts = useTreasuryAccountStore((s) => s.allNfts)
  const isLoading = useTreasuryAccountStore((s) => s.isLoadingNfts)
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  const [openNftDepositModal, setOpenNftDepositModal] = useState(false)
  const handleCloseModal = () => {
    setOpenNftDepositModal(false)
    resetCompactViewState()
  }
  const {
    setCurrentCompactAccount,
    resetCompactViewState,
  } = useTreasuryAccountStore()
  return nftsGovernedTokenAccounts.length ? (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg transition-all">
      <h3 className="mb-4 flex items-center">
        Collectables
        <ArrowsExpandIcon
          onClick={() => {
            const url = fmtUrlWithCluster(
              `/dao/${symbol}/gallery/${DEFAULT_NFT_TREASURY_MINT}`
            )
            router.push(url)
          }}
          className="text-fgd-3 flex-shrink-0 h-5 w-5 ml-auto cursor-pointer"
        ></ArrowsExpandIcon>
        <div
          onClick={() => {
            setCurrentCompactAccount(nftsGovernedTokenAccounts[0], connection)
            setOpenNftDepositModal(true)
          }}
          className="bg-[rgba(255,255,255,0.06)] h-6 w-6 flex font-bold items-center justify-center rounded-full text-fgd-3 ml-2 cursor-pointer"
        >
          <PlusIcon />
        </div>
      </h3>
      <div
        className="overflow-y-auto"
        style={{ maxHeight: '210px', minHeight: '50px' }}
      >
        {isLoading ? (
          <Loading></Loading>
        ) : realmNfts.length ? (
          <div className="flex flex-row flex-wrap gap-4  border border-fgd-4 p-3 rounded-lg">
            {realmNfts.map((x, idx) => (
              <a
                key={idx}
                href={getExplorerUrl(connection.endpoint, x.mint)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <ImgWithLoader
                  className="bg-bkg-2 cursor-pointer default-transition rounded-lg border border-transparent hover:border-primary-dark"
                  style={{
                    width: '60px',
                    height: '60px',
                  }}
                  src={x.val.image}
                />
              </a>
            ))}
          </div>
        ) : (
          <div className="text-fgd-3 flex flex-col items-center">
            <PhotographIcon className="opacity-5 w-56 h-56"></PhotographIcon>
          </div>
        )}
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
  ) : null
}

export default NFTSCompactWrapper
