import { nu64, struct, u8 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import quarryMineConfiguration from '@tools/sdk/quarryMine/configuration';
import { tryGetTokenMint } from '@utils/tokens';
import { ANCHOR_DISCRIMINATOR_LAYOUT } from '@utils/helpers';
import { nativeAmountToFormattedUiAmount } from '@tools/sdk/units';

export const QUARRY_MINE_PROGRAM_INSTRUCTIONS = {
  [quarryMineConfiguration.quarryMineProgram.toBase58()]: {
    [quarryMineConfiguration.quarryMineProgramInstructions.createMiner]: {
      name: 'Quarry Mine - Create Miner',
      accounts: [
        'Authority',
        'Miner',
        'Quarry',
        'Rewarder',
        'System Program',
        'Payer',
        'Token Mint',
        'Miner Vault',
        'Token Program',
      ],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        return null;
      },
    },

    [quarryMineConfiguration.quarryMineProgramInstructions.stakeTokens]: {
      name: 'Quarry Mine - Stake Tokens',
      accounts: [
        'Authority',
        'Miner',
        'Quarry',
        'Miner Vault',
        'Token Account',
        'Token Program',
        'Rewarder',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const sourceAccount = accounts[4].pubkey;

        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('amount'),
        ]);

        const { amount } = dataLayout.decode(Buffer.from(data)) as any;

        const mintInfo = await tryGetTokenMint(connection, sourceAccount);

        if (!mintInfo) throw new Error('Cannot load source account mint info');

        const uiAmount = nativeAmountToFormattedUiAmount(
          amount,
          mintInfo.account.decimals,
        );

        return (
          <div className="flex flex-col">
            <div className="flex">
              <span>Amount:</span>
              <span>{uiAmount}</span>
            </div>
          </div>
        );
      },
    },

    [quarryMineConfiguration.quarryMineProgramInstructions.withdraw]: {
      name: 'Quarry Mine - Withdraw',
      accounts: [
        'Authority',
        'Miner',
        'Quarry',
        'Miner Vault',
        'Token Account',
        'Token Program',
        'Rewarder',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const destinationAccount = accounts[4].pubkey;

        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('amount'),
        ]);

        const { amount } = dataLayout.decode(Buffer.from(data)) as any;

        const mintInfo = await tryGetTokenMint(connection, destinationAccount);

        if (!mintInfo)
          throw new Error('Cannot load destination account mint info');

        const uiAmount = nativeAmountToFormattedUiAmount(
          amount,
          mintInfo.account.decimals,
        );

        return (
          <div className="flex flex-col">
            <div className="flex">
              <span>Amount:</span>
              <span>{uiAmount}</span>
            </div>
          </div>
        );
      },
    },

    [quarryMineConfiguration.quarryMineProgramInstructions.claimRewards]: {
      name: 'Quarry Mine - Claim Rewards',
      accounts: [
        'Mint Wrapper',
        'Mint Wrapper Program',
        'Minter',
        'Rewards Token Mint',
        'Rewards Token Account',
        'Claim Fee Token Account',
        'Authority',
        'Miner',
        'Quarry',
        'Unused Miner Vault',
        'Unused Token Account',
        'Token Program',
        'Rewarder',
      ],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        return null;
      },
    },
  },
};
