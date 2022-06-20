import { PublicKey } from '@solana/web3.js';
import solendConfiguration, {
  SupportedCollateralMintName as SolendSupportedCollateralMintName,
} from '@tools/sdk/solend/configuration';
import { abbreviateAddress } from './formatting';

export type SplTokenInformation = {
  name: string;
  mint: PublicKey;
  decimals: number;
};

export type SupportedSplTokenNames =
  | 'USDC'
  | 'USDT'
  | 'WSOL'
  | 'UXP'
  | 'UXD'
  | 'SBR'
  | 'SUNNY'
  | 'B30UXP'
  | 'Saber UXD-USDC LP'
  | 'Saber IOU Token'
  | 'Lifinity UXD-USDC LP'
  | SolendSupportedCollateralMintName;

export const SPL_TOKENS: {
  [key in SupportedSplTokenNames]: SplTokenInformation;
} = {
  USDC: {
    name: 'USD Coin',
    mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    decimals: 6,
  },

  USDT: {
    name: 'USDT',
    mint: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
    decimals: 6,
  },

  WSOL: {
    name: 'Wrapped SOL',
    mint: new PublicKey('So11111111111111111111111111111111111111112'),
    decimals: 9,
  },

  UXD: {
    name: 'UXD',
    mint: new PublicKey('7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT'),
    decimals: 6,
  },

  UXP: {
    name: 'UXP',
    mint: new PublicKey('UXPhBoR3qG4UCiGNJfV7MqhHyFqKN68g45GoYvAeL2M'),
    decimals: 9,
  },

  SBR: {
    name: 'SBR',
    mint: new PublicKey('Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1'),
    decimals: 6,
  },

  SUNNY: {
    name: 'SUNNY',
    mint: new PublicKey('SUNNYWgPQmFxe9wTZzNK7iPnJ3vYDrkgnxJRJm1s3ag'),
    decimals: 6,
  },

  B30UXP: {
    name: 'b30UXP (Socean Bonded Tokens)',
    mint: new PublicKey('CUP73GUagMSSbT1T3MUqyXGyWCu1rgUPPYVBYdEpPCQF'),
    decimals: 9,
  },

  'Saber UXD-USDC LP': {
    name: 'Saber UXD-USDC LP',
    mint: new PublicKey('UXDgmqLd1roNYkC4TmJzok61qcM9oKs5foDADiFoCiJ'),
    decimals: 6,
  },

  'Saber IOU Token': {
    name: 'SBR - Saber IOU Token (Liquidity Mining Rewards)',
    mint: new PublicKey('iouQcQBAiEXe6cKLS85zmZxUqaCqBdeHFpqKoSz615u'),
    decimals: 6,
  },
  'Lifinity UXD-USDC LP': {
    name: 'Lifinity UXD-USDC LP',
    mint: new PublicKey('DM2Grhnear76DwNiRUSfeiFMt6jSj2op9GWinQDc7Yqh'),
    decimals: 6,
  },

  ...solendConfiguration.getSupportedCollateralMintsInformation(),
} as const;

export type SplTokenUIName = typeof SPL_TOKENS[keyof typeof SPL_TOKENS]['name'];

export function getSplTokenNameByMint(mint: PublicKey): string {
  return (
    Object.values(SPL_TOKENS).find(
      (splToken) => splToken.mint.toBase58() === mint.toBase58(),
    )?.name ?? abbreviateAddress(mint)
  );
}

export function getSplTokenInformationByUIName(
  nameToMatch: SplTokenUIName,
): SplTokenInformation {
  const item = Object.entries(SPL_TOKENS).find(
    ([_, { name }]) => name === nameToMatch,
  );

  // theoretically impossible case
  if (!item) {
    throw new Error('Unable to find SPL token mint address by UI name');
  }

  return item[1];
}

export function getSplTokenMintAddressByUIName(
  nameToMatch: SplTokenUIName,
): PublicKey {
  const { mint } = getSplTokenInformationByUIName(nameToMatch);

  return mint;
}
