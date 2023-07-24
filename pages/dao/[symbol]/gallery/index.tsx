import PreviousRouteBtn from '@components/PreviousRouteBtn'
import { useCallback, useMemo, useState } from 'react'
import { PlusCircleIcon } from '@heroicons/react/outline'
import Modal from '@components/Modal'
import { LinkButton } from '@components/Button'
import { useRealmDigitalAssetsQuery } from '@hooks/queries/digitalAssets'
import SendNft from '@components/SendNft'
import { PublicKey } from '@solana/web3.js'
import { SUPPORT_CNFTS } from '@constants/flags'
import useFindGovernanceByTreasury from '@hooks/useFindGovernanceByTreasury'
import DepositNFTFromWallet from '@components/TreasuryAccount/DepositNFTFromWallet'
import NFTGallery from '@components/NFTGallery'

const AllNFTsGallery = (
  props: Omit<Parameters<typeof NFTGallery>[0], 'nfts'>
) => {
  const { data: nftsDAS } = useRealmDigitalAssetsQuery()
  const DASnftsFlat = useMemo(
    () =>
      nftsDAS?.flat().filter((x) => SUPPORT_CNFTS || !x.compression.compressed),
    [nftsDAS]
  )
  return <NFTGallery nfts={DASnftsFlat} {...props} />
}

const Gallery = () => {
  const [openNftDepositModal, setOpenNftDepositModal] = useState(false)
  const [openSendNftsModal, setOpenSendNftsModal] = useState(false)
  const [
    selectedNftAndItsGovernance,
    setSelectedNftAndItsGovernance,
  ] = useState<[PublicKey, PublicKey]>()
  const handleCloseModal = () => {
    setOpenNftDepositModal(false)
  }
  const handleCloseSendModal = () => {
    setOpenSendNftsModal(false)
  }

  const findGovernanceByTreasury = useFindGovernanceByTreasury()

  // x is an nft object from the DAS api
  const onClickSendNft = useCallback(
    async (x: any) => {
      const owner = new PublicKey(x.ownership.owner)
      const governance = (await findGovernanceByTreasury(owner)) ?? owner
      setSelectedNftAndItsGovernance([new PublicKey(x.id), governance])
      setOpenSendNftsModal(true)
    },
    [findGovernanceByTreasury]
  )

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
                    setSelectedNftAndItsGovernance(undefined)
                    setOpenSendNftsModal(true)
                  }}
                  className="flex items-center text-primary-light whitespace-nowrap mr-3"
                >
                  <PlusCircleIcon className="h-5 mr-2 w-5" />
                  Send NFT
                </LinkButton>
                <LinkButton
                  onClick={() => {
                    setOpenNftDepositModal(true)
                  }}
                  className="flex items-center text-primary-light whitespace-nowrap"
                >
                  <PlusCircleIcon className="h-5 mr-2 w-5" />
                  Deposit NFT
                </LinkButton>
              </div>
            </div>
            {/* <Select
              className="sm:w-44 mt-2 sm:mt-0"
              onChange={(value) => setStateAccount(value)}
              value={currentAccount}
              componentLabel={
                currentAccount ? (
                  <AccountItemNFT
                    className="m-0 p-0 py-0 px-0 border-0 hover:bg-bkg-1"
                    governance={currentAccount.governance.pubkey}
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
                    className="m-0 p-0 py-0 px-0 border-0 hover:bg-bkg-2"
                    governance={accountWithGovernance.governance.pubkey}
                  />
                </Select.Option>
              ))}
            </Select> */}
          </div>
          <AllNFTsGallery onClickSendNft={onClickSendNft} />
        </div>
      </div>
      {openNftDepositModal && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={handleCloseModal}
          isOpen={openNftDepositModal}
        >
          <DepositNFTFromWallet />
        </Modal>
      )}
      {openSendNftsModal && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={handleCloseSendModal}
          isOpen={openSendNftsModal}
        >
          <SendNft
            initialNftAndGovernanceSelected={selectedNftAndItsGovernance}
          />
        </Modal>
      )}
    </div>
  )
}

export default Gallery
