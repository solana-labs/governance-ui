import BigNumber from 'bignumber.js';
import { nu64, struct, u8 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import saberPoolsConfiguration from '@tools/sdk/saberPools/configuration';

export const SABER_POOLS_PROGRAM_INSTRUCTIONS = {
  [saberPoolsConfiguration.saberStableSwapProgramId.toBase58()]: {
    [saberPoolsConfiguration.stableSwapInstructions.deposit]: {
      name: 'Saber Pools - Deposit',
      accounts: [
        'Swap Account',
        'Swap Account Authority',
        'Source A',
        'Source B',
        'Token Account A',
        'Token Account B',
        'Pool Token Mint',
        'Pool Token Amount',
        'Token Program Id',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const owner = accounts[2].pubkey.toString();
        const sourceA = accounts[3].pubkey.toString();
        const sourceB = accounts[4].pubkey.toString();
        const tokenAccountA = accounts[5].pubkey;
        const tokenAccountB = accounts[6].pubkey;

        const pool = saberPoolsConfiguration.getPoolByTokenAccounts(
          tokenAccountA,
          tokenAccountB,
        );

        if (!pool) {
          return <div>Unknown Pool</div>;
        }

        const dataLayout = struct([
          u8('instruction'),
          nu64('tokenAmountA'),
          nu64('tokenAmountB'),
          nu64('minimumPoolTokenAmount'),
        ]);

        const { tokenAmountA, tokenAmountB } = dataLayout.decode(
          Buffer.from(data),
        ) as any;

        const uiTokenAmountA = Number(
          new BigNumber(tokenAmountA)
            .shiftedBy(-pool.tokenAccountA.decimals)
            .toString(),
        ).toLocaleString();

        const uiTokenAmountB = Number(
          new BigNumber(tokenAmountB)
            .shiftedBy(-pool.tokenAccountB.decimals)
            .toString(),
        ).toLocaleString();

        return (
          <div className="flex flex-col">
            <div className="flex">
              <span>Owner:</span>
              <span>{owner}</span>
            </div>

            <div className="flex">
              <span>From {pool.tokenAccountA.name} Account:</span>
              <span>{sourceA}</span>
            </div>

            <div className="flex">
              <span>From {pool.tokenAccountB.name} Account:</span>
              <span>{sourceB}</span>
            </div>

            <div className="flex">
              <span>{pool.tokenAccountA.name} Amount:</span>
              <span>{uiTokenAmountA}</span>
            </div>

            <div className="flex">
              <span>{pool.tokenAccountB.name} Amount:</span>
              <span>{uiTokenAmountB}</span>
            </div>
          </div>
        );
      },
    },

    [saberPoolsConfiguration.stableSwapInstructions.withdrawOne]: {
      name: 'Saber Pools - Withdraw One',
      accounts: [
        'Swap Account',
        'Swap Account Authority',
        'User Authority',
        'Pool Mint',
        'Source Account',
        'Base Token Account',
        'Quote Token Account',
        'Destination Token Account',
        'Admin Destination Account',
        'Token Program Id',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const owner = accounts[2].pubkey.toString();

        const baseTokenAccount = accounts[5].pubkey;
        const quoteTokenAccount = accounts[6].pubkey;
        const destinationAccount = accounts[7].pubkey.toString();

        const pool = saberPoolsConfiguration.getPoolByTokenAccounts(
          baseTokenAccount,
          quoteTokenAccount,
        );

        if (!pool) {
          return <div>Unknown Pool</div>;
        }

        const baseTokenAccountInfo = baseTokenAccount.equals(
          pool.tokenAccountA.mint,
        )
          ? pool.tokenAccountA
          : pool.tokenAccountB;

        const dataLayout = struct([
          u8('instruction'),
          nu64('poolTokenAmount'),
          nu64('minimumTokenAmount'),
        ]);

        const { poolTokenAmount, minimumTokenAmount } = dataLayout.decode(
          Buffer.from(data),
        ) as any;

        const uiPoolTokenAmount = Number(
          new BigNumber(poolTokenAmount)
            .shiftedBy(-pool.poolToken.decimals)
            .toString(),
        ).toLocaleString();

        const uiMinimumTokenAmount = Number(
          new BigNumber(minimumTokenAmount)
            .shiftedBy(-baseTokenAccountInfo.decimals)
            .toString(),
        ).toLocaleString();

        return (
          <div className="flex flex-col">
            <div className="flex">
              <span>Owner:</span>
              <span>{owner}</span>
            </div>

            <div className="flex">
              <span>Withdraw {pool.poolToken.name}s:</span>
              <span>{uiPoolTokenAmount}</span>
            </div>

            <div className="flex">
              <span>Minimum {baseTokenAccountInfo.name} Tokens Received:</span>
              <span>{uiMinimumTokenAmount}</span>
            </div>

            <div className="flex">
              <span>To {baseTokenAccountInfo.name} Account:</span>
              <span>{destinationAccount}</span>
            </div>
          </div>
        );
      },
    },
  },
};
