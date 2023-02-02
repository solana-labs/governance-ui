import { Program, Provider } from '@project-serum/anchor'
import { VoterStakeRegistry } from '@helium/idls/lib/types/voter_stake_registry'
import { PROGRAM_ID, init } from '@helium/voter-stake-registry-sdk'

export class HeliumVsrClient {
  constructor(
    public program: Program<VoterStakeRegistry>,
    public devent?: boolean
  ) {}

  static async connect(
    provider: Provider,
    devnet?: boolean
  ): Promise<HeliumVsrClient> {
    return new HeliumVsrClient(
      (await init(provider as any, PROGRAM_ID, null)) as any,
      devnet
    )
  }
}
