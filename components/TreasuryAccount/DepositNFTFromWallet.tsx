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
import { web3 } from '@project-serum/anchor'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { createATA } from '@utils/ataTools'
import { getTokenAccountsByMint } from '@utils/tokens'
import { sendTransaction } from '@utils/send'

const DepositNFTFromWallet = () => {
  const {
    setCurrentCompactView,
    resetCompactViewState,
    setCurrentCompactAccount,
  } = useTreasuryAccountStore()
  const currentAccount = useTreasuryAccountStore(
    (s) => s.compact.currentAccount
  )
  const nftsCount = useTreasuryAccountStore((s) => s.compact.nftsCount)
  const [nfts, setNfts] = useState<NFTWithMint[]>([])
  const [selectedNfts, setSelectedNfts] = useState<NFTWithMint[]>([])
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const connection = useWalletStore((s) => s.connection)
  const [isLoading, setIsLoading] = useState(false)
  const [sendingSuccess, setSendingSuccess] = useState(false)
  const handleGoBackToMainView = () => {
    setCurrentCompactView(ViewState.MainView)
    resetCompactViewState()
  }
  const handleSelectNft = (nft: NFTWithMint) => {
    const isSelected = selectedNfts.find((x) => x.mint === nft.mint)
    if (isSelected) {
      setSelectedNfts([...selectedNfts.filter((x) => x.mint !== nft.mint)])
    } else {
      //For now only one nft at the time
      setSelectedNfts([nft])
    }
  }
  const handleDeposit = async () => {
    setIsLoading(true)
    setSendingSuccess(false)
    try {
      const governance = currentAccount!.governance!.pubkey
      const ConnectedWalletAddress = wallet?.publicKey
      const selectedNft = selectedNfts[0]
      const nftMintPk = new PublicKey(selectedNft.mint)
      const tokenAccountsWithNftMint = await getTokenAccountsByMint(
        connection.current,
        nftMintPk.toBase58()
      )
      //we find ata from connected wallet that holds the nft
      const fromAddress = tokenAccountsWithNftMint.find(
        (x) => x.account.owner.toBase58() === ConnectedWalletAddress?.toBase58()
      )?.publicKey
      //we check is there ata created for nft before inside governance
      const isAtaForGovernanceExist = tokenAccountsWithNftMint.find(
        (x) => x.account.owner.toBase58() === governance.toBase58()
      )

      const ataPk = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        nftMintPk, // mint
        governance! // owner
      )
      if (!isAtaForGovernanceExist) {
        await createATA(
          connection.current,
          wallet,
          nftMintPk,
          governance,
          wallet!.publicKey!
        )
      }
      const transaction = new web3.Transaction().add(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          fromAddress!,
          ataPk,
          wallet!.publicKey!,
          [],
          1
        )
      )
      await sendTransaction({
        connection: connection.current,
        wallet,
        transaction,
        sendingMessage: 'Depositing NFT',
        successMessage: 'NFT has been deposited',
      })
      setSendingSuccess(true)
    } catch (e) {
      notify({
        type: 'error',
        message: 'Unable to send selected nft',
      })
    }
    setIsLoading(false)
  }
  useEffect(() => {
    const getAllNftData = async () => {
      setIsLoading(true)
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
      setIsLoading(false)
    }
    if (connected || sendingSuccess) {
      getAllNftData()
    }
    if (sendingSuccess) {
      const newNftsCount = nftsCount! + 1
      setCurrentCompactAccount(currentAccount!, connection, newNftsCount)
    }
  }, [connected, sendingSuccess])
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
            {"Connected wallet don't have any NFTS"}
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
          disabled={!connected || isLoading}
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
