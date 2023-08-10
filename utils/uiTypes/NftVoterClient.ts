import { Program, Provider } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { NftVoter, IDL } from '../../idls/nft_voter'
import { NftVoterV2, IDLV2 } from '../../idls/nft_voter_v2'
import {
  DEFAULT_NFT_VOTER_PLUGIN,
  DEFAULT_NFT_VOTER_PLUGIN_V2,
} from '@tools/constants'
import { ON_NFT_VOTER_V2 } from '@constants/flags'

const programPk = new PublicKey(
  ON_NFT_VOTER_V2 ? DEFAULT_NFT_VOTER_PLUGIN_V2 : DEFAULT_NFT_VOTER_PLUGIN
)

export class NftVoterClient {
  constructor(
    public program: Program<NftVoter | NftVoterV2>,
    public devnet?: boolean
  ) {}

  static connect(
    provider: Provider,
    devnet?: boolean,
    programId = programPk
  ): NftVoterClient {
    return new NftVoterClient(
      new Program<NftVoter | NftVoterV2>(
        ON_NFT_VOTER_V2 ? IDLV2 : IDL,
        programId,
        provider
      ),
      devnet
    )
  }
}
