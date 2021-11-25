import { PublicKey } from '@solana/web3.js'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import { getAccountName } from '@components/instructions/tools'
import {
  formatMintNaturalAmountAsDecimal,
  numberWithCommas,
} from '@tools/sdk/units'
import tokenService, { TokenRecord } from '@utils/services/token'
import { GovernedTokenAccount } from '@utils/tokens'
import { useEffect, useState } from 'react'
import { abbreviateAddress } from '@utils/formatting'
import { getExplorerUrl } from '../explorer/tools'
import useWalletStore from '../../stores/useWalletStore'

const TreasuryAccountItem = ({
  governedAccountTokenAccount,
}: {
  governedAccountTokenAccount: GovernedTokenAccount
}) => {
  const [totalPrice, setTotalPrice] = useState('')
  const [tokenRecordInfo, setTokenRecordInfo] = useState<
    TokenRecord | undefined
  >(undefined)
  const connection = useWalletStore((s) => s.connection)

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

  const accountPublicKey = governedAccountTokenAccount
    ? governedAccountTokenAccount.governance?.info.governedAccount
    : null

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
    <a
      className="cursor-pointer default-transition flex items-start text-fgd-1 border border-fgd-4 p-3 rounded-lg w-full hover:bg-bkg-3"
      href={
        accountPublicKey
          ? getExplorerUrl(connection.endpoint, accountPublicKey)
          : ''
      }
      target="_blank"
      rel="noopener noreferrer"
    >
      {tokenRecordInfo?.logoURI && (
        <img
          className="flex-shrink-0 h-6 w-6 mr-2.5 mt-1"
          src={tokenRecordInfo.logoURI}
        />
      )}
      <div className="w-full">
        {governedAccountTokenAccount.token?.publicKey && (
          <div className="flex items-start justify-between mb-1">
            {getAccountName(governedAccountTokenAccount.token?.publicKey) ? (
              <div className="text-sm text-th-fgd-1">
                {getAccountName(governedAccountTokenAccount.token?.publicKey)}
              </div>
            ) : (
              <div className="text-xs text-th-fgd-1">
                {abbreviateAddress(accountPublicKey as PublicKey)}
              </div>
            )}
            <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
          </div>
        )}
        <div className="text-fgd-3 text-xs flex flex-col">
          {amount} {tokenRecordInfo?.symbol}
        </div>
        {totalPrice && totalPrice !== '0' ? (
          <div className="mt-0.5 text-fgd-3 text-xs">${totalPrice}</div>
        ) : (
          ''
        )}
      </div>
    </a>
  ) : null
}

export default TreasuryAccountItem
