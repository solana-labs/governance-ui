import { getMintMetadata } from '@components/instructions/programs/splToken'
import { getAccountName } from '@components/instructions/tools'
import {
  formatMintNaturalAmountAsDecimal,
  numberWithCommas,
} from '@tools/sdk/units'
import tokenService, { TokenRecord } from '@utils/services/token'
import { GovernedTokenAccount } from '@utils/tokens'
import { useEffect, useState } from 'react'
const TreasuryAccountItem = ({
  governedAccountTokenAccount,
}: {
  governedAccountTokenAccount: GovernedTokenAccount
}) => {
  const [totalPrice, setTotalPrice] = useState('')
  const [tokenRecordInfo, setTokenRecordInfo] = useState<
    TokenRecord | undefined
  >(undefined)
  const tokenName = governedAccountTokenAccount
    ? getMintMetadata(governedAccountTokenAccount.token?.account.mint)?.name
    : ''
  const amount =
    governedAccountTokenAccount && governedAccountTokenAccount.mint?.account
      ? formatMintNaturalAmountAsDecimal(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          governedAccountTokenAccount.mint?.account,
          governedAccountTokenAccount.token!.account.amount
        )
      : ''
  function handleSetTotalPrice() {
    const price = tokenService.getUSDTokenPrice(tokenName)

    const amountNumber = parseFloat(amount.split(',').join(''))
    const totalPrice = amountNumber
      ? numberWithCommas((amountNumber * price).toFixed(0))
      : ''
    setTotalPrice(totalPrice)
  }
  async function handleSetTokenInfo() {
    const info = await tokenService.getTokenInfo(tokenName)
    setTokenRecordInfo(info)
  }
  useEffect(() => {
    handleSetTokenInfo()
    handleSetTotalPrice()
  }, [tokenName, amount])
  return tokenRecordInfo?.symbol || amount ? (
    <div className="break-all text-fgd-1 bg-bkg-1 px-3 py-3 rounded-md w-full mb-5 flex">
      {tokenRecordInfo?.logoURI && (
        <div className="flex items-center">
          <img
            className="flex-shrink-0 h-8 w-8 mr-3"
            src={tokenRecordInfo.logoURI}
          />
        </div>
      )}
      <div className="flex flex-col">
        <div className="font-semibold">
          {tokenRecordInfo?.name ? (
            tokenRecordInfo?.name
          ) : (
            <small>
              {governedAccountTokenAccount.governance?.info.governedAccount.toBase58()}
            </small>
          )}
        </div>
        <div className="text-xs font-thin flex flex-col">
          {amount} {tokenRecordInfo?.symbol}
          <small>
            {governedAccountTokenAccount.token?.publicKey &&
              getAccountName(governedAccountTokenAccount.token?.publicKey)}
          </small>
        </div>
      </div>
      <div className="text-xs flex items-center justify-items-end items-start ml-auto">
        {totalPrice && totalPrice !== '0' ? `$${totalPrice}` : ''}
      </div>
    </div>
  ) : null
}

export default TreasuryAccountItem
