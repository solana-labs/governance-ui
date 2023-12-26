import { GATEWAY_PLUGINS_PKS, NFT_PLUGINS_PKS } from '@constants/plugins';
import { AnchorProvider, Wallet } from '@project-serum/anchor';

import { GatewayClient } from '@solana/governance-program-library';
import {
  RealmConfig,
  RealmConfigAccount,
  getRealm,
  getRealmConfigAddress,
  ProgramAccount,
  GovernanceAccountParser,
  GoverningTokenType,
  GoverningTokenConfig,
} from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

import { tryGetNftRegistrar } from 'VoteStakeRegistry/sdk/api';

import { getNetworkFromEndpoint } from '@utils/connection';
import { getRegistrarPDA as getPluginRegistrarPDA } from '@utils/plugin/accounts';
import { tryGetRegistar as tryGetGatewayRegistrar } from '@utils/plugin/gateway';
import { parseMintAccountData, MintAccount } from '@utils/tokens';
import { NftVoterClient } from '@utils/uiTypes/NftVoterClient';

export interface Config {
  config: RealmConfig;
  configAccount: RealmConfigAccount;
  communityMint: {
    publicKey: PublicKey;
    account: MintAccount;
  };
  nftCollection?: PublicKey;
  nftCollectionSize: number;
  nftCollectionWeight: BN;
  realmAuthority?: PublicKey;
  civicPassType?: PublicKey;
}

export async function fetchConfig(
  connection: Connection,
  realmPublicKey: PublicKey,
  wallet: Pick<Wallet, 'publicKey' | 'signTransaction' | 'signAllTransactions'>,
): Promise<Config> {
  const realm = await getRealm(connection, realmPublicKey);

  const programPublicKey = realm.owner;

  const realmConfigPublicKey = await getRealmConfigAddress(
    programPublicKey,
    realmPublicKey,
  );

  const realmConfig = realm.account.config;
  const configAccountInfo = await connection.getAccountInfo(
    realmConfigPublicKey,
  );

  const configProgramAccount: ProgramAccount<RealmConfigAccount> = configAccountInfo
    ? GovernanceAccountParser(RealmConfigAccount)(
        realmConfigPublicKey,
        configAccountInfo,
      )
    : {
        pubkey: realmConfigPublicKey,
        owner: programPublicKey,
        account: new RealmConfigAccount({
          realm: realmPublicKey,
          communityTokenConfig: new GoverningTokenConfig({
            voterWeightAddin: undefined,
            maxVoterWeightAddin: undefined,
            tokenType: GoverningTokenType.Liquid,
            reserved: new Uint8Array(),
          }),
          councilTokenConfig: new GoverningTokenConfig({
            voterWeightAddin: undefined,
            maxVoterWeightAddin: undefined,
            tokenType: GoverningTokenType.Liquid,
            reserved: new Uint8Array(),
          }),
          reserved: new Uint8Array(),
        }),
      };

  let nftCollection: PublicKey | undefined = undefined;
  let nftCollectionSize = 0;
  let nftCollectionWeight = new BN(0);
  let civicPassType: PublicKey | undefined = undefined;
  const defaultOptions = AnchorProvider.defaultOptions();
  const anchorProvider = new AnchorProvider(connection, wallet, defaultOptions);

  const isDevnet = getNetworkFromEndpoint(connection.rpcEndpoint) === 'devnet';
  const nftClient = await NftVoterClient.connect(anchorProvider, isDevnet);
  const gatewayClient = await GatewayClient.connect(anchorProvider, isDevnet);
  const pluginPublicKey =
    configProgramAccount.account.communityTokenConfig.voterWeightAddin;

  if (pluginPublicKey && NFT_PLUGINS_PKS.includes(pluginPublicKey.toBase58())) {
    if (nftClient && realm.account.communityMint) {
      const programId = nftClient.program.programId;
      const registrarPDA = (
        await getPluginRegistrarPDA(
          realmPublicKey,
          realm.account.communityMint,
          programId,
        )
      ).registrar;

      const registrar: any = await tryGetNftRegistrar(registrarPDA, nftClient);

      const collections = registrar?.collectionConfigs || [];

      if (collections[0]) {
        nftCollection = new PublicKey(collections[0].collection);
        nftCollectionSize = collections[0].size;
        nftCollectionWeight = collections[0].weight;
      }
    }
  }

  if (
    pluginPublicKey &&
    GATEWAY_PLUGINS_PKS.includes(pluginPublicKey.toBase58())
  ) {
    if (gatewayClient && realm.account.communityMint) {
      const registrar = await tryGetGatewayRegistrar(realm, gatewayClient);
      civicPassType = registrar?.gatekeeperNetwork;
    }
  }

  const mintPkStr = realm.account.communityMint.toBase58();
  const communityMint = await fetch(connection.rpcEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: mintPkStr,
      method: 'getAccountInfo',
      params: [
        mintPkStr,
        {
          commitment: connection.commitment,
          encoding: 'base64',
        },
      ],
    }),
  })
    .then<{
      result: {
        context: {
          apiVersion: string;
          slot: number;
        };
        value: {
          data: any[];
          executable: boolean;
          lamports: number;
          owner: string;
          rentEpoch: number;
        };
      };
    }>((resp) => {
      return resp.json();
    })
    .then(({ result: { value } }) => {
      const publicKey = realm.account.communityMint;
      const data = Buffer.from(value.data[0], 'base64');
      const account = parseMintAccountData(data);
      return { publicKey, account };
    });

  return {
    communityMint,
    nftCollection,
    nftCollectionSize,
    nftCollectionWeight,
    civicPassType,
    config: realmConfig,
    configAccount: configProgramAccount.account,
    realmAuthority: realm.account.authority,
  };
}
