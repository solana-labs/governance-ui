import {IdlAccounts, Program, Provider} from '@coral-xyz/anchor'
import {PublicKey, TransactionInstruction} from '@solana/web3.js'
import {IDL, NftVoter} from '../../idls/nft_voter'
import {IDLV2, NftVoterV2} from '../../idls/nft_voter_v2'
import {DEFAULT_NFT_VOTER_PLUGIN, DEFAULT_NFT_VOTER_PLUGIN_V2,} from '@tools/constants'
import {ON_NFT_VOTER_V2} from '@constants/flags'
import {Client, DEFAULT_GOVERNANCE_PROGRAM_ID} from "@solana/governance-program-library";
import {SYSTEM_PROGRAM_ID, VoterWeightAction} from "@solana/spl-governance";
import {getVotingNfts} from "@hooks/queries/plugins/nftVoter";
import {
  getUpdateVoterWeightRecordInstruction,
  getUpdateVoterWeightRecordInstructionV2
} from "@utils/instructions/NftVoter/updateVoterWeight";
import {convertVoterWeightActionToType} from "../../VoterWeightPlugins/lib/utils";
import BN from "bn.js";
import { getNftGovpowerForOwnerAndRegistrar} from "@hooks/queries/governancePower";

// const programVersion = (ON_NFT_VOTER_V2 ? Program<NftVoterV2> : Program<NftVoter>)
// const idl = ON_NFT_VOTER_V2 ? IDLV2 : IDL
const DEFAULT_NFT_VOTER_PLUGIN_VERSION = ON_NFT_VOTER_V2
    ? DEFAULT_NFT_VOTER_PLUGIN_V2
    : DEFAULT_NFT_VOTER_PLUGIN

export abstract class NftVoterClient extends Client<any> {
  readonly requiresInputVoterWeight = false;

  async getMaxVoterWeightRecordPDA(realm: PublicKey, mint: PublicKey) {
    const [
      maxVoterWeightPk,
      maxVoterWeightRecordBump,
    ] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('max-voter-weight-record'),
          realm.toBuffer(),
          mint.toBuffer(),
        ],
        this.program.programId
    )
    return {
      maxVoterWeightPk,
      maxVoterWeightRecordBump,
    }
  }

  async createVoterWeightRecord(voter: PublicKey, realm: PublicKey, mint: PublicKey): Promise<TransactionInstruction | null> {
    const { voterWeightPk } = await this.getVoterWeightRecordPDA(realm, mint, voter)
    return this.program.methods
        .createVoterWeightRecord(voter)
        .accounts({
          voterWeightRecord: voterWeightPk,
          governanceProgramId: this.governanceProgramId,
          realm,
          realmGoverningTokenMint: mint,
          payer: voter,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .instruction();
  }

  // NO-OP
  async createMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
    return null;
  }

  // NO-OP
  async updateMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
    return null;
  }
  async calculateVoterWeight(voter: PublicKey, realm: PublicKey, mint:PublicKey): Promise<BN | null> {
    const registrar = await this.getRegistrarAccount(realm, mint);
    return getNftGovpowerForOwnerAndRegistrar(this.program.provider.connection, voter, registrar as any);
  }

  async calculateMaxVoterWeight(realm: PublicKey, mint: PublicKey): Promise<BN | null> {
    const registrar = (await this.getRegistrarAccount(realm, mint)) as unknown as IdlAccounts<typeof this.program.idl>['registrar'] | undefined;
    const nftVoterPluginTotalWeight = registrar?.collectionConfigs.reduce(
        (prev, curr) => {
          const size = curr.size
          const weight = curr.weight.toNumber()
          if (typeof size === 'undefined' || typeof weight === 'undefined')
            return prev
          return prev + size * weight
        },
        0
    )

    return nftVoterPluginTotalWeight !== undefined ? new BN(nftVoterPluginTotalWeight) : null;
  }

  constructor(
      public program: Program<NftVoterV2> | Program<NftVoter>,
      public devnet: boolean,
      readonly governanceProgramId: PublicKey
  ) {
    super(program, devnet)
  }

  static async connect(
      provider: Provider,
      programId = new PublicKey(DEFAULT_NFT_VOTER_PLUGIN_VERSION),
      devnet = false,
      governanceProgramId = DEFAULT_GOVERNANCE_PROGRAM_ID
  ): Promise<NftVoterClient> {
    if (ON_NFT_VOTER_V2) {
      return NftVoterClientV2.connect(
          provider,
          programId,
          devnet,
          governanceProgramId
      )
    } else {
      return NftVoterClientV1.connect(
          provider,
          programId,
          devnet,
          governanceProgramId
      )
    }
  }
}

export class NftVoterClientV1 extends NftVoterClient {
  constructor(public program: Program<NftVoter>, public devnet: boolean, readonly governanceProgramId) {
    super(program, devnet, governanceProgramId)
  }

  async updateVoterWeightRecord(voter: PublicKey, realm: PublicKey, mint: PublicKey, action: VoterWeightAction) {
    // Not clear why, but it seems like updateVoterWeightRecord is not called during cast vote
    // for the nft plugin
    if (action === VoterWeightAction.CastVote) {
      return {pre: []}
    }

    const {registrar} = this.getRegistrarPDA(realm, mint);
    const {voterWeightPk} = await this.getVoterWeightRecordPDA(realm, mint, voter);
    const votingNfts = await getVotingNfts(
        this.program.provider.connection,
        realm,
        voter
    )

    console.log('on nft voter v1')
    const ix = await getUpdateVoterWeightRecordInstruction(
        this.program,
        voter,
        registrar,
        voterWeightPk,
        votingNfts,
        convertVoterWeightActionToType(action)
    )
    return {pre: [ix]}
  }

  static async connect(
      provider: Provider,
      programId = new PublicKey(DEFAULT_NFT_VOTER_PLUGIN_VERSION),
      devnet = false,
      governanceProgramId = DEFAULT_GOVERNANCE_PROGRAM_ID
  ): Promise<NftVoterClientV1> {
    return new NftVoterClientV1(
        new Program<NftVoter>(IDL, programId, provider),
        devnet,
        governanceProgramId
    )
  }
}

export class NftVoterClientV2 extends NftVoterClient {
  constructor(public program: Program<NftVoterV2>, public devnet: boolean, readonly governanceProgramId) {
    super(program, devnet, governanceProgramId)
  }

  async updateVoterWeightRecord(voter: PublicKey, realm: PublicKey, mint: PublicKey, action: VoterWeightAction) {
    // Not clear why, but it seems like updateVoterWeightRecord is not called during cast vote
    // for the nft plugin
    if (action === VoterWeightAction.CastVote) {
      return {pre: []}
    }

    const {registrar} = this.getRegistrarPDA(realm, mint);
    const { voterWeightPk } = await this.getVoterWeightRecordPDA(realm, mint, voter);
    const votingNfts = await getVotingNfts(
        this.program.provider.connection,
        realm,
        voter
    )

    console.log('on nft voter v2')
    const {
      createNftTicketIxs,
      updateVoterWeightRecordIx,
    } = await getUpdateVoterWeightRecordInstructionV2(
        this.program,
        voter,
        registrar,
        voterWeightPk,
        votingNfts,
        convertVoterWeightActionToType(action)
    )
    return { pre: [updateVoterWeightRecordIx] , post: createNftTicketIxs }
  }

  static async connect(
      provider: Provider,
      programId = new PublicKey(DEFAULT_NFT_VOTER_PLUGIN_VERSION),
      devnet = false,
      governanceProgramId = DEFAULT_GOVERNANCE_PROGRAM_ID
  ): Promise<NftVoterClientV2> {
    return new NftVoterClientV2(
        new Program<NftVoterV2>(IDLV2, programId, provider),
        devnet,
        governanceProgramId
    )
  }
}
