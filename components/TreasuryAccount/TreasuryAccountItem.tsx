import { getMintMetadata } from '@components/instructions/programs/splToken'
import {
  formatMintNaturalAmountAsDecimal,
  numberWithCommas,
} from '@tools/sdk/units'
import tokenService, { TokenRecord } from '@utils/services/price'
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
    handleSetTotalPrice()
    handleSetTokenInfo()
  }, [tokenName, amount])
  return tokenRecordInfo?.symbol ? (
    <div className="break-all text-fgd-1 bg-bkg-1 px-4 py-2 rounded-md w-full mb-5">
      {tokenRecordInfo.name && (
        <div className="flex">
          <img
            className="flex-shrink-0 h-5 mr-2 w-5"
            src={tokenRecordInfo.logoURI}
          />
          {tokenRecordInfo.name}
        </div>
      )}
      <div className="space-y-0.5 text-md text-fgd-3">
        {amount !== '' ? <div>Amount: {amount}</div> : null}
        {totalPrice && `Value: $${totalPrice}`}
      </div>
    </div>
  ) : null
}

export default TreasuryAccountItem
