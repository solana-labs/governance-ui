import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { Connection, PublicKey } from '@solana/web3.js';
import { SPL_TOKENS } from '@utils/splTokens';
import { augmentedProvider } from '../augmentedProvider';
import ATribecaConfiguration, {
  TribecaPrograms,
} from './ATribecaConfiguration';

class SaberTribecaConfiguration extends ATribecaConfiguration {
  public readonly locker = new PublicKey(
    '8erad8kmNrLJDJPe9UkmTHomrMV3EW48sjGeECyVjbYX',
  );

  public readonly token = SPL_TOKENS.SBR;
  public readonly name = 'Saber';
}

class SunnyTribecaConfiguration extends ATribecaConfiguration {
  public readonly locker = new PublicKey(
    '4tr9CDSgZRLYPGdcsm9PztaGSfJtX5CEmqDbEbvCTX2G',
  );

  public readonly token = SPL_TOKENS.SUNNY;
  public readonly name = 'Sunny';
}

export const saberTribecaConfiguration = new SaberTribecaConfiguration();
export const sunnyTribecaConfiguration = new SunnyTribecaConfiguration();

export const configurations = {
  saber: saberTribecaConfiguration,
  sunny: sunnyTribecaConfiguration,
};

export function getConfigurationByName(
  name: string,
): ATribecaConfiguration | null {
  return (
    Object.values(configurations).find(
      (configuration) => configuration.name === name,
    ) ?? null
  );
}

export function getTribecaPrograms({
  connection,
  wallet,
  config,
}: {
  connection: Connection;
  wallet: SignerWalletAdapter;
  config: ATribecaConfiguration;
}) {
  return config.loadPrograms(augmentedProvider(connection, wallet));
}

export async function getTribecaLocker({
  programs,
  config,
}: {
  programs: TribecaPrograms;
  config: ATribecaConfiguration;
}) {
  return programs.LockedVoter.account.locker.fetch(config.locker);
}
