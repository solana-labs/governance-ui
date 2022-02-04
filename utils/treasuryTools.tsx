import { getAccountName, WSOL_MINT } from '@components/instructions/tools'
import { BN } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import BigNumber from 'bignumber.js'
import { abbreviateAddress } from './formatting'
import tokenService from './services/token'
import { GovernedTokenAccount } from './tokens'
import { NFTWithMint } from './uiTypes/nfts'

export const getTreasuryAccountItemInfo = (
  governedAccountTokenAccount: GovernedTokenAccount,
  governanceNfts: { [governance: string]: NFTWithMint[] }
) => {
  const mintAddress =
    governedAccountTokenAccount && governedAccountTokenAccount.token
      ? governedAccountTokenAccount.isSol
        ? WSOL_MINT
        : governedAccountTokenAccount.token.account.mint.toBase58()
      : ''

  const amount =
    governedAccountTokenAccount && governedAccountTokenAccount.mint?.account
      ? getMintDecimalAmountFromNatural(
          governedAccountTokenAccount.mint?.account,
          new BN(
            governedAccountTokenAccount.isSol
              ? governedAccountTokenAccount.solAccount!.lamports
              : governedAccountTokenAccount.token!.account.amount
          )
        ).toNumber()
      : 0

  const accountPublicKey = governedAccountTokenAccount
    ? governedAccountTokenAccount.transferAddress
    : null

  const price = tokenService.getUSDTokenPrice(mintAddress)
  const totalPrice = amount * price
  const totalPriceFormatted = amount
    ? new BigNumber(totalPrice).toFormat(0)
    : ''

  const info = tokenService.getTokenInfo(mintAddress)

  const amountFormatted = governedAccountTokenAccount.isNft
    ? governedAccountTokenAccount.governance
      ? governanceNfts[
          governedAccountTokenAccount.governance?.pubkey.toBase58()
        ]?.length
      : '0'
    : new BigNumber(amount).toFormat()

  const logo = governedAccountTokenAccount.isNft
    ? '/img/collectablesIcon.svg'
    : info?.logoURI
    ? info?.logoURI
    : ''
  const accountName = governedAccountTokenAccount.token
    ? getAccountName(governedAccountTokenAccount.token?.publicKey)
    : ''
  const name = accountName
    ? accountName
    : accountPublicKey
    ? abbreviateAddress(accountPublicKey as PublicKey)
    : ''
  const symbol = governedAccountTokenAccount.isNft
    ? 'NFTS'
    : governedAccountTokenAccount.isSol
    ? 'SOL'
    : info?.symbol
    ? info?.symbol
    : governedAccountTokenAccount.mint
    ? abbreviateAddress(governedAccountTokenAccount.mint.publicKey)
    : ''
  const isSol = governedAccountTokenAccount.isSol
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
