import { PublicKey } from '@solana/web3.js';
import {
  SABER_UXD_USDC_LP,
  SupportedMintName as QuarryMineSupportedMintName,
} from '../quarryMine/configuration';
import quarryMineConfiguration from '../quarryMine/configuration';

export type SupportedMintName = QuarryMineSupportedMintName;

class SaberPeriphery {
  public readonly mintSpecificAddresses: {
    [key in SupportedMintName]: {
      redemptionTokenMint: PublicKey;
      rewardsTokenMint: PublicKey;
    };
  } = {
    [SABER_UXD_USDC_LP]: {
      rewardsTokenMint:
        quarryMineConfiguration.mintSpecificAddresses[SABER_UXD_USDC_LP]
          .rewardsTokenMint,
      redemptionTokenMint: new PublicKey(
        'Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1',
      ),
    },
  };

  public readonly supportedMintNames: {
    [key in SupportedMintName]: true;
  } = quarryMineConfiguration.supportedMintNames;
}

export default new SaberPeriphery();
