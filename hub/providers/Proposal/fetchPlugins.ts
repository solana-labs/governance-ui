import { AnchorProvider, Wallet } from '@project-serum/anchor';
import {
  NftVoterClient,
  GatewayClient,
} from '@solana/governance-program-library';
import { Connection, PublicKey } from '@solana/web3.js';

import { PythClient } from 'pyth-staking-api';
import { VsrClient } from 'VoteStakeRegistry/sdk/client';

import { SwitchboardQueueVoterClient } from '../../../SwitchboardVotePlugin/SwitchboardQueueVoterClient';

export async function fetchPlugins(
  connection: Connection,
  programPublicKey: PublicKey,
  wallet: Wallet,
  isDevnet?: boolean,
) {
  const defaultOptions = AnchorProvider.defaultOptions();

  const anchorProvider = new AnchorProvider(connection, wallet, defaultOptions);

  const [
    vsrClient,
    nftClient,
    gatewayClient,
    switchboardClient,
    pythClient,
  ] = await Promise.all([
    VsrClient.connect(anchorProvider, programPublicKey, isDevnet),
    NftVoterClient.connect(anchorProvider, isDevnet),
    GatewayClient.connect(anchorProvider, isDevnet),
    SwitchboardQueueVoterClient.connect(anchorProvider, isDevnet),
    PythClient.connect(anchorProvider, connection.rpcEndpoint),
  ]);

  return {
    vsrClient,
    nftClient,
    gatewayClient,
    switchboardClient,
    pythClient,
  };
}
