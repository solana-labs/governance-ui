import { PublicKey } from '@solana/web3.js'

// Add new pool name here, example: 'Credora' | 'Foo';
export type PoolName = 'Credora'

export type Pools = {
  [key in PoolName]: PublicKey
}

export const pools: Pools = {
  Credora: new PublicKey('TamdAwg85s9aZ6mwSeAHoczzAV53rFokL5FVKzaF1Tb'),

  // Add new pool infos here ...
}
