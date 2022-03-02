import { Borsh } from '@metaplex-foundation/mpl-core';

export class MintArgs extends Borsh.Data<{
    name: string;
    symbol: string;
    uri: string;
  }> {
    static readonly SCHEMA = this.struct([
      ['instruction', 'u8'],
      ['name', 'string'],
      ['symbol', 'string'],
      ['uri', 'string']
    ]);
  
    instruction = 0;
    name: string;
    symbol: string;
    uri: string;
  }