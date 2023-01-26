import { Program, Provider, web3 } from '@project-serum/anchor'
import { IDL as DefaultIDL, VoterStakeRegistry } from './voter_stake_registry'

export const DEFAULT_VSR_ID = new web3.PublicKey(
  'vsr2nfGVNHmSY8uxoBGqq8AQbwz3JwaEaHqGbsTPXqQ'
)

export class VsrClient {
  constructor(
    public program: Program<VoterStakeRegistry>,
    public devnet?: boolean
  ) {}

  static async connect(
    provider: Provider,
    programId: web3.PublicKey = DEFAULT_VSR_ID,
    devnet?: boolean
  ): Promise<VsrClient> {
    const idl = (await Program.fetchIdl(programId, provider)) || DefaultIDL

    return new VsrClient(
      new Program<VoterStakeRegistry>(
        idl as VoterStakeRegistry,
        programId,
        provider
      ) as Program<VoterStakeRegistry>,
      devnet
    )
  }
}
