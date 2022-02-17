import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import ItemName from './ItemName'
import DepositModal from './DepositModal'
import { TreasuryStrategy } from 'Strategies/types/types'
import ItemWrapper from './ItemWrapper'
import useWalletStore from 'stores/useWalletStore'
import { accountNumBN } from 'Strategies/protocols/mango/tools'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { PublicKey } from '@blockworks-foundation/mango-client'
//import { fmtMintAmount } from '@tools/sdk/units'
import { tryGetMint } from '@utils/tokens'
import useMarketStore from 'Strategies/store/marketStore'

const MangoItem = ({
  liquidity,
  apy,
  protocolName,
  handledMint,
  handledTokenSymbol,
  handledTokenImgSrc,
  protocolLogoSrc,
  strategyName,
  strategyDescription,
  createProposalFcn,
}: TreasuryStrategy) => {
  const market = useMarketStore((s) => s)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [depositedFmtAmount, setDepositedFmtAmount] = useState<string>()
  const connection = useWalletStore((s) => s.connection)
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const filteredTokenGov = governedTokenAccountsWithoutNfts.filter(
    (x) => x.mint?.publicKey.toBase58() === handledMint
  )
  useEffect(() => {
    const getCurrentDeposit = async () => {
      const group = market!.group!
      const groupConfig = market!.groupConfig!
      const depositIndex = group.tokens.findIndex(
        (x) => x.mint.toBase58() === handledMint
      )
      const [mangoAccountPk] = await PublicKey.findProgramAddress(
        [
          group.publicKey.toBytes(),
          filteredTokenGov[0].governance!.pubkey.toBytes(),
          accountNumBN.toArrayLike(Buffer, 'le', 8),
        ],
        groupConfig.mangoProgramId
      )
      const dexProgramid = market.group?.dexProgramId
      const account = await market.client?.getMangoAccount(
        mangoAccountPk,
        dexProgramid!
      )
      const deposit = account?.deposits[depositIndex]
      const mintInfo = await tryGetMint(
        connection.current,
        new PublicKey(handledMint)
      )
      if (mintInfo && !deposit?.isZero()) {
        setDepositedFmtAmount(
          account
            ?.getUiDeposit(
              market.cache!.rootBankCache[depositIndex],
              group,
              depositIndex
            )
            .toNumber()
            .toFixed(0)
        )
      }
    }
    if (market.group && filteredTokenGov.length) {
      getCurrentDeposit()
    }
  }, [market.group?.publicKey.toBase58(), filteredTokenGov.length])
  return (
    <>
      <ItemWrapper
        onClick={() => {
          setIsModalOpen(true)
        }}
      >
        <ItemName imgSrc={protocolLogoSrc} name={protocolName}></ItemName>
        <div>{strategyName}</div>
        <div className="flex flex-items">{depositedFmtAmount}</div>
        <div className="flex flex-items">
          <img src={handledTokenImgSrc} className="w-5 h-5 mr-3"></img>{' '}
          {handledTokenSymbol}
        </div>
        <div>${new BigNumber(liquidity).toFormat(0)}</div>
        <div>{apy}</div>
      </ItemWrapper>
      {isModalOpen && (
        <DepositModal
          currentPosition={depositedFmtAmount}
          apy={apy}
          liquidity={liquidity}
          handledMint={handledMint}
          onClose={() => {
            setIsModalOpen(false)
          }}
          isOpen={isModalOpen}
          protocolName={protocolName}
          protocolLogoSrc={protocolLogoSrc}
          handledTokenName={handledTokenSymbol}
          strategyName={strategyName}
          strategyDescription={strategyDescription}
          createProposalFcn={createProposalFcn}
        ></DepositModal>
      )}
    </>
  )
}

export default MangoItem
