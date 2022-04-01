import { getAccountName, WSOL_MINT } from '@components/instructions/tools'
import { BN } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import BigNumber from 'bignumber.js'
import { AssetAccount, AccountType } from 'stores/useGovernanceAssetsStore'
import { abbreviateAddress } from './formatting'
import tokenService from './services/token'
import { NFTWithMint } from './uiTypes/nfts'

export const getTreasuryAccountItemInfo = (
  governedAccountTokenAccount: AssetAccount,
  governanceNfts: { [governance: string]: NFTWithMint[] }
) => {
  const mintAddress =
    governedAccountTokenAccount && governedAccountTokenAccount.extensions.token
      ? governedAccountTokenAccount.type === AccountType.SOL
        ? WSOL_MINT
        : governedAccountTokenAccount.extensions.token!.account.mint.toBase58()
      : ''

  const amount =
    governedAccountTokenAccount &&
    governedAccountTokenAccount.extensions.mint?.account
      ? getMintDecimalAmountFromNatural(
          governedAccountTokenAccount.extensions.mint?.account,
          new BN(
            governedAccountTokenAccount.type === AccountType.SOL
              ? governedAccountTokenAccount.extensions.solAccount!.lamports
              : governedAccountTokenAccount.extensions.token!.account.amount
          )
        ).toNumber()
      : 0

  const accountPublicKey = governedAccountTokenAccount
    ? governedAccountTokenAccount.extensions.transferAddress
    : null

  const price = tokenService.getUSDTokenPrice(mintAddress)
  const totalPrice = amount * price
  const totalPriceFormatted = amount
    ? new BigNumber(totalPrice).toFormat(0)
    : ''

  const info = tokenService.getTokenInfo(mintAddress)

  const amountFormatted =
    governedAccountTokenAccount.type === AccountType.NFT
      ? governedAccountTokenAccount.governance.pubkey
        ? governanceNfts[
            governedAccountTokenAccount.governance.pubkey.toBase58()
          ]?.length
        : '0'
      : new BigNumber(amount).toFormat()

  const logo =
    governedAccountTokenAccount.type === AccountType.NFT
      ? '/img/collectablesIcon.svg'
      : info?.logoURI
      ? info?.logoURI
      : ''

  const accountName = getName(governedAccountTokenAccount)

  const name = accountName
    ? accountName
    : accountPublicKey
    ? abbreviateAddress(accountPublicKey as PublicKey)
    : ''
  //TODO replace with switch
  const symbol =
    governedAccountTokenAccount.type === AccountType.NFT
      ? 'NFTS'
      : governedAccountTokenAccount.type === AccountType.SOL
      ? 'SOL'
      : info?.symbol
      ? info.address === WSOL_MINT
        ? 'wSOL'
        : info?.symbol
      : governedAccountTokenAccount.extensions.mint
      ? abbreviateAddress(governedAccountTokenAccount.extensions.mint.publicKey)
      : ''
  const isSol = governedAccountTokenAccount.type === AccountType.SOL
  const displayPrice =
    totalPriceFormatted && totalPriceFormatted !== '0'
      ? totalPriceFormatted
      : ''

  return {
    accountName,
    amountFormatted,
    logo,
    name,
    symbol,
    displayPrice,
    info,
    isSol,
  }
}

export const getTreasuryAccountItemInfoV2 = (account: AssetAccount) => {
  const mintAddress =
    account.type === AccountType.SOL
      ? WSOL_MINT
      : account.extensions.mint?.publicKey.toBase58()

  const amount =
    account.extensions.amount && account.extensions.mint
      ? getMintDecimalAmountFromNatural(
          account.extensions.mint.account,
          new BN(account.extensions.amount)
        ).toNumber()
      : 0

  const price = tokenService.getUSDTokenPrice(mintAddress!)
  const totalPrice = amount * price
  const totalPriceFormatted = amount
    ? new BigNumber(totalPrice).toFormat(0)
    : ''

  const info = tokenService.getTokenInfo(mintAddress!)

  const amountFormatted = new BigNumber(amount).toFormat()

  const logo = info?.logoURI
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
  }
}
const getName = (governedAccountTokenAccount: AssetAccount) => {
  const tokenAccName = governedAccountTokenAccount.extensions.transferAddress
    ? getAccountName(governedAccountTokenAccount.extensions.transferAddress)
    : ''

  return tokenAccName
}
