import { Program, Provider } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { NftVoter, IDL } from '../../idls/nft_voter'
import { NftVoterV2, IDLV2 } from '../../idls/nft_voter_v2'
import {
  DEFAULT_NFT_VOTER_PLUGIN,
  DEFAULT_NFT_VOTER_PLUGIN_V2,
} from '@tools/constants'
import { ON_NFT_VOTER_V2 } from '@constants/flags'

// const programVersion = (ON_NFT_VOTER_V2 ? Program<NftVoterV2> : Program<NftVoter>)
// const idl = ON_NFT_VOTER_V2 ? IDLV2 : IDL
const DEFAULT_NFT_VOTER_PLUGIN_VERSION = ON_NFT_VOTER_V2
  ? DEFAULT_NFT_VOTER_PLUGIN_V2
  : DEFAULT_NFT_VOTER_PLUGIN

export class NftVoterClientV1 {
  constructor(public program: Program<NftVoter>, public devnet?: boolean) {}

  static connect(
    provider: Provider,
    devnet?: boolean,
    programId = new PublicKey(DEFAULT_NFT_VOTER_PLUGIN_VERSION)
  ): NftVoterClient {
    return new NftVoterClient(
      new Program<NftVoter>(IDL, programId, provider),
      devnet
    )
  }
}

export class NftVoterClientV2 {
  constructor(public program: Program<NftVoterV2>, public devnet?: boolean) {}

  static connect(
    provider: Provider,
    devnet?: boolean,
    programId = new PublicKey(DEFAULT_NFT_VOTER_PLUGIN_VERSION)
  ): NftVoterClient {
    console.log(programId.toBase58())
    return new NftVoterClient(
      new Program<NftVoterV2>(IDLV2, programId, provider),
      devnet
    )
  }
}

export class NftVoterClient {
  constructor(
    public program: Program<NftVoterV2> | Program<NftVoter>,
    public devnet?: boolean
  ) {}

  static connect(
    provider: Provider,
    devnet?: boolean,
    programId = new PublicKey(DEFAULT_NFT_VOTER_PLUGIN_VERSION)
  ): NftVoterClient {
    if (ON_NFT_VOTER_V2) {
      return NftVoterClientV2.connect(
        provider,
        devnet,
        programId
      ) as NftVoterClient
    } else {
      return NftVoterClientV1.connect(
        provider,
        devnet,
        programId
      ) as NftVoterClient
    }
  }
}
