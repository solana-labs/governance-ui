import { ConnectionContext } from '@utils/connection'
import { TreasuryStrategy } from 'Strategies/types/types'
import axios from 'axios'

import { Strategy, VaultInfo } from './types'
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
    action: 'Deposit' | 'Withdraw'
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
) => {}

export const convertVaultInfoToStrategy = async (
  vaultInfo: VaultInfo
): Promise<TreasuryStrategy | undefined> => {
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
  const apyPercentage = (
    vaultInfo.apy.movingAverageApy.averageEpochYield * 100
  ).toFixed(2)
  const strategy: TreasuryStrategy = {
    liquidity: vaultInfo.deposits.current,
    protocolSymbol: 'PSY',
    apy: `Estimated ${apyPercentage}%`,
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
  }
  return strategy
}

export const getPsyFiStrategies = async (): Promise<TreasuryStrategy[]> => {
  const vaultInfos = await getVaultInfos()

  const strategies = await Promise.all(
    vaultInfos.map(async (vaultInfo) => convertVaultInfoToStrategy(vaultInfo))
  )

  // @ts-ignore: TODO: Look into this
  return strategies.filter((x) => !!x)
}
