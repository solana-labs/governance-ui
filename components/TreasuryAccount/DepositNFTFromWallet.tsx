import { useEffect, useRef, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'
import Button from '@components/Button'
import Tooltip from '@components/Tooltip'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import { web3 } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { sendTransaction } from '@utils/send'
import NFTSelector, { NftSelectorFunctions } from '@components/NFTS/NFTSelector'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import NFTAccountSelect from './NFTAccountSelect'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js'
import { fetchNFTbyMint } from '@hooks/queries/nft'
import { notify } from '@utils/notifications'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  Token,
} from '@solana/spl-token'
import { createATA } from '@utils/ataTools'

const useMetaplexDeposit = () => {
  const wallet = useWalletOnePointOh()
  const connection = useWalletStore((s) => s.connection)
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount)

  return async (address: PublicKey) => {
    if (!wallet?.publicKey) throw new Error()
    if (!currentAccount) throw new Error()

    const owner = currentAccount.isSol
      ? currentAccount.extensions.transferAddress!
      : currentAccount.governance!.pubkey

    const metaplex = new Metaplex(connection.current, {
      cluster:
        connection.cluster === 'mainnet' ? 'mainnet-beta' : connection.cluster,
    }).use(walletAdapterIdentity(wallet))

    const nft = await fetchNFTbyMint(connection.current, address)
    if (nft.result) {
      const tokenStandard = nft.result.tokenStandard

      const x = metaplex.nfts().builders().transfer({
        nftOrSft: {
          address,
          tokenStandard,
        },
        toOwner: owner,
        fromOwner: wallet.publicKey,
      })

      const transaction = new web3.Transaction().add(...x.getInstructions())
      await sendTransaction({
        connection: connection.current,
        wallet: wallet!,
        transaction,
        sendingMessage: 'Depositing NFT',
        successMessage: 'NFT has been deposited',
      })
    }
  }
}

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

  const deposit = useMetaplexDeposit()

  const handleDeposit = async () => {
    // really these should probably get batched into one TX or whatever.
    if (!currentAccount) throw new Error()

    for (const nft of selectedNfts) {
      setIsLoading(true)
      setSendingSuccess(false)

      const owner = currentAccount.isSol
        ? currentAccount.extensions.transferAddress!
        : currentAccount.governance!.pubkey
      const nftMintPk = new PublicKey(nft.mintAddress)

      const ataPk = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        nftMintPk, // mint
        owner!, // owner
        true
      )

      const ataQueried = await connection.current.getAccountInfo(ataPk)

      if (ataQueried === null) {
        await createATA(
          connection.current,
          wallet,
          nftMintPk,
          owner!,
          wallet!.publicKey!
        )
      }

      await deposit(new PublicKey(nft.mintAddress))
        .then(() => setSendingSuccess(true))
        .catch(() =>
          notify({
            type: 'error',
            message: 'Unable to send selected nft',
          })
        )

      setIsLoading(false)
    }

    nftSelectorRef.current?.handleGetNfts()
    // @asktree: as far as I can tell this doesn't have the effect of refreshing any queries properly
    getNfts(nftsGovernedTokenAccounts, connection)
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
