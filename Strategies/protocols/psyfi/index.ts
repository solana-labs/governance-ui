import { ConnectionContext } from '@utils/connection'
import { PsyFiStrategy } from 'Strategies/types/types'
import axios from 'axios'

import {
  Action,
  CreatePsyFiStrategy,
  PsyFiStrategyInfo,
  Strategy,
  TokenGroupedVaults,
  VaultInfo,
} from './types'
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
import { createProposal } from 'actions/createProposal'
import { deriveVaultCollateralAccount } from 'Strategies/components/psyfi/pdas'
import { MAINNET_PROGRAM_KEYS } from 'Strategies/components/psyfi/programIds'

export const getVaultInfos = async (): Promise<VaultInfo[]> => {
  const res = await axios.get(
    `https://us-central1-psyfi-api.cloudfunctions.net/vaults?env=mainnet`
  )
  const vaultInfos = Object.values(res.data.vaults as any) as VaultInfo[]
  return vaultInfos
}

const handleVaultAction: CreatePsyFiStrategy = async (
  rpcContext: RpcContext,
  form: {
    action: Action
    strategy: PsyFiStrategy
    title: string
    description: string
    bnAmount: BN
    amountFmt: string
  },
  psyFiStrategyInfo: PsyFiStrategyInfo,
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
    psyFiStrategyInfo,
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
  // TODO: Handle native SOL deposits

  // TODO: Check if vault token account exists (this should already be passed in if current deposits must be known). Create prerequisiteInstructions if not.

  // TODO: Anything needed for pending deposit receipt??

  // TODO: Create the actual deposit instruction

  const proposalAddress = await createProposal(
    rpcContext,
    realm,
    matchedTreasury.governance!.pubkey,
    tokenOwnerRecord,
    form.title,
    form.description,
    governingTokenMint,
    proposalIndex,
    [],
    isDraft,
    client
  )
  return proposalAddress
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
  const vaultPubkey = new PublicKey(vaultInfo.accounts.vaultAddress)
  const [collateralAccountKey] = await deriveVaultCollateralAccount(
    MAINNET_PROGRAM_KEYS.PSYFI_V2,
    vaultPubkey
  )
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
    vaultAccounts: {
      pubkey: vaultPubkey,
      lpTokenMint: new PublicKey(vaultInfo.accounts.vaultOwnershipTokenMint),
      collateralAccountKey,
    },
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
