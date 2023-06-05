import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { GatewayClient } from '@solana/governance-program-library';
import { Connection, PublicKey } from '@solana/web3.js';

import { PythClient } from 'pyth-staking-api';
import { VsrClient } from 'VoteStakeRegistry/sdk/client';

import { NftVoterClient } from '@utils/uiTypes/NftVoterClient';

/** @deprecated */
export async function fetchPlugins(
  connection: Connection,
  pluginProgram: PublicKey,
  wallet: Wallet,
  isDevnet?: boolean,
) {
  const defaultOptions = AnchorProvider.defaultOptions();
  const anchorProvider = new AnchorProvider(connection, wallet, defaultOptions);

  const [vsrClient, nftClient, gatewayClient, pythClient] = await Promise.all([
    VsrClient.connect(anchorProvider, pluginProgram, isDevnet),
    NftVoterClient.connect(anchorProvider, isDevnet),
    GatewayClient.connect(anchorProvider, isDevnet),
    PythClient.connect(anchorProvider, connection.rpcEndpoint),
  ]);

  return {
    vsrClient,
    nftClient,
    gatewayClient,
    pythClient,
  };
}
