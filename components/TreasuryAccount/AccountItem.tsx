import { useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { findMetadataPda } from '@metaplex-foundation/js'
import { getTreasuryAccountItemInfoV2 } from '@utils/treasuryTools'
import { AssetAccount } from '@utils/uiTypes/assets'
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
    const tryAndLoadLogoAndSymbolFromTokenMetadata = async (
      mintAddress: PublicKey
    ) => {
      try {
        const metadataAccount = findMetadataPda(mintAddress)

        const accountData = await connection.current.getAccountInfo(
          metadataAccount
        )

        if (!accountData) {
          throw new Error(
            `Cannot find metaplex token metadata for mint ${mintAddress.toBase58()} at pda ${metadataAccount.toBase58()}`
          )
        }

        const [
          {
            data: { uri },
          },
        ] = Metadata.deserialize(accountData.data)

        const jsonUri = uri.slice(0, uri.indexOf('\x00'))

        const data: {
          // Token Metadata Standard (Version 1.0) doesn't include image attribute, v2 does
          image?: string
          symbol: string
        } = await (await fetch(jsonUri)).json()

        setLogoFromMeta(data.image)
        setSymbolFromMeta(data.symbol)
      } catch (e) {
        console.warn(e.message)
      }
    }

    if (
      !logo &&
      typeof governedAccountTokenAccount.extensions.mint?.publicKey !==
        'undefined'
    ) {
      tryAndLoadLogoAndSymbolFromTokenMetadata(
        governedAccountTokenAccount.extensions.mint.publicKey
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [governedAccountTokenAccount.extensions.mint?.publicKey.toBase58()])

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
