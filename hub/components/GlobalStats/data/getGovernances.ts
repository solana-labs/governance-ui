import { getAllGovernances } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';

import type { Logger } from '../Logs';

export async function getGovernances(
  connnection: Connection,
  logger: Logger,
  programId: PublicKey,
  realm: PublicKey,
): Promise<PublicKey[]> {
  const governances = await getAllGovernances(connnection, programId, realm);
  return governances.map((g) => g.pubkey);
}
