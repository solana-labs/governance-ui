import { Connection } from '@solana/web3.js';
import { nu64, struct, u32, u8 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import stakingConfiguration from '@tools/sdk/uxdProtocolStaking/configuration';
import { tryGetMint, tryGetTokenMint } from '@utils/tokens';
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units';
import { ANCHOR_DISCRIMINATOR_LAYOUT } from '@utils/helpers';

const config = {
  [stakingConfiguration.instructionCodes.initializeStakingCampaign]: {
    name: 'UXD Staking - Initialize Staking Campaign',
    accounts: [
      'Authority',
      'Payer',
      'Staking Campaign',
      'Reward Mint',
      'Staked Mint',
      'Reward Vault',
      'Staked Vault',
      'Authority Reward Ata',
      'System Program',
      'Token Program',
      'Associated Token Program',
      'Rent',
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array,
      accounts: AccountMetaData[],
    ) => {
      const dataLayout = struct([
        u8('instruction'),
        ...ANCHOR_DISCRIMINATOR_LAYOUT,
        nu64('startTs'),
        u8('optionEndTs'),
        ...(data.length === 33 ? [nu64('endTs')] : []),
        nu64('rewardDepositAmount'),
      ]);

      const rewardMint = accounts[3].pubkey;
      const stakedMint = accounts[4].pubkey;

      const mintInfo = await tryGetMint(connection, rewardMint);

      if (!mintInfo)
        throw new Error(`Cannot load mintInfo ${rewardMint.toBase58()}`);

      const args = dataLayout.decode(Buffer.from(data)) as any;

      const { startTs, endTs, rewardDepositAmount } = args;

      const startDate = new Date(Number(startTs) * 1000).toUTCString();
      const endDate = endTs
        ? new Date(Number(endTs) * 1000).toUTCString()
        : '-';

      const rewardDepositAmountUi = getMintDecimalAmountFromNatural(
        mintInfo.account,
        rewardDepositAmount,
      )
        .toNumber()
        .toLocaleString();

      return (
        <>
          <p>{`start of the campaign: ${startDate}`}</p>
          <p>{`end of the campaign: ${endDate}`}</p>
          <p>{`reward deposit amount: ${rewardDepositAmountUi}`}</p>
          <p>{`reward mint: ${rewardMint.toBase58()}`}</p>
          <p>{`staked mint: ${stakedMint.toBase58()}`}</p>
        </>
      );
    },
  },

  [stakingConfiguration.instructionCodes.addStakingOption]: {
    name: 'UXD Staking - Add Staking Options',
    accounts: ['Authority', 'Payer', 'Staking Campaign'],
    getDataUI: async (
      _connection: Connection,
      data: Uint8Array,
      _accounts: AccountMetaData[],
    ) => {
      // 12 Byte is the header that is always there
      // 16 bytes = 8 for lockupSecs, 8 for apr
      const nbOptions = (data.length - 12) / 16;

      const dataLayout = struct([
        u8('instruction'),
        ...ANCHOR_DISCRIMINATOR_LAYOUT,
        u32('nbOption'),

        ...Array.from(new Array(nbOptions)).reduce((acc, _, index) => {
          return [...acc, nu64(`lockupSecs${index}`), nu64(`apr${index}`)];
        }, []),
      ]);

      const args = dataLayout.decode(Buffer.from(data)) as any;

      return (
        <>
          {Array.from(new Array(nbOptions)).map((_, index) => {
            return (
              <>
                <p>{`option ${index + 1} lockup time in seconds: ${Number(
                  args[`lockupSecs${index}`],
                ).toLocaleString()}`}</p>

                <p>{`option ${index + 1} apr: ${
                  args[`apr${index}`] / (stakingConfiguration.APR_BASIS / 100)
                }%`}</p>
              </>
            );
          })}
        </>
      );
    },
  },

  [stakingConfiguration.instructionCodes.activateStakingOption]: {
    name: 'UXD Staking - Activate Staking Options',
    accounts: ['Authority', 'Payer', 'Staking Campaign'],
    getDataUI: async (
      _connection: Connection,
      data: Uint8Array,
      _accounts: AccountMetaData[],
    ) => {
      const dataLayout = struct([
        u8('instruction'),
        ...ANCHOR_DISCRIMINATOR_LAYOUT,
        u8('stakingOptionIdentifier'),
        u8('activate'),
      ]);

      const args = dataLayout.decode(Buffer.from(data)) as any;

      const { stakingOptionIdentifier, activate } = args;

      return (
        <>
          <p>{`staking option identifier: ${stakingOptionIdentifier.toString()}`}</p>
          <p>{`status: ${activate === 0 ? 'DEACTIVATE' : 'ACTIVATE'}`}</p>
        </>
      );
    },
  },

  [stakingConfiguration.instructionCodes.finalizeStakingCampaign]: {
    name: 'UXD Staking - Finalize Staking Campaign',
    accounts: [
      'Authority',
      'Payer',
      'Staking Campaign',
      'Reward Mint',
      'Reward Vault',
      'Authority Reward Ata',
      'System Program',
      'Token Program',
      'Associated Token Program',
      'Rent',
    ],
    getDataUI: async (
      _connection: Connection,
      _data: Uint8Array,
      _accounts: AccountMetaData[],
    ) => {
      return null;
    },
  },

  [stakingConfiguration.instructionCodes.refillRewardVault]: {
    name: 'UXD Staking - Refill Reward Vault',
    accounts: [
      'Authority',
      'Payer',
      'Staking Campaign',
      'Reward Vault',
      'Authority Reward Ata',
      'Token Program',
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array,
      accounts: AccountMetaData[],
    ) => {
      const dataLayout = struct([
        u8('instruction'),
        ...ANCHOR_DISCRIMINATOR_LAYOUT,
        nu64('rewardRefillAmount'),
      ]);

      const rewardVault = accounts[3].pubkey;

      const args = dataLayout.decode(Buffer.from(data)) as any;

      const mintInfo = await tryGetTokenMint(connection, rewardVault);

      if (!mintInfo)
        throw new Error(
          `Cannot load account mint info ${rewardVault.toBase58()}`,
        );

      const { rewardRefillAmount } = args;

      const rewardRefillAmountUi = getMintDecimalAmountFromNatural(
        mintInfo.account,
        rewardRefillAmount,
      )
        .toNumber()
        .toLocaleString();

      return (
        <>
          <p>{`reward refill amount: ${rewardRefillAmountUi}`}</p>
        </>
      );
    },
  },
};

export const UXD_PROTOCOL_STAKING_INSTRUCTIONS = {
  [stakingConfiguration.programId.devnet!.toBase58()]: config,
  [stakingConfiguration.programId.mainnet!.toBase58()]: config,
};
