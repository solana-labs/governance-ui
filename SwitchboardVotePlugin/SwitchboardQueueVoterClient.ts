import { Program, Provider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { Switchboard, IDL } from './SwitchboardIdl';
//import { NftVoter, IDL } from './nft_voter';

export const SWITCHBOARD_ID = new PublicKey(
  '7PMP6yE6qb3XzBQr5TK2GhuruYayZzBnT8U92ySaLESC',
);

export class SwitchboardQueueVoterClient {
  constructor(public program: Program<Switchboard>, public devnet?: boolean) {}

  static async connect(
    provider: Provider,
    devnet?: boolean,
  ): Promise<SwitchboardQueueVoterClient> {
    // alternatively we could fetch from chain
    // const idl = await Program.fetchIdl(VSR_ID, provider);
    const idl = IDL;

    return new SwitchboardQueueVoterClient(
      new Program<Switchboard>(idl as Switchboard, SWITCHBOARD_ID, provider),
      devnet,
    );
  }
}
