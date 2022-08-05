import type { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { ProgramAccount, Realm } from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import { RpcContext } from '@solana/spl-governance'

import { RealmInfo, getProgramVersionForRealm } from '@models/registry/api'
import { voteRegistryDepositWithoutLockup } from 'VoteStakeRegistry/actions/voteRegistryDepositWithoutLockup'
import { TokenAccount, TokenProgramAccount } from '@utils/tokens'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'

interface Args {
  client?: VsrClient
  connection: Connection
  endpoint: string
  tokenOwnerRecordPk: PublicKey | null
  realm: ProgramAccount<Realm>
  realmInfo: RealmInfo
  realmTokenAccount: TokenProgramAccount<TokenAccount>
  wallet: SignerWalletAdapter
}

export default async function depositTokensVSR({
  client,
  connection,
  endpoint,
  tokenOwnerRecordPk,
  realm,
  realmInfo,
  realmTokenAccount,
  wallet,
}: Args) {
  const rpcContext = new RpcContext(
    realm.owner,
    getProgramVersionForRealm(realmInfo),
    wallet,
    connection,
    endpoint
  )

  await voteRegistryDepositWithoutLockup({
    client,
    rpcContext,
    tokenOwnerRecordPk,
    amount: realmTokenAccount.account.amount,
    communityMintPk: realm.account.communityMint,
    fromPk: realmTokenAccount.publicKey,
    mintPk: realm.account.communityMint,
    programId: realm.owner,
    realmPk: realm.pubkey,
  })
}
