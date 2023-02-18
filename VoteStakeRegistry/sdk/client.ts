import { Program, Provider, web3 } from '@coral-xyz/anchor'
import { IDL, VoterStakeRegistry } from './voter_stake_registry'

export const DEFAULT_VSR_ID = new web3.PublicKey(
  'vsr2nfGVNHmSY8uxoBGqq8AQbwz3JwaEaHqGbsTPXqQ'
)

export class VsrClient {
  constructor(
    public program: Program<VoterStakeRegistry>,
    public devnet?: boolean
  ) {}

  static connect(
    provider: Provider,
    programId: web3.PublicKey,
    devnet?: boolean
  ): VsrClient {
    const idl = IDL

    return new VsrClient(
      new Program<VoterStakeRegistry>(idl, programId, provider),
      devnet
    )
  }
}
