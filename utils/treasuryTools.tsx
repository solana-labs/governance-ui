import { getAccountName, WSOL_MINT } from '@components/instructions/tools'
import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import BigNumber from 'bignumber.js'
import { abbreviateAddress } from './formatting'
import tokenPriceService from './services/tokenPrice'
import { AccountType, AssetAccount } from './uiTypes/assets'
import { getJupiterPriceSync } from '@hooks/queries/jupiterPrice'

export const getTreasuryAccountItemInfoV2 = (account: AssetAccount) => {
  const mintAddress =
    account.type === AccountType.SOL
      ? WSOL_MINT
      : account.extensions.mint?.publicKey.toBase58()

  const amount =
    account.extensions.amount && account.extensions.mint
      ? getMintDecimalAmountFromNatural(
          account.extensions.mint.account,
          new BN(
            account.isSol
              ? account.extensions.solAccount!.lamports
              : account.extensions.amount
          )
        ).toNumber()
      : 0
  const price = getJupiterPriceSync(new PublicKey(mintAddress!)) // Update to fetchJupiterPrice ASAP, this is a race condition
  const totalPrice = amount * price
  const totalPriceFormatted = amount
    ? new BigNumber(totalPrice).toFormat(0)
    : ''
  const info = tokenPriceService.getTokenInfo(mintAddress!)

  const symbol =
    account.type === AccountType.NFT
      ? 'NFTS'
      : account.type === AccountType.SOL
      ? 'SOL'
      : info?.symbol
      ? info.address === WSOL_MINT
        ? 'wSOL'
        : info?.symbol
      : account.extensions.mint
      ? abbreviateAddress(account.extensions.mint.publicKey)
      : ''
  const amountFormatted = new BigNumber(amount).toFormat()

  const logo = info?.logoURI || ''
  const accountName = account.pubkey ? getAccountName(account.pubkey) : ''
  const name = accountName
    ? accountName
    : account.extensions.transferAddress
    ? abbreviateAddress(account.extensions.transferAddress as PublicKey)
    : ''

  const displayPrice =
    totalPriceFormatted && totalPriceFormatted !== '0'
      ? totalPriceFormatted
      : ''

  return {
    accountName,
    amountFormatted,
    logo,
    name,
    displayPrice,
    info,
    symbol,
    totalPrice,
  }
}
