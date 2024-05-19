import { BN, Program, Provider } from '@coral-xyz/anchor'
import { Client } from '@solana/governance-program-library'
import { SYSTEM_PROGRAM_ID } from '@solana/spl-governance'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'

import { fetchTokenAccountByPubkey } from '@hooks/queries/tokenAccount'
import { fetchRealmByPubkey } from '@hooks/queries/realm'
import { IDL, TokenHaver } from './idl/token_haver'
import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'
import { TOKEN_HAVER_PLUGIN } from './constants'

export class TokenHaverClient extends Client<TokenHaver> {
  readonly requiresInputVoterWeight = true

  constructor(public program: Program<TokenHaver>, public devnet: boolean) {
    super(program, devnet)
  }

  async calculateMaxVoterWeight(
    _realm: PublicKey,
    _mint: PublicKey
  ): Promise<BN | null> {
    const { result: realm } = await fetchRealmByPubkey(
      this.program.provider.connection,
      _realm
    )
    return realm?.account.config?.communityMintMaxVoteWeightSource.value ?? null // TODO this code should not actually be called because this is not a max voter weight plugin
  }

  async calculateVoterWeight(
    voter: PublicKey,
    realm: PublicKey,
    mint: PublicKey
  ): Promise<BN | null> {
    const { registrar: registrarPk } = this.getRegistrarPDA(realm, mint)
    const registrar = await this.program.account.registrar.fetch(registrarPk)
    const countOfTokensUserHas = (
      await Promise.all(
        registrar.mints.map(async (mint) => {
          const tokenAccountPk = await getAssociatedTokenAddress(mint, voter)
          const tokenAccount = await fetchTokenAccountByPubkey(
            this.program.provider.connection,
            tokenAccountPk
          )
          return (tokenAccount.result?.amount ?? new BN(0)).gt(new BN(0))
            ? 1
            : 0
        })
      )
    ).reduce((acc, curr) => acc + curr, 0)
    return new BN(countOfTokensUserHas).muln(10 ** 6)
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

    const { voterWeightPk } = await this.getVoterWeightRecordPDA(
      realm,
      mint,
      voter
    )
    const { registrar: registrarPk } = this.getRegistrarPDA(realm, mint)
    const registrar = await this.program.account.registrar.fetch(registrarPk)

    const tokenAccounts = (
      await Promise.all(
        registrar.mints.map(async (mint) => {
          const tokenAccountPk = await getAssociatedTokenAddress(mint, voter)
          // filter out empty accounts
          const account = await fetchTokenAccountByPubkey(
            this.program.provider.connection,
            tokenAccountPk
          )
          return account.found ? tokenAccountPk : null
        })
      )
    ).filter((x) => x !== null) as PublicKey[]

    const ix = await this.program.methods
      .updateVoterWeightRecord()
      .accountsStrict({
        voterWeightRecord: voterWeightPk,
        registrar: registrarPk,
      })
      .remainingAccounts(
        tokenAccounts.map((pubkey) => ({
          pubkey,
          isSigner: false,
          isWritable: false,
        }))
      )
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
    programId = new PublicKey(TOKEN_HAVER_PLUGIN),
    devnet = false
  ) {
    return new TokenHaverClient(
      new Program<TokenHaver>(IDL, programId, provider),
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
