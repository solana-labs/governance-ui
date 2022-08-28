import { ConnectionContext } from '@utils/connection'
import { PsyFiStrategy } from 'Strategies/types/types'
import axios from 'axios'

import { Action, Strategy, TokenGroupedVaults, VaultInfo } from './types'
import tokenService from '@utils/services/token'
import {
  ProgramAccount,
  Realm,
  RpcContext,
  TokenOwnerRecord,
} from '@solana/spl-governance'
import { BN } from '@project-serum/anchor'
import { AssetAccount } from '@utils/uiTypes/assets'
import { PublicKey } from '@solana/web3.js'
import { VotingClient } from '@utils/uiTypes/VotePlugin'

export const getVaultInfos = async (): Promise<VaultInfo[]> => {
  const res = await axios.get(
    `https://us-central1-psyfi-api.cloudfunctions.net/vaults?env=mainnet`
  )
  console.log('** Res', res)
  const vaultInfos = Object.values(res.data.vaults as any) as VaultInfo[]
  return vaultInfos
}

const handleVaultAction = async (
  rpcContext: RpcContext,
  form: {
    action: Action
    title: string
    description: string
    bnAmount: BN
    amountFmt: string
  },
  realm: ProgramAccount<Realm>,
  matchedTreasury: AssetAccount,
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>,
  governingTokenMint: PublicKey,
  proposalIndex: number,
  isDraft: boolean,
  connection: ConnectionContext,
  client?: VotingClient
) => {
  console.log(
    'args',
    rpcContext,
    form,
    realm,
    matchedTreasury,
    tokenOwnerRecord,
    governingTokenMint,
    proposalIndex,
    isDraft,
    connection,
    client
  )
}

export const convertVaultInfoToStrategy = async (
  vaultInfo: VaultInfo,
  otherStrategies: PsyFiStrategy[] | undefined
): Promise<PsyFiStrategy | undefined> => {
  let strategyName = ''
  if (vaultInfo.strategyType === Strategy.Call) {
    strategyName = `Sell Calls`
  } else if (vaultInfo.strategyType === Strategy.Put) {
    strategyName = `Sell Puts`
  }
  const handledMint = vaultInfo.accounts.collateralAssetMint
  const tokenInfo = await tokenService.getTokenInfo(handledMint)
  if (!tokenInfo) {
    return
  }
  const apyPercentage = vaultInfo.apy.movingAverageApy.apyAfterFees.toFixed(2)
  const strategy: PsyFiStrategy = {
    liquidity: vaultInfo.deposits.current,
    protocolSymbol: 'PSY',
    apy: `Estimated ${apyPercentage}%`,
    apyHeader: `Projected Yield`,
    protocolName: 'PsyFi',
    handledMint,
    handledTokenSymbol: tokenInfo.symbol,
    handledTokenImgSrc: tokenInfo.logoURI || '',
    protocolLogoSrc:
      'https://user-images.githubusercontent.com/32071703/149460918-3694084f-2a37-4c95-93d3-b5aaf078d444.png',
    strategyName,
    strategyDescription: 'Description',
    isGenericItem: false,
    createProposalFcn: handleVaultAction,
    otherStrategies: otherStrategies ?? [],
  }
  return strategy
}

export const getPsyFiStrategies = async (): Promise<PsyFiStrategy[]> => {
  const vaultInfos = await getVaultInfos()

  // group strategies by token
  const groupedVaults = groupVaultsByToken(vaultInfos)

  // Change how strategies are created using a custom type that has all token strategies
  //  as additionalStrategies.
  return psyFiVestingStrategies(groupedVaults)
}

const psyFiVestingStrategies = async (
  groupedVaults: TokenGroupedVaults
): Promise<PsyFiStrategy[]> => {
  const res = await Promise.all(
    Object.keys(groupedVaults).map(async (collateralTokenAddress) => {
      const strategies = groupedVaults[collateralTokenAddress]
      const topVault = strategies[0]
      if (!topVault) {
        // This should be unreachable
        throw new Error(`No vault found for ${collateralTokenAddress}`)
      }
      const otherStrategies = await Promise.all(
        strategies.map(
          async (x) => await convertVaultInfoToStrategy(x, undefined)
        )
      )
      return convertVaultInfoToStrategy(
        topVault,
        // @ts-ignore:
        otherStrategies.filter((x) => !!x)
      )
    })
  )

  // @ts-ignore
  return res.filter((x) => !!x)
}

/**
 * Given an array for VaultInfos, group by collateral token and sort the groups by APY
 */
const groupVaultsByToken = (vaultInfos: VaultInfo[]) => {
  const res: TokenGroupedVaults = {}
  vaultInfos.forEach((vaultInfo) => {
    if (res[vaultInfo.accounts.collateralAssetMint]) {
      const strategies = res[vaultInfo.accounts.collateralAssetMint]
      strategies.push(vaultInfo)
      strategies.sort((a, b) => {
        return (
          b.apy.movingAverageApy.apyAfterFees -
          a.apy.movingAverageApy.apyAfterFees
        )
      })
      res[vaultInfo.accounts.collateralAssetMint] = strategies
    } else {
      res[vaultInfo.accounts.collateralAssetMint] = [vaultInfo]
    }
  })

  return res
}
