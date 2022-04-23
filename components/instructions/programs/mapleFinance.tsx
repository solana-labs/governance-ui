import BigNumber from 'bignumber.js';
import { nu64, struct, u8 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import { MapleFinance } from '@tools/sdk/mapleFinance/configuration';
import { tryGetMint } from '@utils/tokens';

export const MAPLE_FINANCE_PROGRAM_INSTRUCTIONS = {
  [MapleFinance.SyrupProgramId.toBase58()]: {
    [MapleFinance.syrupProgramInstructions.lenderDeposit]: {
      name: 'Maple Finance - Lender Deposit',
      accounts: [
        'lender',
        'lenderUser',
        'pool',
        'globals',
        'baseMint',
        'poolLocker',
        'sharesMint',
        'lockedShares',
        'lenderShares',
        'lenderLocker',
        'systemProgram',
        'tokenProgram',
        'rent',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const lender = accounts[0].pubkey.toString();
        const lenderUser = accounts[1].pubkey.toString();
        const pool = accounts[2].pubkey.toString();
        const baseMint = accounts[4].pubkey;
        const lenderLocker = accounts[9].pubkey.toString();

        const dataLayout = struct([
          u8('instruction'),
          u8('SIGHASH_1'),
          u8('SIGHASH_2'),
          u8('SIGHASH_3'),
          u8('SIGHASH_4'),
          u8('SIGHASH_5'),
          u8('SIGHASH_6'),
          u8('SIGHASH_7'),
          nu64('depositAmount'),
        ]);

        const { depositAmount } = dataLayout.decode(Buffer.from(data)) as any;

        const mintInfo = await tryGetMint(connection, baseMint);

        if (!mintInfo) throw new Error('Cannot load mint info');

        const uiAmount = Number(
          new BigNumber(depositAmount)
            .shiftedBy(-mintInfo.account.decimals)
            .toString(),
        ).toLocaleString();

        return (
          <div className="flex flex-col">
            <div className="flex">
              <span>Lender:</span>
              <span>{lender}</span>
            </div>

            <div className="flex">
              <span>Lender user:</span>
              <span>{lenderUser}</span>
            </div>

            <div className="flex">
              <span>Pool:</span>
              <span>{pool}</span>
            </div>

            <div className="flex">
              <span>Source account:</span>
              <span>{lenderLocker}</span>
            </div>

            <div className="flex">
              <span>Ui amount to deposit:</span>
              <span>{uiAmount}</span>
            </div>
          </div>
        );
      },
    },
  },
};
