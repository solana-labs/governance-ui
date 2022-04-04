import useTotalTokenValue from '@hooks/useTotalTokenValue'
import { BN } from '@project-serum/anchor'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import BigNumber from 'bignumber.js'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import BaseAccountHeader from './BaseAccountHeader'

const AccountHeader = () => {
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount)
  const governanceNfts = useTreasuryAccountStore((s) => s.governanceNfts)
  const nftsCount =
    currentAccount?.governance && currentAccount.isNft
      ? governanceNfts[currentAccount?.governance?.pubkey.toBase58()]?.length
      : 0
  const isNFT = currentAccount?.isNft
  const tokenInfo = useTreasuryAccountStore((s) => s.tokenInfo)
  const amount =
    currentAccount && currentAccount.mint?.account
      ? getMintDecimalAmountFromNatural(
          currentAccount.mint?.account,
          new BN(
            !currentAccount.isSol
              ? currentAccount.token!.account.amount
              : currentAccount.solAccount!.lamports
          )
        ).toNumber()
      : 0
  const amountFormatted = new BigNumber(amount).toFormat()
  const mintAddress = useTreasuryAccountStore((s) => s.mintAddress)
  const totalPrice = useTotalTokenValue({ amount, mintAddress })
  return (
    <BaseAccountHeader
      isNFT={isNFT}
      tokenInfo={tokenInfo}
      amountFormatted={isNFT ? nftsCount?.toString() : amountFormatted}
      totalPrice={totalPrice}
    ></BaseAccountHeader>
  )
}

export default AccountHeader
