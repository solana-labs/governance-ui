import React, { useEffect, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import { ViewState } from './Types'
import { ArrowLeftIcon, PhotographIcon } from '@heroicons/react/solid'
import AccountLabel from './AccountHeader'
import useWalletStore from 'stores/useWalletStore'
import Button, { SecondaryButton } from '@components/Button'
import Tooltip from '@components/Tooltip'
import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import axios from 'axios'
import { notify } from '@utils/notifications'
import { CheckCircleIcon } from '@heroicons/react/solid'

const DepositNFTFromWallet = () => {
  const {
    setCurrentCompactView,
    resetCompactViewState,
  } = useTreasuryAccountStore()
  const currentAccount = useTreasuryAccountStore(
    (s) => s.compact.currentAccount
  )
  const [nfts, setNfts] = useState<NFTWithMint[]>([])
  const [selectedNfts, setSelectedNfts] = useState<NFTWithMint[]>([])
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const connection = useWalletStore((s) => s.connection)
  const [isLoading, setIsLoading] = useState(false)
  const handleGoBackToMainView = () => {
    setCurrentCompactView(ViewState.MainView)
    resetCompactViewState()
  }
  const handleSelectNft = (nft: NFTWithMint) => {
    const isSelected = selectedNfts.find((x) => x.mint === nft.mint)
    if (isSelected) {
      setSelectedNfts([...selectedNfts.filter((x) => x.mint !== nft.mint)])
    } else {
      setSelectedNfts([...selectedNfts, nft])
    }
  }
  const handleDeposit = () => {}
  useEffect(() => {
    const getAllNftData = async () => {
      try {
        const nfts = await getParsedNftAccountsByOwner({
          publicAddress: wallet?.publicKey,
          connection: connection.current,
        })
        const data = Object.keys(nfts).map((key) => nfts[key])
        const arr: any[] = []
        for (let i = 0; i < data.length; i++) {
          const val = (await axios.get(data[i].data.uri)).data
          arr.push({ val, mint: data[i].mint })
        }
        setNfts(arr)
      } catch (error) {
        notify({
          type: 'error',
          message: 'Unable to fetch nfts',
        })
      }
    }
    if (connected) {
      getAllNftData()
    }
  }, [connected])
  return (
    <>
      <h3 className="mb-4 flex items-center">
        <>
          <ArrowLeftIcon
            onClick={() => setCurrentCompactView(ViewState.DepositNFTOptions)}
            className="h-4 w-4 mr-1 text-primary-light mr-2 hover:cursor-pointer"
          />
          Deposit
        </>
      </h3>
      <AccountLabel></AccountLabel>
      <div style={{ maxHeight: '350px' }} className="overflow-y-auto">
        {nfts.length ? (
          <div className="flex flex-row flex-wrap gap-4 mb-4">
            {nfts.map((x) => (
              <div
                onClick={() => handleSelectNft(x)}
                key={x.mint}
                className="bg-bkg-2 flex items-center justify-center cursor-pointer default-transition rounded-lg border border-transparent hover:border-primary-dark relative overflow-hidden"
                style={{
                  width: '150px',
                  height: '150px',
                }}
              >
                {selectedNfts.find(
                  (selectedNfts) => selectedNfts.mint === x.mint
                ) && (
                  <CheckCircleIcon className="w-10 h-10 absolute text-green"></CheckCircleIcon>
                )}
                <img style={{ width: '150px' }} src={x.val.image} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-fgd-3 flex flex-col items-center">
            You wallet dont have any NFTS
            <PhotographIcon className="opacity-5 w-56 h-56"></PhotographIcon>
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
        <SecondaryButton
          className="sm:w-1/2 text-th-fgd-1"
          onClick={handleGoBackToMainView}
        >
          Cancel
        </SecondaryButton>
        <Button
          disabled={!connected}
          className="sm:w-1/2"
          onClick={handleDeposit}
          isLoading={isLoading}
        >
          <Tooltip content={!connected && 'Please connect your wallet'}>
            <div>Deposit</div>
          </Tooltip>
        </Button>
      </div>
    </>
  )
}

export default DepositNFTFromWallet
