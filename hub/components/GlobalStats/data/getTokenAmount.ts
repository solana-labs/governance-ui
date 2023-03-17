import { AccountInfo } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { differenceInMinutes, minutesToMilliseconds } from 'date-fns';

import { TokenProgramAccount, getOwnedTokenAccounts } from '@utils/tokens';

interface CachedTokenAccounts {
  time: number;
  value: TokenProgramAccount<AccountInfo>[];
}

const tokenAmounts = new Map<string, CachedTokenAccounts>();

export async function getTokenAmount(
  connection: Connection,
  publicKey: PublicKey,
) {
  const cached = tokenAmounts.get(publicKey.toBase58());

  if (cached) {
    const now = Date.now();
    const timePassed = Math.abs(differenceInMinutes(cached.time, now));

    if (timePassed < minutesToMilliseconds(10)) {
      return cached.value;
    }
  }

  const value = await getOwnedTokenAccounts(connection, publicKey);
  tokenAmounts.set(publicKey.toBase58(), { value, time: Date.now() });
  return value;
}
