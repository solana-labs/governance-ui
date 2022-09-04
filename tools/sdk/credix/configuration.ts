import { CredixClient } from '@credix/credix-client';
import { Wallet } from '@marinade.finance/marinade-ts-sdk';
import { Connection, PublicKey } from '@solana/web3.js';

export class CredixConfiguration {
  public static readonly credixProgramId = new PublicKey(
    'CRDx2YkdtYtGZXGHZ59wNv1EwKHQndnRc1gT4p8i2vPX',
  );

  public static readonly instructionsCode = {
    deposit: 202,
    withdraw: 241,
  };

  public getClient({
    connection,
    wallet,
  }: {
    connection: Connection;
    wallet: Wallet;
  }): CredixClient {
    return new CredixClient(connection, wallet, {
      programId: CredixConfiguration.credixProgramId,
    });
  }
}

export default new CredixConfiguration();
