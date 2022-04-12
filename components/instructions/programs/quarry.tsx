import BigNumber from 'bignumber.js';
import { nu64, struct, u8 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import quarryMineConfiguration from '@tools/sdk/quarryMine/configuration';
import { tryGetTokenMint } from '@utils/tokens';

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
        accounts: AccountMetaData[],
      ) => {
        const owner = accounts[0].pubkey.toString();
        const miner = accounts[1].pubkey.toString();
        const quarry = accounts[2].pubkey.toString();
        const rewarder = accounts[3].pubkey.toString();
        const payer = accounts[5].pubkey.toString();
        const tokenMint = accounts[6].pubkey.toString();
        const minerVault = accounts[7].pubkey.toString();

        return (
          <div className="flex flex-col">
            <div className="flex">
              <span>Owner:</span>
              <span>{owner}</span>
            </div>

            <div className="flex">
              <span>Miner:</span>
              <span>{miner}</span>
            </div>

            <div className="flex">
              <span>Quarry:</span>
              <span>{quarry}</span>
            </div>

            <div className="flex">
              <span>Rewarder:</span>
              <span>{rewarder}</span>
            </div>

            <div className="flex">
              <span>Payer:</span>
              <span>{payer}</span>
            </div>

            <div className="flex">
              <span>Token Mint:</span>
              <span>{tokenMint}</span>
            </div>

            <div className="flex">
              <span>Miner Vault:</span>
              <span>{minerVault}</span>
            </div>
          </div>
        );
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
        const owner = accounts[0].pubkey.toString();
        const miner = accounts[1].pubkey.toString();
        const quarry = accounts[2].pubkey.toString();
        const minerVault = accounts[3].pubkey.toString();
        const sourceAccount = accounts[4].pubkey;
        const rewarder = accounts[6].pubkey.toString();

        const dataLayout = struct([
          u8('instruction'),

          // ignore 7 bytes
          ...Array.from(new Array(7)).map(u8),

          nu64('amount'),
        ]);

        const { amount } = dataLayout.decode(Buffer.from(data)) as any;

        const mintInfo = await tryGetTokenMint(connection, sourceAccount);

        if (!mintInfo) throw new Error('Cannot load source account mint info');

        const uiAmount = Number(
          new BigNumber(amount)
            .shiftedBy(-mintInfo.account.decimals)
            .toString(),
        ).toLocaleString();

        return (
          <div className="flex flex-col">
            <div className="flex">
              <span>Owner:</span>
              <span>{owner}</span>
            </div>

            <div className="flex">
              <span>Miner:</span>
              <span>{miner}</span>
            </div>

            <div className="flex">
              <span>Quarry:</span>
              <span>{quarry}</span>
            </div>

            <div className="flex">
              <span>Miner Vault:</span>
              <span>{minerVault}</span>
            </div>

            <div className="flex">
              <span>Source Account:</span>
              <span>{sourceAccount.toString()}</span>
            </div>

            <div className="flex">
              <span>Rewarder:</span>
              <span>{rewarder}</span>
            </div>

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
        const owner = accounts[0].pubkey.toString();
        const miner = accounts[1].pubkey.toString();
        const quarry = accounts[2].pubkey.toString();
        const minerVault = accounts[3].pubkey.toString();
        const destinationAccount = accounts[4].pubkey;
        const rewarder = accounts[6].pubkey.toString();

        const dataLayout = struct([
          u8('instruction'),

          // ignore 7 bytes
          ...Array.from(new Array(7)).map(u8),

          nu64('amount'),
        ]);

        const { amount } = dataLayout.decode(Buffer.from(data)) as any;

        const mintInfo = await tryGetTokenMint(connection, destinationAccount);

        if (!mintInfo)
          throw new Error('Cannot load destination account mint info');

        const uiAmount = Number(
          new BigNumber(amount)
            .shiftedBy(-mintInfo.account.decimals)
            .toString(),
        ).toLocaleString();

        return (
          <div className="flex flex-col">
            <div className="flex">
              <span>Owner:</span>
              <span>{owner}</span>
            </div>

            <div className="flex">
              <span>Miner:</span>
              <span>{miner}</span>
            </div>

            <div className="flex">
              <span>Quarry:</span>
              <span>{quarry}</span>
            </div>

            <div className="flex">
              <span>Miner Vault:</span>
              <span>{minerVault}</span>
            </div>

            <div className="flex">
              <span>Destination Account:</span>
              <span>{destinationAccount.toString()}</span>
            </div>

            <div className="flex">
              <span>Rewarder:</span>
              <span>{rewarder}</span>
            </div>

            <div className="flex">
              <span>Amount:</span>
              <span>{uiAmount}</span>
            </div>
          </div>
        );
      },
    },

    [quarryMineConfiguration.quarryMineProgramInstructions.claimRewards]: {
      name: 'Quarry Mine - Create Miner',
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
        accounts: AccountMetaData[],
      ) => {
        const mintWrapper = accounts[0].pubkey.toString();
        const mintWrapperProgram = accounts[1].pubkey.toString();
        const minter = accounts[2].pubkey.toString();
        const rewardsTokenMint = accounts[3].pubkey.toString();
        const rewardsTokenAccount = accounts[4].pubkey.toString();
        const claimFeeTokenAccount = accounts[5].pubkey.toString();
        const owner = accounts[6].pubkey.toString();
        const miner = accounts[7].pubkey.toString();
        const quarry = accounts[8].pubkey.toString();
        const rewarder = accounts[12].pubkey.toString();

        return (
          <div className="flex flex-col">
            <div className="flex">
              <span>Mint Wrapper:</span>
              <span>{mintWrapper}</span>
            </div>

            <div className="flex">
              <span>Mint Wrapper Program:</span>
              <span>{mintWrapperProgram}</span>
            </div>

            <div className="flex">
              <span>Minter:</span>
              <span>{minter}</span>
            </div>

            <div className="flex">
              <span>Rewards Token Mint:</span>
              <span>{rewardsTokenMint}</span>
            </div>

            <div className="flex">
              <span>Rewards Token Account:</span>
              <span>{rewardsTokenAccount}</span>
            </div>

            <div className="flex">
              <span>Claim Fee Token Account:</span>
              <span>{claimFeeTokenAccount}</span>
            </div>

            <div className="flex">
              <span>Owner:</span>
              <span>{owner}</span>
            </div>

            <div className="flex">
              <span>Miner:</span>
              <span>{miner}</span>
            </div>

            <div className="flex">
              <span>Quarry:</span>
              <span>{quarry}</span>
            </div>

            <div className="flex">
              <span>Rewarder:</span>
              <span>{rewarder}</span>
            </div>
          </div>
        );
      },
    },
  },
};
