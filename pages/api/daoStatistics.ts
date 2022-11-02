import {
  getAllGovernances,
  getNativeTreasuryAddress,
  getRealms,
  ProgramAccount,
  Realm,
} from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import tokenService from '@utils/services/token'
import { getOwnedTokenAccounts, tryGetMint } from '@utils/tokens'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAllSplGovernanceProgramIds } from './tools/realms'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { WSOL_MINT_PK } from '@components/instructions/tools'
import { withSentry } from '@sentry/nextjs'
import { getRealmConfigAccountOrDefault } from '@tools/governance/configs'
import { chunks } from '@utils/helpers'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const conn = new Connection(
    'http://realms-realms-c335.mainnet.rpcpool.com/258d3727-bb96-409d-abea-0b1b4c48af29/',
    'recent'
  )

  console.log('fetching spl-gov instances...')
  // Get all realms
  //const allProgramIds = getAllSplGovernanceProgramIds().slice(0, 1)
  const allProgramIds = getAllSplGovernanceProgramIds()

  console.log(`spl-gov instance count: ${allProgramIds.length}`)

  console.log('fetching realms...')
  let allRealms: ProgramAccount<Realm>[] = []

  for (const programId of allProgramIds) {
    const allProgramRealms = await getRealms(conn, new PublicKey(programId))

    allRealms = allRealms.concat(allProgramRealms)
  }

  //allRealms = allRealms.slice(251)

  console.log(`realms count: ${allRealms.length}`)

  const nftRealms: ProgramAccount<Realm>[] = []
  const tokenAmountMap = new Map<string, BigNumber>()

  const updateTokenAmount = (mintPk: PublicKey, amount: BN) => {
    const mintKey = mintPk.toBase58()
    tokenAmountMap.set(
      mintKey,
      (tokenAmountMap.get(mintKey) ?? new BigNumber(0)).plus(
        new BigNumber(amount.toString())
      )
    )
  }

  for (const [idx, realm] of allRealms.entries()) {
    console.log(
      `fetching ${realm.account.name} governances and token accounts ${idx}/${allRealms.length}...`
    )

    const programId = realm.owner
    const realmConfig = await getRealmConfigAccountOrDefault(
      conn,
      programId,
      realm.pubkey
    )

    // Get NFT DAOs

    if (
      realmConfig.account.communityTokenConfig.voterWeightAddin?.equals(
        new PublicKey('GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw')
      )
    ) {
      nftRealms.push(realm)
    }

    // Get Governances
    const governances = await getAllGovernances(conn, programId, realm.pubkey)
    for (const governance of governances) {
      // Check governance owned token accounts
      let tokenAccounts = await getOwnedTokenAccounts(conn, governance.pubkey)
      for (const tokenAccount of tokenAccounts.filter(
        (ta) => !ta.account.amount.isZero()
      )) {
        updateTokenAmount(
          tokenAccount.account.mint,
          tokenAccount.account.amount
        )
      }

      // Check SOL wallet owned token accounts
      const solWalletPk = await getNativeTreasuryAddress(
        programId,
        governance.pubkey
      )

      const solWallet = await conn.getAccountInfo(solWalletPk)

      if (solWallet) {
        if (solWallet.lamports > 0) {
          updateTokenAmount(WSOL_MINT_PK, new BN(solWallet.lamports))
        }

        tokenAccounts = await getOwnedTokenAccounts(conn, solWalletPk)
        for (const tokenAccount of tokenAccounts.filter(
          (ta) => !ta.account.amount.isZero()
        )) {
          updateTokenAmount(
            tokenAccount.account.mint,
            tokenAccount.account.amount
          )
        }
      }
    }
  }

  console.log('fetching tokens and prices...')
  console.log('token count', tokenAmountMap.size)

  await tokenService.fetchSolanaTokenList()

  for (const chunk of chunks([...tokenAmountMap.keys()], 100)) {
    await tokenService.fetchTokenPrices(chunk)
  }

  let totalUsdAmount = 0

  for (const [mintPk, amount] of tokenAmountMap.entries()) {
    const tokenUsdPrice = tokenService.getUSDTokenPrice(mintPk)
    if (tokenUsdPrice > 0) {
      const mint = await tryGetMint(conn, new PublicKey(mintPk))
      const decimalAmount = amount.shiftedBy(-mint!.account.decimals)
      const usdAmount = decimalAmount.toNumber() * tokenUsdPrice
      totalUsdAmount += usdAmount
    }
  }

  const daoStatistics = {
    asOf: new Date().toLocaleDateString('en-GB'),
    programIdCount: allProgramIds.length,
    daoCount: allRealms.length,
    nftDaoCount: nftRealms.length,
    totalUsdAmount,
  }

  console.log('STATS', daoStatistics)

  res.status(200).json(daoStatistics)
}

export default withSentry(handler)
