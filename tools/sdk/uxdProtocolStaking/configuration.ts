import { EndpointTypes } from '@models/types'
import { ConfirmOptions, PublicKey } from '@solana/web3.js'

class UXDProtocolStakingConfiguration {
  public readonly programId: {
    [cluster in EndpointTypes]?: PublicKey
  } = {
    devnet: new PublicKey('G32Z4MiJhFfaidSLCz36WBLzcNJQ4o4mv6dHLzM35Huq'),
    mainnet: new PublicKey('UXDSkps5NR8Lu1HB5uPLFfuB34hZ6DCk7RhYZZtGzbF'),
  }

  public readonly instructionCodes = {
    initializeStakingCampaign: 161,
    addStakingOption: 191,
    activateStakingOption: 193,
    finalizeStakingCampaign: 166,
    refillRewardVault: 83,
  }

  public readonly TXN_OPTS: ConfirmOptions = {
    commitment: 'confirmed',
    preflightCommitment: 'processed',
    skipPreflight: false,
  }

  // 10_000 = 100%, 5_000 = 50% ...
  public readonly APR_BASIS = 10_000
}

export default new UXDProtocolStakingConfiguration()
