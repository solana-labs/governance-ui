import { Program, Provider, web3 } from '@coral-xyz/anchor'
import { VoterStakeRegistry } from '@helium/idls/lib/types/voter_stake_registry'
import { PROGRAM_ID, init } from '@helium/voter-stake-registry-sdk'

export class HeliumVsrClient {
  constructor(
    public program: Program<VoterStakeRegistry>,
    public devent?: boolean
  ) {}

  static async connect(
    provider: Provider,
    programId: web3.PublicKey = PROGRAM_ID,
    devnet?: boolean
  ): Promise<HeliumVsrClient> {
    return new HeliumVsrClient(
      (await init(provider as any, programId)) as any,
      devnet
    )
  }
}
