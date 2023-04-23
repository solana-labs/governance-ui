import { BigNumber } from 'bignumber.js'

import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import { AssetType, Asset } from '@models/treasury/Asset'
import { getTreasuryAccountItemInfoV2 } from '@utils/treasuryTools'
import TokenIcon from '@components/treasuryV2/icons/TokenIcon'
import tokenPriceService from '@utils/services/tokenPrice'
import { WSOL_MINT } from '@components/instructions/tools'
import { abbreviateAddress } from '@utils/formatting'

import { getAccountAssetCount } from './getAccountAssetCount'
import { getAccountValue } from './getAccountValue'
import OutsideSrcImg from '@components/OutsideSrcImg'

export const convertAccountToAsset = (
  account: AssetAccount,
  councilMintAddress?: string,
  communityMintAddress?: string
): Asset | null => {
  const info = getTreasuryAccountItemInfoV2(account)

  switch (account.type) {
    case AccountType.AuxiliaryToken:
    case AccountType.GENERIC: {
      return null
    }

    case AccountType.MINT:
      return {
        type: AssetType.Mint,
        address: account.pubkey.toBase58(),
        id: account.pubkey.toBase58() + account.type,
        name:
          info.accountName ||
          (info.info?.address === WSOL_MINT
            ? 'wSol'
            : abbreviateAddress(account.pubkey.toBase58())),
        raw: account,
        symbol: info.symbol,
        tokenRole:
          councilMintAddress &&
          account.extensions.mint?.publicKey.toBase58() === councilMintAddress
            ? 'council'
            : communityMintAddress &&
              account.extensions.mint?.publicKey.toBase58() ===
                communityMintAddress
            ? 'community'
            : undefined,
        totalSupply: account.extensions.mint
          ? new BigNumber(
              account.extensions.mint.account.supply.toString()
            ).shiftedBy(-account.extensions.mint.account.decimals)
          : undefined,
      }

    case AccountType.SOL:
      return {
        type: AssetType.Sol,
        address: account.pubkey.toBase58(),
        id: account.pubkey.toBase58() + account.type,
        count: getAccountAssetCount(account),
        icon: info.info?.logoURI ? (
          <OutsideSrcImg src={info.info.logoURI} className="rounded-full" />
        ) : (
          <TokenIcon className="fill-fgd-1" />
        ),
        price: account.extensions.mint
          ? new BigNumber(
              tokenPriceService.getUSDTokenPrice(
                account.extensions.mint.publicKey.toBase58()
              )
            )
          : undefined,
        raw: account,
        value: getAccountValue(account),
      }

    case AccountType.TOKEN:
      return {
        type: AssetType.Token,
        address: account.pubkey.toBase58(),
        id: account.pubkey.toBase58() + account.type,
        count: getAccountAssetCount(account),
        icon: info.info?.logoURI ? (
          <OutsideSrcImg src={info.info.logoURI} className="rounded-full" />
        ) : (
          <TokenIcon className="fill-fgd-1" />
        ),
        logo: info.info?.logoURI,
        mintAddress: account.extensions.token?.account.mint.toBase58(),
        name: info.accountName || info.info?.name || info.name || info.symbol,
        price: account.extensions.mint
          ? new BigNumber(
              tokenPriceService.getUSDTokenPrice(
                account.extensions.mint.publicKey.toBase58()
              )
            )
          : undefined,
        raw: account,
        symbol: info.symbol,
        value: getAccountValue(account),
      }

    case AccountType.PROGRAM:
      throw new Error('Handle Programs separately')

    case AccountType.NFT:
      throw new Error('Handle NFTs separately')
  }
}
