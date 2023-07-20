import { useRef, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import Button from '@components/Button'
import Tooltip from '@components/Tooltip'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import { PublicKey } from '@solana/web3.js'
import NFTSelector, { NftSelectorFunctions } from '@components/NFTS/NFTSelector'
import NFTAccountSelect from './NFTAccountSelect'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { notify } from '@utils/notifications'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  Token,
} from '@solana/spl-token'
import { createATA } from '@utils/ataTools'
import { createIx_transferNft } from '@utils/metaplex'
import { SequenceType, sendTransactionsV3 } from '@utils/sendTransactions'
import { getNativeTreasuryAddress } from '@solana/spl-governance'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import useGovernanceSelect from '@hooks/useGovernanceSelect'
import queryClient from '@hooks/queries/queryClient'
import { digitalAssetsQueryKeys } from '@hooks/queries/digitalAssets'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import { getNetworkFromEndpoint } from '@utils/connection'

const useMetaplexDeposit = () => {
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount)

  return async (address: PublicKey) => {
    if (!wallet?.publicKey) throw new Error()
    if (!currentAccount) throw new Error()

    // ostensibly currentAccount should in fact be a native treasury, but I haven't verified this.
    const toOwner = await getNativeTreasuryAddress(
      currentAccount.governance.owner,
      currentAccount.governance.pubkey
    )

    const ix = await createIx_transferNft(
      connection.current,
      wallet.publicKey,
      toOwner,
      address,
      wallet.publicKey,
      wallet.publicKey
    )

    await sendTransactionsV3({
      connection: connection.current,
      wallet,
      transactionInstructions: [
        {
          instructionsSet: [{ transactionInstruction: ix }],
          sequenceType: SequenceType.Parallel,
        },
      ],
    })
  }
}

const DepositNFTFromWallet = ({ additionalBtns }: { additionalBtns?: any }) => {
  const nftSelectorRef = useRef<NftSelectorFunctions>(null)
  const { setCurrentAccount } = useTreasuryAccountStore()
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount)
  const [selectedNfts, setSelectedNfts] = useState<NFTWithMint[]>([])
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const connection = useLegacyConnectionContext()
  const [isLoading, setIsLoading] = useState(false)
  const realmPk = useSelectedRealmPubkey()

  const deposit = useMetaplexDeposit()

  const [selectedGovernance, setSelectedGovernance] = useGovernanceSelect(
    currentAccount?.governance.pubkey
  )

  const handleDeposit = async () => {
    // really these should probably get batched into one TX or whatever.
    if (!currentAccount) throw new Error()

    for (const nft of selectedNfts) {
      setIsLoading(true)

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
        .then(() => {
          setCurrentAccount(currentAccount!, connection)

          const network = getNetworkFromEndpoint(connection.current.rpcEndpoint)
          realmPk &&
            network !== 'localnet' &&
            queryClient.invalidateQueries(
              digitalAssetsQueryKeys.byRealm(network, realmPk)
            )
        })
        .catch((e) => {
          notify({
            type: 'error',
            message: 'Unable to send selected nft',
          })
          throw e
        })

      setIsLoading(false)
    }

    // high odds this does nothing at all
    nftSelectorRef.current?.handleGetNfts()
  }

  const walletPk = wallet?.publicKey

  return (
    <>
      {selectedGovernance && (
        <NFTAccountSelect
          onChange={setSelectedGovernance}
          selectedGovernance={selectedGovernance}
        />
      )}
      {walletPk ? (
        <NFTSelector
          ref={nftSelectorRef}
          ownersPk={[walletPk]}
          onNftSelect={(selected) => setSelectedNfts(selected)}
        />
      ) : (
        'Please connect your wallet'
      )}
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
