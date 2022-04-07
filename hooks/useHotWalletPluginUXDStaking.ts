import { useCallback, useEffect, useState } from 'react'
import { HotWalletAccount } from './useHotWallet'
import uxdProtocolStakingConfiguration from '@tools/sdk/uxdProtocolStaking/configuration'
import useWalletStore from 'stores/useWalletStore'
import {
  getOnchainStakingCampaign,
  StakingCampaignState,
} from '@uxdprotocol/uxd-staking-client'
import { PublicKey } from '@solana/web3.js'

const UsersCampaigns = {
  ['AWuSjBCEMVtk8fX2HAwtuMjoHLmLM72PJxi1dZdKHPFu']: [
    // Fake Dao devnet SOL Treasury's governance
    {
      name: 'Campaign Name',
      pda: new PublicKey('CrRH3o9TbxvRdNkkjcmG5qdG7XM397nKcRmxgkVniAtB'),
    },
  ],

  ['AuQHcJZhTd1dnXRrM78RomFiCvW6a9CqxxJ94Fp9h8b']: [
    // Fake Dao SOL Treasury's governance
    {
      name: 'Campaign Test',
      pda: new PublicKey('C37FJ2JeDciaEs1nKazMkkH21VZjQVq4WTMLSJYiibRr'),
    },
  ],

  ['7M6TSEkRiXiYmpRCcCDSdJGTGxAPem2HBqjW4gLQ2KoE']: [
    // Dao SOL Treasury's governance
    {
      name: 'UXP Campaign',
      pda: new PublicKey('GMkG1Xr1ZAtLbHRxfbqLFEHqjP7rGwEfhQFed41aEL1k'),
    },
  ],
}

export type StakingCampaignInfo = Omit<
  StakingCampaignState,
  'validStakingOptions' | 'getStakedVaultBalance'
> & {
  name: string
  pda: PublicKey
  stakedVaultBalance?: number
}

const useHotWalletPluginUXDStaking = (hotWalletAccount: HotWalletAccount) => {
  const [stakingCampaignsInfo, setStakingCampaignsInfo] = useState<
    StakingCampaignInfo[]
  >()
  const connection = useWalletStore((s) => s.connection)

  const loadUXDStakingCampaignInfo = useCallback(async () => {
    try {
      const programId =
        uxdProtocolStakingConfiguration.programId[connection.cluster]

      if (!programId) {
        throw new Error(
          `Unsupported cluster ${connection.cluster} for UXD Protocol Staking`
        )
      }

      const campaigns =
        UsersCampaigns[hotWalletAccount.publicKey.toBase58()] ?? []

      const stakingCampaignStates: StakingCampaignState[] = await Promise.all(
        campaigns.map(({ pda }) =>
          getOnchainStakingCampaign(
            pda,
            connection.current,
            uxdProtocolStakingConfiguration.TXN_OPTS
          )
        )
      )

      const stakedVaultBalances = await Promise.allSettled(
        stakingCampaignStates.map((stakingCampaignState) =>
          stakingCampaignState.getStakedVaultBalance(connection.current)
        )
      )

      setStakingCampaignsInfo(
        stakingCampaignStates.map(
          (
            {
              validStakingOptions: _validStakingOptions,
              getStakedVaultBalance: _getStakedVaultBalance,
              ...other
            },
            index
          ) => {
            const stakedVaultBalanceResult = stakedVaultBalances[index]

            return {
              ...other,
              stakedVaultBalance:
                stakedVaultBalanceResult.status === 'fulfilled'
                  ? stakedVaultBalanceResult.value
                  : undefined,
              name: campaigns[index].name,
              pda: campaigns[index].pda,
            }
          }
        )
      )
    } catch (e) {
      console.log(e)
      setStakingCampaignsInfo([])
    }
  }, [connection, hotWalletAccount])

  useEffect(() => {
    loadUXDStakingCampaignInfo()
  }, [loadUXDStakingCampaignInfo])

  return { stakingCampaignsInfo }
}

export default useHotWalletPluginUXDStaking
