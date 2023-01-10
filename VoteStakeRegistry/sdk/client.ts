import { Program, Provider, web3 } from '@project-serum/anchor'
import {
  IDL as DefaultIDL,
  VoterStakeRegistry as DefaultVoterStakeRegistry,
} from './voter_stake_registry'
import { VoterStakeRegistry as HeliumVoterStakeRegistry } from '@helium/idls/lib/types/voter_stake_registry'
import { PROGRAM_ID as HELIUM_VSR_PROGRAM_ID } from '@helium/voter-stake-registry-sdk'

export const DEFAULT_VSR_ID = new web3.PublicKey(
  'vsr2nfGVNHmSY8uxoBGqq8AQbwz3JwaEaHqGbsTPXqQ'
)

type VoterStakeRegistry = DefaultVoterStakeRegistry | HeliumVoterStakeRegistry

export class VsrClient {
  constructor(
    public program: Program<VoterStakeRegistry>,
    public devnet?: boolean,
    public isHeliumVsr?: boolean
  ) {}

  static async connect(
    provider: Provider,
    programId: web3.PublicKey = DEFAULT_VSR_ID,
    devnet?: boolean
  ): Promise<VsrClient> {
    const idl = (await Program.fetchIdl(programId, provider)) || DefaultIDL
    const isHeliumVsr = (() => programId.equals(HELIUM_VSR_PROGRAM_ID))()

    return new VsrClient(
      new Program<VoterStakeRegistry>(
        idl as VoterStakeRegistry,
        programId,
        provider
      ) as Program<VoterStakeRegistry>,
      devnet,
      isHeliumVsr
    )
  }
}
