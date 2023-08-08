import { useState } from 'react'
import Button from '@components/Button'
import Tooltip from '@components/Tooltip'
import { PublicKey } from '@solana/web3.js'
import NFTSelector from '@components/NFTS/NFTSelector'
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
import {
  digitalAssetsQueryKeys,
  fetchDigitalAssetById,
} from '@hooks/queries/digitalAssets'
import { getNetworkFromEndpoint } from '@utils/connection'
import { buildTransferCnftInstruction } from '@hooks/instructions/useTransferCnftInstruction'
import { useRealmQuery } from '@hooks/queries/realm'

const useMetaplexDeposit = () => {
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const realm = useRealmQuery().data?.result

  return async (nftId: PublicKey, governance: PublicKey) => {
    if (!wallet?.publicKey) throw new Error()
    if (realm === undefined) throw new Error()

    // ostensibly currentAccount should in fact be a native treasury, but I haven't verified this.
    const toOwner = await getNativeTreasuryAddress(realm.owner, governance)
    const network = getNetworkFromEndpoint(connection.current.rpcEndpoint)
    if (network === 'localnet') throw new Error()
    const nft = (await fetchDigitalAssetById(network, nftId)).result
    if (nft === undefined) throw new Error('nft not found')

    const ix = nft.compression?.compressed
      ? await buildTransferCnftInstruction(connection.current, nftId, toOwner)
      : await createIx_transferNft(
          connection.current,
          wallet.publicKey,
          toOwner,
          nftId,
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
  const [selectedNfts, setSelectedNfts] = useState<PublicKey[]>([])
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const connection = useLegacyConnectionContext()
  const [isLoading, setIsLoading] = useState(false)

  const deposit = useMetaplexDeposit()

  const [selectedGovernance, setSelectedGovernance] = useGovernanceSelect()
  const realm = useRealmQuery().data?.result

  const handleDeposit = async () => {
    if (selectedGovernance === undefined) throw new Error()
    if (realm === undefined) throw new Error()

    // really these should probably get batched into one TX or whatever.
    for (const nftMint of selectedNfts) {
      setIsLoading(true)

      const network = getNetworkFromEndpoint(connection.current.rpcEndpoint)
      if (network === 'localnet') throw new Error()

      const nft = (await fetchDigitalAssetById(network, nftMint)).result
      if (nft === undefined) throw new Error('nft not found')
      if (nft.compression.compressed === false) {
        const owner = await getNativeTreasuryAddress(
          realm.owner,
          selectedGovernance
        )

        const ataPk = await Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
          nftMint, // mint
          owner!, // owner
          true
        )

        const ataQueried = await connection.current.getAccountInfo(ataPk)

        if (ataQueried === null) {
          await createATA(
            connection.current,
            wallet,
            nftMint,
            owner!,
            wallet!.publicKey!
          )
        }
      }

      await deposit(new PublicKey(nftMint), selectedGovernance)
        .then(() => {
          queryClient.invalidateQueries(digitalAssetsQueryKeys.all(network))
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
          owner={walletPk}
          setSelectedNfts={setSelectedNfts}
          selectedNfts={selectedNfts}
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
