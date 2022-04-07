import { nu64, struct, u32, u8 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration';

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
        accounts: AccountMetaData[],
      ) => {
        const gaugeVoterMint = accounts[0].pubkey.toString();

        return (
          <div className="flex flex-col">
            <div className="flex">
              <span>Gauge Voter:</span>
              <span>{gaugeVoterMint}</span>
            </div>
          </div>
        );
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
        accounts: AccountMetaData[],
      ) => {
        const gaugeVoterMint = accounts[1].pubkey.toString();
        const gaugeVoteMint = accounts[0].pubkey.toString();
        const gaugeMint = accounts[2].pubkey.toString();

        return (
          <div className="flex flex-col">
            <div>
              <span>Gauge Voter:</span>
              <span>{gaugeVoterMint}</span>
            </div>

            <div>
              <span>Gauge Vote:</span>
              <span>{gaugeVoteMint}</span>
            </div>

            <div>
              <span>Gauge:</span>
              <span>{gaugeMint}</span>
            </div>
          </div>
        );
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
        accounts: AccountMetaData[],
      ) => {
        const gauge = accounts[1].pubkey.toString();
        const gaugeVoter = accounts[2].pubkey.toString();
        const gaugeVote = accounts[3].pubkey.toString();

        const dataLayout = struct([
          u8('instruction'),

          // ignore 7 bytes
          ...Array.from(new Array(7)).map(u8),

          u32('weight'),
        ]);

        const { weight } = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <div className="flex flex-col">
            <div>
              <span>Gauge Voter:</span>
              <span>{gaugeVoter}</span>
            </div>

            <div>
              <span>Gauge Vote:</span>
              <span>{gaugeVote}</span>
            </div>

            <div>
              <span>Gauge:</span>
              <span>{gauge}</span>
            </div>

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
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const gaugeVoter = accounts[3].pubkey.toString();
        const epochGaugeVoter = accounts[4].pubkey.toString();
        const payer = accounts[5].pubkey.toString();

        return (
          <div className="flex flex-col">
            <div>
              <span>Gauge Voter:</span>
              <span>{gaugeVoter}</span>
            </div>

            <div>
              <span>Epoch Gauge Voter:</span>
              <span>{epochGaugeVoter}</span>
            </div>

            <div>
              <span>Payer:</span>
              <span>{payer}</span>
            </div>
          </div>
        );
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
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const gauge = accounts[1].pubkey.toString();
        const gaugeVoter = accounts[2].pubkey.toString();
        const gaugeVote = accounts[3].pubkey.toString();
        const epochGauge = accounts[4].pubkey.toString();
        const epochGaugeVoter = accounts[5].pubkey.toString();
        const epochGaugeVote = accounts[6].pubkey.toString();
        const payer = accounts[7].pubkey.toString();

        return (
          <div className="flex flex-col">
            <div>
              <span>Gauge:</span>
              <span>{gauge}</span>
            </div>

            <div>
              <span>Gauge Voter:</span>
              <span>{gaugeVoter}</span>
            </div>

            <div>
              <span>Gauge Vote:</span>
              <span>{gaugeVote}</span>
            </div>

            <div>
              <span>Epoch Gauge:</span>
              <span>{epochGauge}</span>
            </div>

            <div>
              <span>Epoch Gauge Voter:</span>
              <span>{epochGaugeVoter}</span>
            </div>

            <div>
              <span>Epoch Gauge Vote:</span>
              <span>{epochGaugeVote}</span>
            </div>

            <div>
              <span>Payer:</span>
              <span>{payer}</span>
            </div>
          </div>
        );
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
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const gauge = accounts[1].pubkey.toString();
        const gaugeVoter = accounts[2].pubkey.toString();
        const gaugeVote = accounts[3].pubkey.toString();
        const epochGauge = accounts[4].pubkey.toString();
        const epochGaugeVoter = accounts[5].pubkey.toString();
        const escrow = accounts[6].pubkey.toString();
        const voteDelegate = accounts[7].pubkey.toString();
        const epochGaugeVote = accounts[8].pubkey.toString();
        const payer = accounts[9].pubkey.toString();

        return (
          <div className="flex flex-col">
            <div>
              <span>Gauge:</span>
              <span>{gauge}</span>
            </div>

            <div>
              <span>Gauge Voter:</span>
              <span>{gaugeVoter}</span>
            </div>

            <div>
              <span>Gauge Vote:</span>
              <span>{gaugeVote}</span>
            </div>

            <div>
              <span>Epoch Gauge:</span>
              <span>{epochGauge}</span>
            </div>

            <div>
              <span>Epoch Gauge Voter:</span>
              <span>{epochGaugeVoter}</span>
            </div>

            <div>
              <span>Escrow:</span>
              <span>{escrow}</span>
            </div>

            <div>
              <span>Vote Delegate:</span>
              <span>{voteDelegate}</span>
            </div>

            <div>
              <span>Epoch Gauge Vote:</span>
              <span>{epochGaugeVote}</span>
            </div>

            <div>
              <span>Payer:</span>
              <span>{payer}</span>
            </div>
          </div>
        );
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
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const escrow = accounts[2].pubkey.toString();
        const gaugeVoter = accounts[3].pubkey.toString();
        const epochGaugeVoter = accounts[4].pubkey.toString();

        return (
          <div className="flex flex-col">
            <div>
              <span>Gauge Voter:</span>
              <span>{gaugeVoter}</span>
            </div>

            <div>
              <span>Epoch Gauge Voter:</span>
              <span>{epochGaugeVoter}</span>
            </div>

            <div>
              <span>Escrow:</span>
              <span>{escrow}</span>
            </div>
          </div>
        );
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
        accounts: AccountMetaData[],
      ) => {
        const escrowMint = accounts[1].pubkey.toString();

        return (
          <div className="flex flex-col">
            <div>
              <span>Escrow:</span>
              <span>{escrowMint}</span>
            </div>
          </div>
        );
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

          // ignore 7 bytes
          ...Array.from(new Array(7)).map(u8),

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
