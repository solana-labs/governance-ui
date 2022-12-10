import { getAllGovernances } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';
import { gql, request } from 'graphql-request';

import type { Logger } from '../Logs';
import { HOLAPLEX_GRAPQL_URL_MAINNET } from '@tools/constants';

const getGovernancesQuery = gql`
  query($realm: PublicKey!) {
    governances(realms: [$realm]) {
      address
    }
  }
`;

export async function getGovernances(
  connnection: Connection,
  logger: Logger,
  programId: PublicKey,
  realm: PublicKey,
): Promise<PublicKey[]> {
  try {
    const resp = await request(
      HOLAPLEX_GRAPQL_URL_MAINNET,
      getGovernancesQuery,
      { realm },
    );

    if (!resp.governances || resp.governances.length === 0) {
      logger.warn(
        `Could not find any governances for ${realm.toBase58()} using Holaplex. Will double check using the RPC`,
      );
    } else {
      return resp.governances.map((g: any) => new PublicKey(g.address));
    }
  } catch (e) {
    logger.error(
      `Failed to fetch governances for ${realm.toBase58()} using Holaplex, will try using RPC`,
    );
  }

  const governances = await getAllGovernances(connnection, programId, realm);
  return governances.map((g) => g.pubkey);
}
