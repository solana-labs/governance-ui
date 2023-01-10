import { Program, Provider } from '@coral-xyz/anchor'
import { PublicKey, Transaction } from '@solana/web3.js'
import { Switchboard, IDL } from './SwitchboardIdl'
//import { NftVoter, IDL } from './nft_voter';

export const SWITCHBOARD_ID = new PublicKey(
  '7PMP6yE6qb3XzBQr5TK2GhuruYayZzBnT8U92ySaLESC'
)

export const SWITCHBOARD_ADDIN_ID = new PublicKey(
  'B4EDDdMh5CmB6B9DeMmZmFvRzEgyHR5zWktf6httcMk6'
)

export const SWITCHBOARD_GRANT_AUTHORITY = new PublicKey(
  '5wD32vPTeBk3UJfTCQUpa4KbrHZ5xxc8f4eLnqTPNW8L'
)

export const SWITCHBOARD_REVOKE_AUTHORITY = new PublicKey(
  '9rkK8T8wnYXZ1SSC6g2ZhbnyL5K5v546XSbNJv7og87b'
)

export const QUEUE_LIST: PublicKey[] = [
  new PublicKey('7QN4mJo9U58XMeHEyfY6ckKxAkVLkqVtcWjwgNU6xaE'),
]

export class SwitchboardQueueVoterClient {
  constructor(public program: Program<Switchboard>, public devnet?: boolean) {}

  static async connect(
    provider: Provider,
    devnet?: boolean
  ): Promise<SwitchboardQueueVoterClient> {
    // alternatively we could fetch from chain
    // const idl = await Program.fetchIdl(VSR_ID, provider);
    const idl = IDL

    return new SwitchboardQueueVoterClient(
      new Program<Switchboard>(idl as Switchboard, SWITCHBOARD_ID, provider),
      devnet
    )
  }
}

export async function grantPermissionTx(
  program: Program,
  grantAuthority: PublicKey,
  switchboardProgram: PublicKey,
  permission: PublicKey
): Promise<Transaction> {
  const [addinState] = await PublicKey.findProgramAddress(
    [Buffer.from('state')],
    program.programId
  )

  return await program.methods
    .grantPermission()
    .accounts({
      state: addinState,
      grantAuthority: grantAuthority,
      switchboardProgram: switchboardProgram,
      permission: permission,
    })
    .transaction()
}

export async function revokePermissionTx(
  program: Program,
  revokeAuthority: PublicKey,
  switchboardProgram: PublicKey,
  permission: PublicKey
): Promise<Transaction> {
  const [addinState] = await PublicKey.findProgramAddress(
    [Buffer.from('state')],
    program.programId
  )

  return await program.methods
    .revokePermission()
    .accounts({
      state: addinState,
      revokeAuthority: revokeAuthority,
      switchboardProgram: switchboardProgram,
      permission: permission,
    })
    .transaction()
}
