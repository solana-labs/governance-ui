import { BN, Program, Provider } from '@coral-xyz/anchor'
import { Client } from '@solana/governance-program-library'
import {
  getTokenOwnerRecordAddress,
  SYSTEM_PROGRAM_ID,
} from '@solana/spl-governance'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { DriftStakeVoter, IDL } from './idl/driftStakeVoter'
import { IDL as DriftIDL } from './idl/drift'
import {
  getInsuranceFundStakeAccountPublicKey,
  getInsuranceFundVaultPublicKey,
  getSpotMarketPublicKey,
  unstakeSharesToAmountWithOpenRequest,
} from './driftSdk'
import { fetchTokenAccountByPubkey } from '@hooks/queries/tokenAccount'
import { DRIFT_STAKE_VOTER_PLUGIN } from './constants'
import { fetchRealmByPubkey } from '@hooks/queries/realm'
import queryClient from '@hooks/queries/queryClient'

export class DriftVoterClient extends Client<DriftStakeVoter> {
  readonly requiresInputVoterWeight = true

  async _fetchRegistrar(realm: PublicKey, mint: PublicKey) {
    const { registrar: registrarPk } = this.getRegistrarPDA(realm, mint)
    const registrar = await queryClient.fetchQuery(
      ['Drift', 'Plugin Registrar', registrarPk],
      () => this.program.account.registrar.fetch(registrarPk)
    )
    return registrar
  }

  constructor(
    public program: Program<DriftStakeVoter>,
    public devnet: boolean
  ) {
    super(program, devnet)
  }

  async calculateMaxVoterWeight(
    _realm: PublicKey,
    _mint: PublicKey
  ): Promise<BN | null> {
    console.log(
      'drift voter client was just asked to calculate max voter weight'
    )
    const { result: realm } = await fetchRealmByPubkey(
      this.program.provider.connection,
      _realm
    )
    console.log('drift voter client realm', realm)
    return realm?.account.config?.communityMintMaxVoteWeightSource.value ?? null // TODO this code should not actually be called because this is not a max voter weight plugin
  }

  async calculateVoterWeight(
    voter: PublicKey,
    realm: PublicKey,
    mint: PublicKey,
    inputVoterWeight: BN
  ): Promise<BN | null> {
    const registrar = await this._fetchRegistrar(realm, mint)
    const spotMarketIndex = registrar.spotMarketIndex // could just hardcode spotmarket pk
    const driftProgramId = registrar.driftProgramId // likewise
    const drift = new Program(DriftIDL, driftProgramId, this.program.provider)
    const spotMarketPk = await getSpotMarketPublicKey(
      driftProgramId,
      spotMarketIndex
    )
    const insuranceFundVaultPk = await getInsuranceFundVaultPublicKey(
      driftProgramId,
      spotMarketIndex
    )
    const insuranceFundStakePk = await getInsuranceFundStakeAccountPublicKey(
      driftProgramId,
      voter,
      spotMarketIndex
    )

    const insuranceFundStake = await queryClient.fetchQuery({
      queryKey: ['Insurance Fund Stake', insuranceFundStakePk.toString()],
      queryFn: async () =>
        drift.account.insuranceFundStake.fetchNullable(insuranceFundStakePk),
    })

    if (insuranceFundStake === null) {
      console.log('drift voter client', 'no insurance fund stake account found')
      return inputVoterWeight
    }

    const spotMarket = await queryClient.fetchQuery({
      queryKey: ['Drift Spot Market', spotMarketPk.toString()],
      queryFn: async () => drift.account.spotMarket.fetchNullable(spotMarketPk),
    })

    if (spotMarket === null) {
      console.log('Drift spot market not found: ' + spotMarketPk.toString())
      return inputVoterWeight
    }

    const insuranceFundVault = await fetchTokenAccountByPubkey(
      this.program.provider.connection,
      insuranceFundVaultPk
    )
    if (insuranceFundVault.result === undefined) {
      console.log(
        'Insurance fund vault not found: ' + insuranceFundVaultPk.toString()
      )
      return inputVoterWeight
    }

    const nShares = insuranceFundStake.ifShares
    const withdrawRequestShares = insuranceFundStake.lastWithdrawRequestShares
    const withdrawRequestAmount = insuranceFundStake.lastWithdrawRequestValue
    const totalIfShares = spotMarket.insuranceFund.totalShares
    const insuranceFundVaultBalance = insuranceFundVault.result?.amount

    const amount = unstakeSharesToAmountWithOpenRequest(
      nShares,
      withdrawRequestShares,
      withdrawRequestAmount,
      totalIfShares,
      insuranceFundVaultBalance
    )

    return amount.add(inputVoterWeight)
  }

  async updateVoterWeightRecord(
    voter: PublicKey,
    realm: PublicKey,
    mint: PublicKey
    //action?: VoterWeightAction | undefined,
    //inputRecordCallback?: (() => Promise<PublicKey>) | undefined
  ): Promise<{
    pre: TransactionInstruction[]
    post?: TransactionInstruction[] | undefined
  }> {
    const connection = this.program.provider.connection
    const { result: realmAccount } = await fetchRealmByPubkey(connection, realm)
    if (!realmAccount) throw new Error('Realm not found')
    const tokenOwnerRecordPk = await getTokenOwnerRecordAddress(
      realmAccount?.owner,
      realm,
      mint,
      voter
    )
    const { voterWeightPk } = await this.getVoterWeightRecordPDA(
      realm,
      mint,
      voter
    )
    const { registrar: registrarPk } = this.getRegistrarPDA(realm, mint)
    const registrar = await this._fetchRegistrar(realm, mint)
    const spotMarketIndex = registrar.spotMarketIndex // could just hardcode spotmarket pk
    const driftProgramId = registrar.driftProgramId // likewise
    const drift = new Program(DriftIDL, driftProgramId, this.program.provider)

    //const drift = new Program(DriftIDL, driftProgramId, this.program.provider)
    const spotMarketPk = await getSpotMarketPublicKey(
      driftProgramId,
      spotMarketIndex
    )
    const insuranceFundVaultPk = await getInsuranceFundVaultPublicKey(
      driftProgramId,
      spotMarketIndex
    )
    const insuranceFundStakePk = await getInsuranceFundStakeAccountPublicKey(
      driftProgramId,
      voter,
      spotMarketIndex
    )

    const spotMarket = await queryClient.fetchQuery({
      queryKey: ['Drift Spot Market', spotMarketPk.toString()],
      queryFn: async () => drift.account.spotMarket.fetchNullable(spotMarketPk),
    })
    const spotMarketPkOrNull = spotMarket === null ? null : spotMarketPk

    const insuranceFundVault = await fetchTokenAccountByPubkey(
      this.program.provider.connection,
      insuranceFundVaultPk
    )
    const insuranceFundVaultPkOrNull =
      insuranceFundVault.found === false ? null : insuranceFundVaultPk

    let insuranceFundStake:
      | Awaited<ReturnType<typeof drift.account.insuranceFundStake.fetch>>
      | undefined
    try {
      insuranceFundStake = await drift.account.insuranceFundStake.fetch(
        insuranceFundStakePk
      )
    } catch (e) {
      console.log('drift voter client', 'no insurance fund stake account found')
      insuranceFundStake = undefined
    }
    const stakePkOrNull =
      insuranceFundStake === undefined ? null : insuranceFundStakePk

    const ix = await this.program.methods
      .updateVoterWeightRecord()
      .accountsStrict({
        voterWeightRecord: voterWeightPk,
        registrar: registrarPk,
        driftProgram: driftProgramId,
        spotMarket: spotMarketPkOrNull,
        insuranceFundStake: stakePkOrNull,
        insuranceFundVault: insuranceFundVaultPkOrNull,
        tokenOwnerRecord: tokenOwnerRecordPk,
      })
      .instruction()

    return { pre: [ix] }
  }

  // NO-OP
  async createMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
    return null
  }

  // NO-OP
  async updateMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
    return null
  }

  static async connect(
    provider: Provider,
    programId = new PublicKey(DRIFT_STAKE_VOTER_PLUGIN),
    devnet = false
  ): Promise<DriftVoterClient> {
    return new DriftVoterClient(
      new Program<DriftStakeVoter>(IDL, programId, provider),
      devnet
    )
  }

  async createVoterWeightRecord(
    voter: PublicKey,
    realm: PublicKey,
    mint: PublicKey
  ): Promise<TransactionInstruction | null> {
    const { voterWeightPk } = await this.getVoterWeightRecordPDA(
      realm,
      mint,
      voter
    )
    const { registrar } = this.getRegistrarPDA(realm, mint)

    return this.program.methods
      .createVoterWeightRecord(voter)
      .accounts({
        voterWeightRecord: voterWeightPk,
        registrar,
        payer: voter,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .instruction()
  }
}
