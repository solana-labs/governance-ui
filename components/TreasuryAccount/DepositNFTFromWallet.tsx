import React, { useEffect, useRef, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'
import Button from '@components/Button'
import Tooltip from '@components/Tooltip'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import { notify } from '@utils/notifications'
import { web3 } from '@coral-xyz/anchor'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { createATA } from '@utils/ataTools'
import { getTokenAccountsByMint } from '@utils/tokens'
import { sendTransaction } from '@utils/send'
import NFTSelector, { NftSelectorFunctions } from '@components/NFTS/NFTSelector'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import NFTAccountSelect from './NFTAccountSelect'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

const DepositNFTFromWallet = ({ additionalBtns }: { additionalBtns?: any }) => {
  const nftSelectorRef = useRef<NftSelectorFunctions>(null)
  const { setCurrentAccount } = useTreasuryAccountStore()
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount)
  const { getNfts } = useTreasuryAccountStore()
  const [selectedNfts, setSelectedNfts] = useState<NFTWithMint[]>([])
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const connection = useWalletStore((s) => s.connection)
  const [isLoading, setIsLoading] = useState(false)
  const [sendingSuccess, setSendingSuccess] = useState(false)
  const { nftsGovernedTokenAccounts } = useGovernanceAssets()

  const handleDeposit = async () => {
    for (const i of selectedNfts) {
      setIsLoading(true)
      setSendingSuccess(false)
      try {
        const owner = currentAccount?.isSol
          ? currentAccount.extensions.transferAddress!
          : currentAccount!.governance!.pubkey
        const ConnectedWalletAddress = wallet?.publicKey
        const selectedNft = i
        const nftMintPk = new PublicKey(selectedNft.mintAddress)
        const tokenAccountsWithNftMint = await getTokenAccountsByMint(
          connection.current,
          nftMintPk.toBase58()
        )
        //we find ata from connected wallet that holds the nft
        const fromAddress = tokenAccountsWithNftMint.find(
          (x) =>
            x.account.owner.toBase58() === ConnectedWalletAddress?.toBase58()
        )?.publicKey
        //we check is there ata created for nft before
        const doseAtaForReciverAddressExisit = tokenAccountsWithNftMint.find(
          (x) => x.account.owner.toBase58() === owner.toBase58()
        )

        const ataPk = await Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
          nftMintPk, // mint
          owner!, // owner
          true
        )
        if (!doseAtaForReciverAddressExisit) {
          await createATA(
            connection.current,
            wallet,
            nftMintPk,
            owner!,
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
          wallet: wallet!,
          transaction,
          sendingMessage: 'Depositing NFT',
          successMessage: 'NFT has been deposited',
        })
        setSendingSuccess(true)
        nftSelectorRef.current?.handleGetNfts()
        getNfts(nftsGovernedTokenAccounts, connection)
      } catch (e) {
        notify({
          type: 'error',
          message: 'Unable to send selected nft',
        })
      }
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (sendingSuccess) {
      setCurrentAccount(currentAccount!, connection)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [connected, sendingSuccess])

  return (
    <>
      <NFTAccountSelect
        onChange={(value) => setCurrentAccount(value, connection)}
        currentAccount={currentAccount}
        nftsGovernedTokenAccounts={nftsGovernedTokenAccounts}
      ></NFTAccountSelect>
      <NFTSelector
        ref={nftSelectorRef}
        ownersPk={[wallet!.publicKey!]}
        onNftSelect={(selected) => setSelectedNfts(selected)}
      ></NFTSelector>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
        <div className="ml-auto">
          {additionalBtns}
          <Button
            disabled={!connected || isLoading || selectedNfts.length === 0}
            className="ml-2"
            onClick={handleDeposit}
            isLoading={isLoading}
          >
            <Tooltip
              content={
                !connected
                  ? 'Please connect your wallet'
                  : selectedNfts.length === 0
                  ? 'Please select nft'
                  : ''
              }
            >
              <div>Deposit</div>
            </Tooltip>
          </Button>
        </div>
      </div>
    </>
  )
}

export default DepositNFTFromWallet
