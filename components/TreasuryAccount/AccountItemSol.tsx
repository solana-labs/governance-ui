import { getAccountName, wSolMint } from '@components/instructions/tools'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import tokenService from '@utils/services/token'
import { GovernedTokenAccount } from '@utils/tokens'
import { useEffect, useState } from 'react'
import { abbreviateAddress } from '@utils/formatting'
import useWalletStore from '../../stores/useWalletStore'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import { ViewState } from './Types'
import { TokenInfo } from '@solana/spl-token-registry'

const AccountItemSol = ({
  governedAccountTokenAccount,
}: {
  governedAccountTokenAccount: GovernedTokenAccount
}) => {
  const [totalPrice, setTotalPrice] = useState('')
  const [tokenRecordInfo, setTokenRecordInfo] = useState<TokenInfo | undefined>(
    undefined
  )
  const connection = useWalletStore((s) => s.connection)
  const {
    setCurrentCompactView,
    setCurrentCompactAccount,
  } = useTreasuryAccountStore()

  //substract minimal lamparts ammount
  //get minimal lamparts
  const amount =
    governedAccountTokenAccount &&
    governedAccountTokenAccount.mint?.account &&
    governedAccountTokenAccount.solAccount
      ? getMintDecimalAmountFromNatural(
          governedAccountTokenAccount.mint?.account,
          new BN(governedAccountTokenAccount.solAccount.lamports)
        ).toNumber()
      : 0

  function handleSetTotalPrice() {
    const price = tokenService.getUSDTokenPrice(wSolMint)
    const totalPrice = amount * price
    const totalPriceFormatted = amount
      ? new BigNumber(totalPrice).toFormat(0)
      : ''
    setTotalPrice(totalPriceFormatted)
  }
  async function handleSetTokenInfo() {
    const info = tokenService.getTokenInfo(wSolMint)
    setTokenRecordInfo(info)
  }
  async function handleGoToAccountOverview() {
    setCurrentCompactView(ViewState.AccountView)
    setCurrentCompactAccount(governedAccountTokenAccount, connection)
  }
  useEffect(() => {
    handleSetTokenInfo()
    handleSetTotalPrice()
  }, [wSolMint, amount])
  const amountFormatted = new BigNumber(amount).toFormat()

  return tokenRecordInfo?.symbol ||
    governedAccountTokenAccount.transferAddress ? (
    <div
      onClick={handleGoToAccountOverview}
      className="cursor-pointer default-transition flex items-start text-fgd-1 border border-fgd-4 p-3 rounded-lg w-full hover:bg-bkg-3"
    >
      {tokenRecordInfo?.logoURI && (
        <img
          className="flex-shrink-0 h-6 w-6 mr-2.5 mt-1"
          src={tokenRecordInfo.logoURI}
        />
      )}
      <div className="w-full">
        {governedAccountTokenAccount.transferAddress && (
          <div className="flex items-start justify-between mb-1">
            {getAccountName(governedAccountTokenAccount.transferAddress) ? (
              <div className="text-sm text-th-fgd-1">
                {getAccountName(governedAccountTokenAccount.transferAddress)}
              </div>
            ) : (
              <div className="text-xs text-th-fgd-1">
                {abbreviateAddress(governedAccountTokenAccount.transferAddress)}
              </div>
            )}
          </div>
        )}
        <div className="text-fgd-3 text-xs flex flex-col">
          {amountFormatted} SOL
        </div>
        {totalPrice && totalPrice !== '0' ? (
          <div className="mt-0.5 text-fgd-3 text-xs">${totalPrice}</div>
        ) : (
          ''
        )}
      </div>
    </div>
  ) : null
}

export default AccountItemSol
