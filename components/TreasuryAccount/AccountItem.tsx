import { getTreasuryAccountItemInfoV2 } from '@utils/treasuryTools'
import { AssetAccount } from '@utils/uiTypes/assets'
import { getConnectionContext } from '@utils/connection'
import { deprecated } from '@metaplex-foundation/mpl-token-metadata'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

const AccountItem = ({
  governedAccountTokenAccount,
}: {
  governedAccountTokenAccount: AssetAccount
}) => {
  const {
    amountFormatted,
    logo,
    name,
    symbol,
    displayPrice,
  } = getTreasuryAccountItemInfoV2(governedAccountTokenAccount)

  const [logoFromMeta, setLogoFromMeta] = useState<undefined | string>(
    undefined
  )
  const [symbolFromMeta, setSymbolFromMeta] = useState<undefined | string>(
    undefined
  )
  const connection = useWalletStore((s) => s.connection)

  useEffect(() => {
    const getTokenMetadata = async (mintAddress: string) => {
      try {
        const tokenMetaPubkey = await deprecated.Metadata.getPDA(mintAddress)

        const tokenMeta = await deprecated.Metadata.load(
          getConnectionContext(connection.cluster).current,
          tokenMetaPubkey
        )
        console.log(connection.cluster)
        console.log({ tokenMeta })
        setLogoFromMeta(tokenMeta.data?.data.uri)
        setSymbolFromMeta(tokenMeta.data?.data.symbol)
      } catch (e) {
        console.log(e)
      }
    }
    if (!logo) {
      getTokenMetadata(
        governedAccountTokenAccount.extensions.mint?.publicKey.toBase58() ?? ''
      )
    }
  })

  return (
    <div className="flex items-center w-full p-3 border rounded-lg text-fgd-1 border-fgd-4">
      {logo ? (
        <img
          className={`flex-shrink-0 h-6 w-6 mr-2.5 mt-0.5 ${
            governedAccountTokenAccount.isSol && 'rounded-full'
          }`}
          src={logo}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null // prevents looping
            currentTarget.hidden = true
          }}
        />
      ) : logoFromMeta ? (
        <img
          className={`flex-shrink-0 h-6 w-6 mr-2.5 mt-0.5 ${
            governedAccountTokenAccount.isSol && 'rounded-full'
          }`}
          src={logoFromMeta}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null // prevents looping
            currentTarget.hidden = true
          }}
        />
      ) : undefined}
      <div className="w-full">
        <div className="flex items-start justify-between mb-1">
          <div className="text-sm font-semibold text-th-fgd-1">{name}</div>
        </div>
        <div className="text-xs text-fgd-3">
          {amountFormatted} {symbolFromMeta ? symbolFromMeta : symbol}
        </div>
        {displayPrice ? (
          <div className="mt-0.5 text-fgd-3 text-xs">≈${displayPrice}</div>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

export default AccountItem
