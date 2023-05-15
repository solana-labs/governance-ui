import { InstructionData } from '@solana/spl-governance'
import InstructionAccount from './InstructionAccount'
import InstructionDataView from './InstructionDataView'
import InstructionProgram from './InstructionProgram'
import { useCallback, useEffect, useState } from 'react'
import {
  InstructionDescriptor,
  WSOL_MINT,
  getInstructionDescriptor,
} from './tools'
import useWalletStore from 'stores/useWalletStore'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import axios from 'axios'
import tokenPriceService from '@utils/services/tokenPrice'
import { fetchNFTbyMint } from '@hooks/queries/nft'
import { fetchTokenAccountByPubkey } from '@hooks/queries/tokenAccount'

const TransactionInstructionCard = ({
  instructionData,
  index,
}: {
  instructionData: InstructionData
  index: number
}) => {
  const connection = useWalletStore((s) => s.connection)
  const realm = useWalletStore((s) => s.selectedRealm.realm)
  const {
    nftsGovernedTokenAccounts,
    governedTokenAccountsWithoutNfts,
  } = useGovernanceAssets()

  const [descriptor, setDescriptor] = useState<InstructionDescriptor>()
  const [nftImgUrl, setNftImgUrl] = useState('')
  const [tokenImgUrl, setTokenImgUrl] = useState('')

  const isSol = tokenImgUrl.includes(WSOL_MINT)

  const handleGetDescriptors = useCallback(async () => {
    const desc = await getInstructionDescriptor(
      connection,
      instructionData,
      realm
    )
    setDescriptor(desc)
  }, [connection, instructionData, realm])

  const getAmountImg = useCallback(async () => {
    const sourcePk = instructionData.accounts[0].pubkey
    const tokenAccount = (
      await fetchTokenAccountByPubkey(connection.current, sourcePk)
    ).result
    const mint = tokenAccount?.mint

    const isSol = governedTokenAccountsWithoutNfts.find(
      (x) => x.extensions.transferAddress?.toBase58() === sourcePk.toBase58()
    )?.isSol
    const isNFTAccount = nftsGovernedTokenAccounts.find(
      (x) =>
        x.extensions.transferAddress?.toBase58() ===
          tokenAccount?.owner.toBase58() ||
        x.governance.pubkey.toBase58() === tokenAccount?.owner.toBase58()
    )

    if (isNFTAccount) {
      if (mint) {
        try {
          const result = await fetchNFTbyMint(connection.current, mint)
          const url = (await axios.get(result.result.uri)).data
          setNftImgUrl(url.image)
        } catch (e) {
          console.log(e)
        }
      }
      return
    }

    if (isSol) {
      const info = tokenPriceService.getTokenInfo(WSOL_MINT)
      const imgUrl = info?.logoURI ? info.logoURI : ''
      setTokenImgUrl(imgUrl)
      return
    }
    if (mint) {
      const info = tokenPriceService.getTokenInfo(mint.toBase58())
      const imgUrl = info?.logoURI ? info.logoURI : ''
      setTokenImgUrl(imgUrl)
    }
    return
  }, [
    connection,
    governedTokenAccountsWithoutNfts,
    instructionData.accounts,
    nftsGovernedTokenAccounts,
  ])

  useEffect(() => {
    handleGetDescriptors()
  }, [handleGetDescriptors])

  useEffect(() => {
    getAmountImg()
  }, [getAmountImg])

  return (
    <div>
      <div className="pb-4 flex">
        {descriptor?.name && `instruction ${index + 1} - ${descriptor.name}`}{' '}
        {tokenImgUrl && (
          <img
            className={`w-5 h-5 ml-2 ${isSol && 'rounded-full'}`}
            src={tokenImgUrl}
          ></img>
        )}
      </div>
      <InstructionProgram
        connection={connection}
        programId={instructionData.programId}
      ></InstructionProgram>
      <div className="border-b border-bkg-4 mb-6">
        {instructionData.accounts.map((am, idx) => (
          <InstructionAccount
            endpoint={connection.endpoint}
            key={idx}
            index={idx}
            accountMeta={am}
            descriptor={descriptor}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mb-2">
        {descriptor?.dataUI.props ? (
          <div className="font-bold text-sm">Data</div>
        ) : (
          ''
        )}
      </div>
      {nftImgUrl ? (
        <div className="flex justify-between mb-2">
          <div
            style={{ width: '150px', height: '150px' }}
            className="flex items-center overflow-hidden"
          >
            <img src={nftImgUrl}></img>
          </div>
          <InstructionDataView descriptor={descriptor}></InstructionDataView>
        </div>
      ) : (
        <InstructionDataView descriptor={descriptor}></InstructionDataView>
      )}
    </div>
  )
}

export default TransactionInstructionCard
