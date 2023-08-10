import { Program, Provider } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { NftVoter, IDL } from '../../idls/nft_voter'
import { NftVoterV2, IDLV2 } from '../../idls/nft_voter_v2'
import {
  DEFAULT_NFT_VOTER_PLUGIN,
  DEFAULT_NFT_VOTER_PLUGIN_V2,
} from '@tools/constants'
import { ON_NFT_VOTER_V2 } from '@constants/flags'

class NftVoterClientV1 {
  constructor(
    public program: Program<NftVoter | NftVoterV2>,
    public devnet?: boolean
  ) {}

  static connect(
    provider: Provider,
    devnet?: boolean,
    programId = new PublicKey(DEFAULT_NFT_VOTER_PLUGIN)
  ): NftVoterClientV1 {
    return new NftVoterClientV1(
      new Program<NftVoter | NftVoterV2>(IDL, programId, provider),
      devnet
    )
  }
}

class NftVoterClientV2 {
  constructor(public program: Program<NftVoterV2>, public devnet?: boolean) {}

  static connect(
    provider: Provider,
    devnet?: boolean,
    programId = new PublicKey(DEFAULT_NFT_VOTER_PLUGIN_V2)
  ): NftVoterClientV2 {
    return new NftVoterClientV2(
      new Program<NftVoterV2>(IDLV2, programId, provider),
      devnet
    )
  }
}

export class NftVoterClient extends (ON_NFT_VOTER_V2
  ? NftVoterClientV2
  : NftVoterClientV1) {}
