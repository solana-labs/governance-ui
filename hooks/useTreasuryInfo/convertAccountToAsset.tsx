import { BigNumber } from 'bignumber.js'

import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import { AssetType, Asset } from '@models/treasury/Asset'
import { getTreasuryAccountItemInfoV2 } from '@utils/treasuryTools'
import UnknownTokenIcon from '@components/treasuryV2/icons/UnknownTokenIcon'
import tokenService from '@utils/services/token'
import { WSOL_MINT } from '@components/instructions/tools'
import { ntext } from '@utils/ntext'

import { getAccountAssetCount } from './getAccountAssetCount'
import { getAccountValue } from './getAccountValue'

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
          info.accountName || info.info?.address === WSOL_MINT
            ? 'wSol'
            : ntext(
                account.extensions.mint?.account.supply.toNumber() || 0,
                'token'
              ),
        raw: account,
        tokenType:
          councilMintAddress &&
          account.extensions.mint?.publicKey.toBase58() === councilMintAddress
            ? 'council'
            : communityMintAddress &&
              account.extensions.mint?.publicKey.toBase58() ===
                communityMintAddress
            ? 'community'
            : undefined,
        totalSupply: account.extensions.mint
          ? new BigNumber(account.extensions.mint.account.supply.toString())
          : undefined,
      }

    case AccountType.SOL:
      return {
        type: AssetType.Sol,
        address: account.pubkey.toBase58(),
        id: account.pubkey.toBase58() + account.type,
        count: getAccountAssetCount(account),
        icon: info.info?.logoURI ? (
          <img src={info.info.logoURI} />
        ) : (
          <UnknownTokenIcon className="stroke-white" />
        ),
        price: account.extensions.mint
          ? new BigNumber(
              tokenService.getUSDTokenPrice(
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
          <img src={info.info.logoURI} />
        ) : (
          <UnknownTokenIcon />
        ),
        logo: info.info?.logoURI,
        mintAddress: account.extensions.token?.account.mint.toBase58(),
        name: info.accountName || info.info?.name || info.name || info.symbol,
        price: account.extensions.mint
          ? new BigNumber(
              tokenService.getUSDTokenPrice(
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
