import { AccountInfo, PublicKey } from '@solana/web3.js'
import { deserializeBorsh } from '../../utils/borsh'

import { Schema } from 'borsh'
import { ProgramAccount } from '@solana/spl-governance'

export function BorshAccountParser(
  classType: any,
  schema: Schema
): (pubKey: PublicKey, info: AccountInfo<Buffer>) => ProgramAccount<any> {
  return (pubKey: PublicKey, info: AccountInfo<Buffer>) => {
    const buffer = Buffer.from(info.data)
    const data = deserializeBorsh(schema, classType, buffer)

    return {
      pubkey: pubKey,
      owner: info.owner,
      account: data,
    } as ProgramAccount<any>
  }
}
