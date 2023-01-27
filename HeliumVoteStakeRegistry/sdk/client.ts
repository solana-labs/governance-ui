import { Program, Provider } from '@project-serum/anchor'
import { PROGRAM_ID, init } from '@helium/voter-stake-registry-sdk'
import { VoterStakeRegistry } from '@helium/idls/lib/types/voter_stake_registry'

export class HeliumVsrClient {
  constructor(
    public program: Program<VoterStakeRegistry>,
    public devent?: boolean
  ) {}

  static async connect(
    provider: Provider,
    devnet?: boolean
  ): Promise<HeliumVsrClient> {
    const idl = await Program.fetchIdl(PROGRAM_ID, provider)

    return new HeliumVsrClient(
      (await init(
        provider as any,
        PROGRAM_ID,
        idl as VoterStakeRegistry
      )) as any,
      devnet
    )
  }
}
