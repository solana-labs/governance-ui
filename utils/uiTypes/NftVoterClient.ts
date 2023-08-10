import { Program, Provider } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { NftVoter, IDL } from '../../idls/nft_voter'
import { NftVoterV2, IDLV2 } from '../../idls/nft_voter_v2'
import {
  DEFAULT_NFT_VOTER_PLUGIN,
  DEFAULT_NFT_VOTER_PLUGIN_V2,
} from '@tools/constants'
import { ON_NFT_VOTER_V2 } from '@constants/flags'

const programVersion = (ON_NFT_VOTER_V2 ? Program<NftVoterV2> : Program<NftVoter>)
const DEFAULT_NFT_VOTER_PLUGIN_VERSION = ON_NFT_VOTER_V2 ? DEFAULT_NFT_VOTER_PLUGIN_V2 : DEFAULT_NFT_VOTER_PLUGIN
const idl = ON_NFT_VOTER_V2 ? IDLV2 : IDL

export class NftVoterClient {
  constructor(public program: Program<NftVoterV2> | Program<NftVoter>, public devnet?: boolean) {}

  static connect(
    provider: Provider,
    devnet?: boolean,
    programId = new PublicKey(DEFAULT_NFT_VOTER_PLUGIN_VERSION)
  ): NftVoterClient {
    console.log(programId.toBase58())
    return new NftVoterClient(
      new programVersion(idl, programId, provider),
      devnet
    )
  }
}
