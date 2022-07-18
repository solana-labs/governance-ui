import { Cluster } from '@blockworks-foundation/mango-client';
import { EndpointTypes } from '@models/types';
import { utils } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  createAndInitializeMango,
  MangoDepository,
  UXDClient,
} from '@uxd-protocol/uxd-client';

export const DEPOSITORY_MINTS = {
  devnet: {
    BTC: {
      address: new PublicKey('3UNBZ6o52WTWwjac2kPUb4FyodhU1vFkRJheu1Sh2TvU'),
      decimals: 6,
    },
    SOL: {
      address: new PublicKey('So11111111111111111111111111111111111111112'),
      decimals: 9,
    },
  },
  mainnet: {
    BTC: {
      address: new PublicKey('9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E'),
      decimals: 6,
    },
    SOL: {
      address: new PublicKey('So11111111111111111111111111111111111111112'),
      decimals: 9,
    },
    MSOL: {
      address: new PublicKey('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So'),
      decimals: 6,
    },
    ETH: {
      address: new PublicKey('2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk'),
      decimals: 6,
    },
  },
};

export const INSURANCE_MINTS = {
  devnet: {
    USDC: {
      address: new PublicKey('8FRFC6MoGGkMFQwngccyu69VnYbzykGeez7ignHVAFSN'),
      decimals: 6,
    },
  },
  mainnet: {
    USDC: {
      address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
      decimals: 6,
    },
  },
};

export const GOVERNANCE_MINTS = {
  mainnet: {
    USDC: {
      address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
      decimals: 6,
    },
    UXP: {
      address: new PublicKey('UXPhBoR3qG4UCiGNJfV7MqhHyFqKN68g45GoYvAeL2M'),
      decimals: 9,
    },
  },
};

export const getDepositoryMintSymbols = (cluster: Cluster): string[] => [
  ...Object.keys(DEPOSITORY_MINTS[cluster]),
];
export const getDepositoryMintInfo = (
  cluster: Cluster,
  symbol: string,
): {
  address: PublicKey;
  decimals: number;
} => DEPOSITORY_MINTS[cluster][symbol];

export const getDepositoryMintKey = (
  cluster: Cluster,
  symbol: string,
): PublicKey => DEPOSITORY_MINTS[cluster][symbol].address;

export const getDepositoryToken = (cluster: Cluster, symbol: string) =>
  DEPOSITORY_MINTS[cluster][symbol];

export const getInsuranceMintSymbols = (cluster: Cluster): string[] => [
  ...Object.keys(INSURANCE_MINTS[cluster]),
];

export const getInsuranceMintInfo = (
  cluster: Cluster,
  symbol: string,
): {
  address: PublicKey;
  decimals: number;
} => INSURANCE_MINTS[cluster][symbol];

export const getInsuranceMintKey = (
  cluster: Cluster,
  symbol: string,
): PublicKey => INSURANCE_MINTS[cluster][symbol].address;

export const getGovernanceMintSymbols = (cluster: Cluster): string[] => [
  ...Object.keys(GOVERNANCE_MINTS[cluster]),
];

export const getGovernanceMintKey = (
  cluster: Cluster,
  symbol: string,
): PublicKey => GOVERNANCE_MINTS[cluster][symbol].address;

export const getGovernanceToken = (cluster: Cluster, symbol: string) =>
  GOVERNANCE_MINTS[cluster][symbol];

export const uxdClient = (programId: PublicKey): UXDClient => {
  return new UXDClient(programId);
};

export const initializeMango = async (
  connection: Connection,
  cluster: EndpointTypes,
) => {
  return createAndInitializeMango(connection, cluster);
};

export const getControllerPda = (uxdProgramId: PublicKey): PublicKey => {
  return utils.publicKey.findProgramAddressSync(
    [Buffer.from('CONTROLLER')],
    uxdProgramId,
  )[0];
};

// We do not need the decimals and names for both depository and insurance
// in order to register a new mango depository
// we just set placeholder values
export const instantiateMangoDepository = ({
  uxdProgramId,
  depositoryMint,
  insuranceMint,
  depositoryName,
  depositoryDecimals,
  insuranceName,
  insuranceDecimals,
}: {
  uxdProgramId: PublicKey;
  depositoryMint: PublicKey;
  insuranceMint: PublicKey;
  depositoryName: string;
  depositoryDecimals: number;
  insuranceName: string;
  insuranceDecimals: number;
}): MangoDepository => {
  return new MangoDepository(
    depositoryMint,
    depositoryName,
    depositoryDecimals,
    insuranceMint,
    insuranceName,
    insuranceDecimals,
    uxdProgramId,
  );
};
