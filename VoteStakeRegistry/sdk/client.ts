import { Program, Provider, web3 } from '@project-serum/anchor'
import { IDL, VoterStakeRegistry } from './voter_stake_registry'

export const DEFAULT_VSR_ID = new web3.PublicKey(
  '4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo'
)

export class VsrClient {
  constructor(
    public program: Program<VoterStakeRegistry>,
    public devnet?: boolean
  ) {}

  static async connect(
    provider: Provider,
    programId?: web3.PublicKey,
    devnet?: boolean
  ): Promise<VsrClient> {
    // alternatively we could fetch from chain
    // const idl = await Program.fetchIdl(VSR_ID, provider);
    const idl = IDL

    return new VsrClient(
      new Program<VoterStakeRegistry>(
        idl,
        programId || DEFAULT_VSR_ID,
        provider
      ),
      devnet
    )
  }
}
