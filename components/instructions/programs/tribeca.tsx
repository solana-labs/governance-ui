import { nu64, struct, u32, u8 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration';
import { ANCHOR_DISCRIMINATOR_LAYOUT } from '@utils/helpers';

export const TRIBECA_PROGRAM_INSTRUCTIONS = {
  [ATribecaConfiguration.gaugeProgramId.toBase58()]: {
    [ATribecaConfiguration.gaugeInstructions.createGaugeVoter]: {
      name: 'Tribeca - Create Gauge Voter',
      accounts: [
        'Gauge Voter',
        'Gaugemeister',
        'Escrow',
        'Payer',
        'System Program',
      ],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        return null;
      },
    },

    [ATribecaConfiguration.gaugeInstructions.createGaugeVote]: {
      name: 'Tribeca - Create Gauge Vote',
      accounts: [
        'Gauge Vote',
        'Gauge Voter',
        'Gauge',
        'Payer',
        'System Program',
      ],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        return null;
      },
    },

    [ATribecaConfiguration.gaugeInstructions.setGaugeVote]: {
      name: 'Tribeca - Set Gauge Vote',
      accounts: [
        'Gaugemeister',
        'Gauge',
        'Gauge Voter',
        'Gauge Vote',
        'Escrow',
        'Vote Delegate',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          u32('weight'),
        ]);

        const { weight } = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <div className="flex flex-col">
            <div>
              <span>Weight:</span>
              <span>{weight}</span>
            </div>
          </div>
        );
      },
    },

    [ATribecaConfiguration.gaugeInstructions.prepareEpochGaugeVoter]: {
      name: 'Tribeca - Prepare Epoch Gauge Voter',
      accounts: [
        'Gaugemeister',
        'Locker',
        'Escrow',
        'Gauge Voter',
        'Epoch Gauge Voter',
        'Payer',
        'System Program',
      ],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        return null;
      },
    },

    [ATribecaConfiguration.gaugeInstructions.gaugeCommitVote]: {
      name: 'Tribeca - Gauge Commit Vote',
      accounts: [
        'Gaugemeister',
        'Gauge',
        'Gauge Voter',
        'Gauge Vote',
        'Epoch Gauge',
        'Epoch Gauge Voter',
        'Epoch Gauge Vote',
        'Payer',
        'System Program',
      ],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        return null;
      },
    },

    [ATribecaConfiguration.gaugeInstructions.gaugeRevertVote]: {
      name: 'Tribeca - Gauge Revert Vote',
      accounts: [
        'Gaugemeister',
        'Gauge',
        'Gauge Voter',
        'Gauge Vote',
        'Epoch Gauge',
        'Epoch Gauge Voter',
        'Escrow',
        'Vote Delegate',
        'Epoch Gauge Vote',
        'Payer',
      ],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        return null;
      },
    },

    [ATribecaConfiguration.gaugeInstructions.resetEpochGaugeVoter]: {
      name: 'Tribeca - Reset Epoch Gauge Voter',
      accounts: [
        'Gaugemeister',
        'Locker',
        'Escrow',
        'Gauge Voter',
        'Epoch Gauge Voter',
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

  [ATribecaConfiguration.lockedVoterProgramId.toBase58()]: {
    [ATribecaConfiguration.lockedVoterInstructions.newEscrow]: {
      name: 'Tribeca - New Escrow',
      accounts: ['Locker', 'Escrow', 'Escrow Owner', 'Payer', 'System Program'],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        return null;
      },
    },

    [ATribecaConfiguration.lockedVoterInstructions.lock]: {
      name: 'Tribeca - Lock',
      accounts: [
        'Locker',
        'Escrow',
        'Escrow Tokens',
        'Escrow Owner',
        'Source Tokens',
        'Token Program',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('amount'),
          nu64('duration'),
        ]);

        const { amount, duration } = dataLayout.decode(
          Buffer.from(data),
        ) as any;

        return (
          <div className="flex flex-col">
            <div>
              <span>Native Amount:</span>
              <span>{Number(amount).toLocaleString()}</span>
            </div>

            <div>
              <span>Duration (seconds):</span>
              <span>{Number(duration).toLocaleString()}</span>
            </div>
          </div>
        );
      },
    },
  },
};
