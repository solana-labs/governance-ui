import type { PublicKey } from '@solana/web3.js';

export function abbreviateAddress(address: PublicKey | string, size = 5) {
  const base58 = typeof address === 'string' ? address : address.toBase58();
  return base58.slice(0, size) + '…' + base58.slice(-size);
}
