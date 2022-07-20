import {
  ConnectedVoltSDK,
  FriktionSDK,
  FriktionSnapshot,
  VoltSnapshot,
} from '@friktion-labs/friktion-sdk';
import { Wallet } from '@project-serum/sol-wallet-adapter';
import { Connection, PublicKey } from '@solana/web3.js';

export const FRIKTION_VOLT_PROGRAM =
  'VoLT1mJz1sbnxwq5Fv2SXjdVDgPXrb9tJyC8WpMDkSp';

const FRIKTION_SNAPSHOT_URL =
  'https://friktion-labs.github.io/mainnet-tvl-snapshots/friktionSnapshot.json';

const ALLOWED_VAULTS = [
  '9cHT8d7d35ngj5i8WBZB8ibjnPLnvnym4tp4KoTCQtxw', // SOL-UXD vault
  '2yPs4YTdMzuKmYeubfNqH2xxgdEkXMxVcFWnAFbsojS2', // Funding Rate vault -> for some reason this one does not load like the others
];

const VOLT_TYPES = {
  1: 'Generate Income',
  2: 'Sustainable Stables',
  3: 'Crab Strategy',
  4: 'Basis Yield',
};

type VoltState = {
  pendingDeposit: string;
  pendingWithdrawal: string;
  deposited: string;
  claimable: string;
  tokenPrice: string;
};

export type VoltData = VoltSnapshot & VoltState;

export type VoltList = {
  [vaultLabel: string]: VoltData;
};

export const buildVoltSDK = async ({
  connection,
  wallet,
  voltVaultId,
  governancePubkey,
}: {
  connection: Connection;
  wallet: Wallet;
  voltVaultId: string;
  governancePubkey: PublicKey;
}) => {
  const sdk = new FriktionSDK({
    provider: {
      connection,
      wallet,
    },
  });

  return new ConnectedVoltSDK(
    connection,
    wallet.publicKey,
    await sdk.loadVoltAndExtraDataByKey(new PublicKey(voltVaultId)),
    governancePubkey,
  );
};

export const fetchVoltsSnapshot = async () => {
  const response = await fetch(FRIKTION_SNAPSHOT_URL);
  const parsedResponse = (await response.json()) as FriktionSnapshot;
  return parsedResponse.allMainnetVolts as VoltSnapshot[];
};

export const createLabel = (
  voltType: number,
  depositTokenSymbol: string,
  underlyingTokenSymbol: string,
): string =>
  `Volt #${voltType} - ${VOLT_TYPES[voltType]} - ${depositTokenSymbol} / ${underlyingTokenSymbol}`;

const formatVoltListFromSnapshot = (volts: VoltSnapshot[]): VoltList =>
  volts.reduce((list, snap) => {
    if (
      !snap.voltVaultId ||
      !Object.keys(VOLT_TYPES).includes(snap.voltType.toString())
    )
      return list;
    const label = createLabel(
      snap.voltType,
      snap.depositTokenSymbol,
      snap.underlyingTokenSymbol,
    );
    return { ...list, [label]: { ...snap } };
  }, {});

const filterAllowedVolts = (list: VoltSnapshot[], allowedVoltIds: string[]) =>
  list.filter((v) => allowedVoltIds.includes(v.voltVaultId));

const fetchVoltRound = async ({
  connection,
  wallet,
  governancePubkey,
  voltVaultId,
}: {
  connection: Connection;
  wallet: Wallet;
  governancePubkey: PublicKey;
  voltVaultId: string;
  tokenDecimals: number;
}): Promise<VoltState> => {
  const cVoltSDK = await buildVoltSDK({
    connection,
    wallet,
    voltVaultId,
    governancePubkey,
  });
  const balances = await cVoltSDK.getBalancesForUser(governancePubkey);
  const epochInfo = await cVoltSDK.getCurrentEpochInfo();

  return {
    pendingDeposit: balances?.pendingDeposits.toString() ?? '0',
    pendingWithdrawal: balances?.pendingWithdrawals.toString() ?? '0',
    deposited: balances?.totalBalance.toString() ?? '0',
    claimable: balances?.claimableUnderlying.toString() ?? '0',
    tokenPrice: (epochInfo.vaultTokenPrice as string) ?? '0',
  };
};

const getVoltStatus = async ({
  connection,
  wallet,
  governancePubkey,
  volt,
}: {
  connection: Connection;
  wallet: Wallet;
  governancePubkey: PublicKey;
  volt: VoltSnapshot;
}): Promise<VoltData> => {
  const state = await fetchVoltRound({
    connection,
    wallet,
    governancePubkey,
    voltVaultId: volt.voltVaultId,
    tokenDecimals: volt.shareTokenDecimals,
  });
  return { ...volt, ...state };
};

const getAllVoltsStatus = async ({
  connection,
  wallet,
  governancePubkey,
  volts,
}: {
  connection: Connection;
  wallet: Wallet;
  governancePubkey: PublicKey;
  volts: VoltSnapshot[];
}) =>
  Promise.all(
    volts.map((volt) =>
      getVoltStatus({ connection, wallet, governancePubkey, volt }),
    ),
  );

export const fetchVoltList = async () =>
  filterAllowedVolts(await fetchVoltsSnapshot(), ALLOWED_VAULTS);

export const getVolts = async ({
  connection,
  wallet,
  governancePubkey,
}: {
  connection: Connection;
  wallet: Wallet;
  governancePubkey: PublicKey;
}) =>
  formatVoltListFromSnapshot(
    await getAllVoltsStatus({
      connection,
      wallet,
      governancePubkey,
      volts: await fetchVoltList(),
    }),
  );
