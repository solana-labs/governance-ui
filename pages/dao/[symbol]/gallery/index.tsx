import { getExplorerUrl } from '@components/explorer/tools'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { PhotographIcon, PlusCircleIcon } from '@heroicons/react/outline'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Select from '@components/inputs/Select'
import AccountItemNFT from '@components/TreasuryAccount/AccountItemNFT'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import ImgWithLoader from '@components/ImgWithLoader'
import Modal from '@components/Modal'
import DepositNFT from '@components/TreasuryAccount/DepositNFT'
import { LinkButton } from '@components/Button'
import SendTokens from '@components/TreasuryAccount/SendTokens'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import { AssetAccount } from '@utils/uiTypes/assets'
import { MdScheduleSend } from 'react-icons/md'

const gallery = () => {
  const connection = useWalletStore((s) => s.connection)
  const realmNfts = useTreasuryAccountStore((s) => s.allNfts)
  const isLoading = useTreasuryAccountStore((s) => s.isLoadingNfts)
  const isLoadingGovernances = useGovernanceAssetsStore(
    (s) => s.loadGovernedAccounts
  )
  const nftsPerPubkey = useTreasuryAccountStore((s) => s.governanceNfts)
  const { nftsGovernedTokenAccounts } = useGovernanceAssets()
  const { setCurrentAccount } = useTreasuryAccountStore()
  const [currentAccount, setStateAccount] = useState<AssetAccount | null>(null)
  const [nfts, setNfts] = useState<NFTWithMint[]>([])
  const [openNftDepositModal, setOpenNftDepositModal] = useState(false)
  const [openSendNftsModal, setOpenSendNftsModal] = useState(false)
  const [selectedNft, setSelectedNft] = useState<NFTWithMint | null>(null)
  const handleCloseModal = () => {
    setOpenNftDepositModal(false)
  }
  const handleCloseSendModal = () => {
    setOpenSendNftsModal(false)
  }
  useEffect(() => {
    if (currentAccount === null) {
      setNfts(realmNfts)
    } else {
      const curretnAccountNfts: NFTWithMint[] = []
      const hasNftsInWithGovernanceOwner =
        nftsPerPubkey[currentAccount.governance.pubkey.toBase58()].length
      const hasNftsInSolAccount =
        currentAccount.isSol &&
        nftsPerPubkey[currentAccount.extensions.transferAddress!.toBase58()]
          .length
      if (hasNftsInWithGovernanceOwner) {
        curretnAccountNfts.push(
          ...nftsPerPubkey[currentAccount.governance.pubkey.toBase58()]
        )
      }
      if (hasNftsInSolAccount) {
        curretnAccountNfts.push(
          ...nftsPerPubkey[
            currentAccount.extensions.transferAddress!.toBase58()
          ]
        )
      }
      setNfts(curretnAccountNfts)
    }
  }, [
    realmNfts.length,
    JSON.stringify(nftsPerPubkey),
    currentAccount?.extensions.transferAddress?.toBase58(),
  ])
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
              <div className="flex ">
                <LinkButton
                  onClick={() => {
                    setSelectedNft(null)
                    setCurrentAccount(nftsGovernedTokenAccounts[0], connection)
                    setOpenSendNftsModal(true)
                  }}
                  className="flex items-center text-primary-light whitespace-nowrap mr-3"
                >
                  <PlusCircleIcon className="h-5 mr-2 w-5" />
                  Send NFT
                </LinkButton>
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
            </div>
            <Select
              className="sm:w-44 mt-2 sm:mt-0"
              onChange={(value) => setStateAccount(value)}
              value={currentAccount}
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
                    <div className="text-xs text-fgd-3">
                      {realmNfts.length} NFTs
                    </div>
                  </div>
                )
              }
            >
              <Select.Option key={null} value={null}>
                <div>
                  <div className="mb-0.5 text-xs text-fgd-1">Show All</div>
                  <div className="text-xs text-fgd-3">
                    {realmNfts.length} NFTs
                  </div>
                </div>
              </Select.Option>

              {nftsGovernedTokenAccounts.map((accountWithGovernance, index) => (
                <Select.Option key={index} value={accountWithGovernance}>
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
            {isLoading || isLoadingGovernances ? (
              <>
                <div className="animate-pulse bg-bkg-3 col-span-1 h-48 rounded-lg" />
                <div className="animate-pulse bg-bkg-3 col-span-1 h-48 rounded-lg" />
                <div className="animate-pulse bg-bkg-3 col-span-1 h-48 rounded-lg" />
                <div className="animate-pulse bg-bkg-3 col-span-1 h-48 rounded-lg" />
              </>
            ) : nfts.length ? (
              nfts.map((x, idx) => (
                <div
                  key={idx}
                  className="relative group bg-bkg-4 col-span-1 flex items-center justify-center rounded-lg filter drop-shadow-xl"
                >
                  <a
                    key={idx}
                    href={
                      connection.endpoint && x.mint
                        ? getExplorerUrl(connection.cluster, x.mint)
                        : ''
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ImgWithLoader
                      className="bg-bkg-2 cursor-pointer default-transition h-full w-full rounded-md border border-transparent transform scale-90 group-hover:scale-95 group-hover:opacity-50"
                      src={x.val.image}
                    />
                  </a>
                  <button
                    className="hidden group-hover:block absolute w-20 h-20 items-center justify-center flex-auto text-primary-light"
                    onClick={() => {
                      setCurrentAccount(
                        nftsGovernedTokenAccounts[0],
                        connection
                      )
                      setSelectedNft(x)
                      setOpenSendNftsModal(true)
                    }}
                  >
                    <div className="bg-white rounded-full flex items-center justify-center h-full w-full p-2 hover:opacity-75">
                      <MdScheduleSend className="h-full w-full p-3" />
                    </div>
                  </button>
                </div>
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
      {openSendNftsModal && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={handleCloseSendModal}
          isOpen={openSendNftsModal}
        >
          <SendTokens isNft selectedNft={selectedNft}></SendTokens>
        </Modal>
      )}
    </div>
  )
}

export default gallery
