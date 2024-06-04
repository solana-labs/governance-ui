import { CalculatedWeight, VoterWeightPluginInfo } from './types'
import { reduceAsync } from './utils'
import { PublicKey } from '@solana/web3.js'
import { ProgramAccount, TokenOwnerRecord } from '@solana/spl-governance'
import BN from 'bn.js'
import { MintInfo } from '@solana/spl-token'

type CalculateVoterWeightParams = {
  walletPublicKey: PublicKey
  realmPublicKey: PublicKey
  governanceMintPublicKey: PublicKey
  plugins: VoterWeightPluginInfo[]
  tokenOwnerRecord?: ProgramAccount<TokenOwnerRecord>
  useOnChainWeight?: boolean
}

type CalculateMaxVoterWeightParams = {
  realmPublicKey: PublicKey
  governanceMintPublicKey: PublicKey
  plugins: VoterWeightPluginInfo[]
  mintInfo: MintInfo
  configuredMaxVoteWeight: BN
  useOnChainWeight?: boolean
}

const handlePluginSuccess = (
  inputVoterWeight: CalculatedWeight,
  nextPlugin: VoterWeightPluginInfo,
  nextWeight: BN | null
): CalculatedWeight => {
  if (nextWeight === null) {
    // Plugin failed to calculate voter weight, but did not throw an error, so we just assign a generic error
    return {
      value: null,
      initialValue: inputVoterWeight.initialValue,
      details: [
        ...inputVoterWeight.details,
        {
          pluginName: nextPlugin.name,
          pluginWeight: null,
          error: new Error('Plugin failed to calculate voter weight'),
        },
      ],
    }
  }

  return {
    value: nextWeight,
    initialValue: inputVoterWeight.initialValue,
    details: [
      ...inputVoterWeight.details,
      {
        pluginName: nextPlugin.name,
        pluginWeight: nextWeight,
        error: null,
      },
    ],
  }
}

const handlePluginError = (
  inputVoterWeight: CalculatedWeight,
  nextPlugin: VoterWeightPluginInfo,
  error: Error
): CalculatedWeight => ({
  value: null,
  initialValue: inputVoterWeight.initialValue,
  details: [
    ...inputVoterWeight.details,
    {
      pluginName: nextPlugin.name,
      pluginWeight: null,
      error,
    },
  ],
})

export const calculateVoterWeight = async ({
  walletPublicKey,
  realmPublicKey,
  governanceMintPublicKey,
  plugins,
  tokenOwnerRecord,
}: CalculateVoterWeightParams): Promise<CalculatedWeight> => {
  const tokenOwnerRecordPower =
    tokenOwnerRecord?.account.governingTokenDepositAmount ?? new BN(0)

  const startingWeight: CalculatedWeight = {
    value: tokenOwnerRecordPower,
    initialValue: tokenOwnerRecordPower,
    details: [],
  }

  const reducer = async (
    inputVoterWeight: CalculatedWeight,
    nextPlugin: VoterWeightPluginInfo
  ): Promise<CalculatedWeight> => {
    if (inputVoterWeight.value === null) return inputVoterWeight

    try {
      const nextWeight = await nextPlugin.client.calculateVoterWeight(
        walletPublicKey,
        realmPublicKey,
        governanceMintPublicKey,
        inputVoterWeight.value
      )
      return handlePluginSuccess(inputVoterWeight, nextPlugin, nextWeight)
    } catch (error) {
      return handlePluginError(inputVoterWeight, nextPlugin, error)
    }
  }

  return reduceAsync<VoterWeightPluginInfo, CalculatedWeight>(
    plugins,
    reducer,
    startingWeight
  )
}

export const calculateMaxVoterWeight = async ({
  realmPublicKey,
  governanceMintPublicKey,
  plugins,
  configuredMaxVoteWeight,
}: CalculateMaxVoterWeightParams): Promise<CalculatedWeight> => {
  const startingWeight: CalculatedWeight = {
    value: configuredMaxVoteWeight,
    initialValue: configuredMaxVoteWeight,
    details: [],
  }

  const reducer = async (
    inputVoterWeight: CalculatedWeight,
    nextPlugin: VoterWeightPluginInfo
  ): Promise<CalculatedWeight> => {
    if (inputVoterWeight.value === null) return inputVoterWeight

    try {
      const nextWeight = await nextPlugin.client.calculateMaxVoterWeight(
        realmPublicKey,
        governanceMintPublicKey,
        inputVoterWeight.value
      )

      return handlePluginSuccess(inputVoterWeight, nextPlugin, nextWeight)
    } catch (error) {
      return handlePluginError(inputVoterWeight, nextPlugin, error)
    }
  }

  return reduceAsync<VoterWeightPluginInfo, CalculatedWeight>(
    plugins,
    reducer,
    startingWeight
  )
}
