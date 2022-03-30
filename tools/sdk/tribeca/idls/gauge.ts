import { generateErrorMap } from '@saberhq/anchor-contrib'

export type UgaugeIDL = {
  version: '0.0.0'
  name: 'gauge'
  instructions: [
    {
      name: 'createGaugemeister'
      accounts: [
        {
          name: 'gaugemeister'
          isMut: true
          isSigner: false
        },
        {
          name: 'base'
          isMut: false
          isSigner: true
        },
        {
          name: 'operator'
          isMut: false
          isSigner: false
        },
        {
          name: 'locker'
          isMut: false
          isSigner: false
        },
        {
          name: 'payer'
          isMut: true
          isSigner: true
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'bump'
          type: 'u8'
        },
        {
          name: 'foreman'
          type: 'publicKey'
        },
        {
          name: 'epochDurationSeconds'
          type: 'u32'
        },
        {
          name: 'firstEpochStartsAt'
          type: 'u64'
        }
      ]
    },
    {
      name: 'createGauge'
      accounts: [
        {
          name: 'gauge'
          isMut: true
          isSigner: false
        },
        {
          name: 'gaugemeister'
          isMut: false
          isSigner: false
        },
        {
          name: 'quarry'
          isMut: false
          isSigner: false
        },
        {
          name: 'payer'
          isMut: true
          isSigner: true
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'bump'
          type: 'u8'
        }
      ]
    },
    {
      name: 'createGaugeVoter'
      accounts: [
        {
          name: 'gaugeVoter'
          isMut: true
          isSigner: false
        },
        {
          name: 'gaugemeister'
          isMut: false
          isSigner: false
        },
        {
          name: 'escrow'
          isMut: false
          isSigner: false
        },
        {
          name: 'payer'
          isMut: true
          isSigner: true
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'bump'
          type: 'u8'
        }
      ]
    },
    {
      name: 'createGaugeVote'
      accounts: [
        {
          name: 'gaugeVote'
          isMut: true
          isSigner: false
        },
        {
          name: 'gaugeVoter'
          isMut: false
          isSigner: false
        },
        {
          name: 'gauge'
          isMut: false
          isSigner: false
        },
        {
          name: 'payer'
          isMut: true
          isSigner: true
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'bump'
          type: 'u8'
        }
      ]
    },
    {
      name: 'createEpochGauge'
      accounts: [
        {
          name: 'gauge'
          isMut: false
          isSigner: false
        },
        {
          name: 'epochGauge'
          isMut: true
          isSigner: false
        },
        {
          name: 'payer'
          isMut: true
          isSigner: true
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'bump'
          type: 'u8'
        },
        {
          name: 'votingEpoch'
          type: 'u32'
        }
      ]
    },
    {
      name: 'prepareEpochGaugeVoter'
      accounts: [
        {
          name: 'gaugemeister'
          isMut: false
          isSigner: false
        },
        {
          name: 'locker'
          isMut: false
          isSigner: false
        },
        {
          name: 'escrow'
          isMut: false
          isSigner: false
        },
        {
          name: 'gaugeVoter'
          isMut: false
          isSigner: false
        },
        {
          name: 'epochGaugeVoter'
          isMut: true
          isSigner: false
        },
        {
          name: 'payer'
          isMut: true
          isSigner: true
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'bump'
          type: 'u8'
        }
      ]
    },
    {
      name: 'resetEpochGaugeVoter'
      accounts: [
        {
          name: 'gaugemeister'
          isMut: false
          isSigner: false
        },
        {
          name: 'locker'
          isMut: false
          isSigner: false
        },
        {
          name: 'escrow'
          isMut: false
          isSigner: false
        },
        {
          name: 'gaugeVoter'
          isMut: false
          isSigner: false
        },
        {
          name: 'epochGaugeVoter'
          isMut: true
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'gaugeSetVote'
      accounts: [
        {
          name: 'gaugemeister'
          isMut: false
          isSigner: false
        },
        {
          name: 'gauge'
          isMut: false
          isSigner: false
        },
        {
          name: 'gaugeVoter'
          isMut: true
          isSigner: false
        },
        {
          name: 'gaugeVote'
          isMut: true
          isSigner: false
        },
        {
          name: 'escrow'
          isMut: false
          isSigner: false
        },
        {
          name: 'voteDelegate'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'weight'
          type: 'u32'
        }
      ]
    },
    {
      name: 'gaugeCommitVote'
      accounts: [
        {
          name: 'gaugemeister'
          isMut: false
          isSigner: false
        },
        {
          name: 'gauge'
          isMut: false
          isSigner: false
        },
        {
          name: 'gaugeVoter'
          isMut: false
          isSigner: false
        },
        {
          name: 'gaugeVote'
          isMut: false
          isSigner: false
        },
        {
          name: 'epochGauge'
          isMut: true
          isSigner: false
        },
        {
          name: 'epochGaugeVoter'
          isMut: true
          isSigner: false
        },
        {
          name: 'epochGaugeVote'
          isMut: true
          isSigner: false
        },
        {
          name: 'payer'
          isMut: true
          isSigner: true
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'voteBump'
          type: 'u8'
        }
      ]
    },
    {
      name: 'gaugeRevertVote'
      accounts: [
        {
          name: 'gaugemeister'
          isMut: false
          isSigner: false
        },
        {
          name: 'gauge'
          isMut: false
          isSigner: false
        },
        {
          name: 'gaugeVoter'
          isMut: false
          isSigner: false
        },
        {
          name: 'gaugeVote'
          isMut: false
          isSigner: false
        },
        {
          name: 'epochGauge'
          isMut: true
          isSigner: false
        },
        {
          name: 'epochGaugeVoter'
          isMut: true
          isSigner: false
        },
        {
          name: 'escrow'
          isMut: false
          isSigner: false
        },
        {
          name: 'voteDelegate'
          isMut: false
          isSigner: true
        },
        {
          name: 'epochGaugeVote'
          isMut: true
          isSigner: false
        },
        {
          name: 'payer'
          isMut: true
          isSigner: true
        }
      ]
      args: []
    },
    {
      name: 'gaugeEnable'
      accounts: [
        {
          name: 'gaugemeister'
          isMut: false
          isSigner: false
        },
        {
          name: 'gauge'
          isMut: true
          isSigner: false
        },
        {
          name: 'foreman'
          isMut: false
          isSigner: true
        }
      ]
      args: []
    },
    {
      name: 'gaugeDisable'
      accounts: [
        {
          name: 'gaugemeister'
          isMut: false
          isSigner: false
        },
        {
          name: 'gauge'
          isMut: true
          isSigner: false
        },
        {
          name: 'foreman'
          isMut: false
          isSigner: true
        }
      ]
      args: []
    },
    {
      name: 'triggerNextEpoch'
      accounts: [
        {
          name: 'gaugemeister'
          isMut: true
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'syncGauge'
      accounts: [
        {
          name: 'gaugemeister'
          isMut: false
          isSigner: false
        },
        {
          name: 'gauge'
          isMut: false
          isSigner: false
        },
        {
          name: 'epochGauge'
          isMut: false
          isSigner: false
        },
        {
          name: 'quarry'
          isMut: true
          isSigner: false
        },
        {
          name: 'operator'
          isMut: true
          isSigner: false
        },
        {
          name: 'rewarder'
          isMut: true
          isSigner: false
        },
        {
          name: 'quarryMineProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'quarryOperatorProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'setGaugemeisterParams'
      accounts: [
        {
          name: 'gaugemeister'
          isMut: true
          isSigner: false
        },
        {
          name: 'foreman'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'newEpochDurationSeconds'
          type: 'u32'
        },
        {
          name: 'newForeman'
          type: 'publicKey'
        }
      ]
    }
  ]
  accounts: [
    {
      name: 'Gaugemeister'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'base'
            type: 'publicKey'
          },
          {
            name: 'bump'
            type: 'u8'
          },
          {
            name: 'rewarder'
            type: 'publicKey'
          },
          {
            name: 'operator'
            type: 'publicKey'
          },
          {
            name: 'locker'
            type: 'publicKey'
          },
          {
            name: 'foreman'
            type: 'publicKey'
          },
          {
            name: 'epochDurationSeconds'
            type: 'u32'
          },
          {
            name: 'currentRewardsEpoch'
            type: 'u32'
          },
          {
            name: 'nextEpochStartsAt'
            type: 'u64'
          },
          {
            name: 'lockerTokenMint'
            type: 'publicKey'
          },
          {
            name: 'lockerGovernor'
            type: 'publicKey'
          }
        ]
      }
    },
    {
      name: 'Gauge'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'gaugemeister'
            type: 'publicKey'
          },
          {
            name: 'quarry'
            type: 'publicKey'
          },
          {
            name: 'isDisabled'
            type: 'bool'
          }
        ]
      }
    },
    {
      name: 'GaugeVoter'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'gaugemeister'
            type: 'publicKey'
          },
          {
            name: 'escrow'
            type: 'publicKey'
          },
          {
            name: 'owner'
            type: 'publicKey'
          },
          {
            name: 'totalWeight'
            type: 'u32'
          },
          {
            name: 'weightChangeSeqno'
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'GaugeVote'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'gaugeVoter'
            type: 'publicKey'
          },
          {
            name: 'gauge'
            type: 'publicKey'
          },
          {
            name: 'weight'
            type: 'u32'
          }
        ]
      }
    },
    {
      name: 'EpochGauge'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'gauge'
            type: 'publicKey'
          },
          {
            name: 'votingEpoch'
            type: 'u32'
          },
          {
            name: 'totalPower'
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'EpochGaugeVoter'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'gaugeVoter'
            type: 'publicKey'
          },
          {
            name: 'votingEpoch'
            type: 'u32'
          },
          {
            name: 'weightChangeSeqno'
            type: 'u64'
          },
          {
            name: 'votingPower'
            type: 'u64'
          },
          {
            name: 'allocatedPower'
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'EpochGaugeVote'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'allocatedPower'
            type: 'u64'
          }
        ]
      }
    }
  ]
  events: [
    {
      name: 'EpochGaugeCreateEvent'
      fields: [
        {
          name: 'gaugemeister'
          type: 'publicKey'
          index: true
        },
        {
          name: 'quarry'
          type: 'publicKey'
          index: true
        },
        {
          name: 'votingEpoch'
          type: 'u32'
          index: false
        }
      ]
    },
    {
      name: 'GaugeCreateEvent'
      fields: [
        {
          name: 'gaugemeister'
          type: 'publicKey'
          index: true
        },
        {
          name: 'rewarder'
          type: 'publicKey'
          index: true
        },
        {
          name: 'quarry'
          type: 'publicKey'
          index: true
        },
        {
          name: 'gaugeVoterOwner'
          type: 'publicKey'
          index: true
        }
      ]
    },
    {
      name: 'GaugeVoteCreateEvent'
      fields: [
        {
          name: 'gaugemeister'
          type: 'publicKey'
          index: true
        },
        {
          name: 'gauge'
          type: 'publicKey'
          index: true
        },
        {
          name: 'quarry'
          type: 'publicKey'
          index: true
        },
        {
          name: 'gaugeVoterOwner'
          type: 'publicKey'
          index: true
        }
      ]
    },
    {
      name: 'GaugeVoterCreateEvent'
      fields: [
        {
          name: 'gaugemeister'
          type: 'publicKey'
          index: true
        },
        {
          name: 'rewarder'
          type: 'publicKey'
          index: true
        },
        {
          name: 'gaugeVoterOwner'
          type: 'publicKey'
          index: true
        }
      ]
    },
    {
      name: 'GaugemeisterCreateEvent'
      fields: [
        {
          name: 'gaugemeister'
          type: 'publicKey'
          index: false
        },
        {
          name: 'rewarder'
          type: 'publicKey'
          index: false
        },
        {
          name: 'lockerTokenMint'
          type: 'publicKey'
          index: false
        },
        {
          name: 'lockerGovernor'
          type: 'publicKey'
          index: false
        },
        {
          name: 'foreman'
          type: 'publicKey'
          index: false
        },
        {
          name: 'firstRewardsEpoch'
          type: 'u64'
          index: false
        }
      ]
    },
    {
      name: 'CommitGaugeVoteEvent'
      fields: [
        {
          name: 'gaugemeister'
          type: 'publicKey'
          index: true
        },
        {
          name: 'gauge'
          type: 'publicKey'
          index: true
        },
        {
          name: 'quarry'
          type: 'publicKey'
          index: true
        },
        {
          name: 'gaugeVoterOwner'
          type: 'publicKey'
          index: true
        },
        {
          name: 'votingEpoch'
          type: 'u32'
          index: false
        },
        {
          name: 'voteSharesForNextEpoch'
          type: 'u64'
          index: false
        },
        {
          name: 'updatedAllocatedPower'
          type: 'u64'
          index: false
        },
        {
          name: 'updatedTotalPower'
          type: 'u64'
          index: false
        }
      ]
    },
    {
      name: 'GaugeDisableEvent'
      fields: [
        {
          name: 'gauge'
          type: 'publicKey'
          index: false
        },
        {
          name: 'gaugemeister'
          type: 'publicKey'
          index: false
        },
        {
          name: 'foreman'
          type: 'publicKey'
          index: false
        }
      ]
    },
    {
      name: 'GaugeEnableEvent'
      fields: [
        {
          name: 'gauge'
          type: 'publicKey'
          index: false
        },
        {
          name: 'gaugemeister'
          type: 'publicKey'
          index: false
        },
        {
          name: 'foreman'
          type: 'publicKey'
          index: false
        }
      ]
    },
    {
      name: 'RevertGaugeVoteEvent'
      fields: [
        {
          name: 'gaugemeister'
          type: 'publicKey'
          index: true
        },
        {
          name: 'gauge'
          type: 'publicKey'
          index: true
        },
        {
          name: 'quarry'
          type: 'publicKey'
          index: true
        },
        {
          name: 'gaugeVoterOwner'
          type: 'publicKey'
          index: true
        },
        {
          name: 'votingEpoch'
          type: 'u32'
          index: false
        },
        {
          name: 'subtractedPower'
          type: 'u64'
          index: false
        },
        {
          name: 'updatedAllocatedPower'
          type: 'u64'
          index: false
        },
        {
          name: 'updatedTotalPower'
          type: 'u64'
          index: false
        }
      ]
    },
    {
      name: 'SetGaugeVoteEvent'
      fields: [
        {
          name: 'gaugemeister'
          type: 'publicKey'
          index: true
        },
        {
          name: 'gauge'
          type: 'publicKey'
          index: true
        },
        {
          name: 'quarry'
          type: 'publicKey'
          index: true
        },
        {
          name: 'gaugeVoterOwner'
          type: 'publicKey'
          index: true
        },
        {
          name: 'voteDelegate'
          type: 'publicKey'
          index: true
        },
        {
          name: 'prevTotalWeight'
          type: 'u32'
          index: false
        },
        {
          name: 'totalWeight'
          type: 'u32'
          index: false
        },
        {
          name: 'weightChangeSeqno'
          type: 'u64'
          index: false
        }
      ]
    },
    {
      name: 'PrepareEpochGaugeVoterEvent'
      fields: [
        {
          name: 'gaugemeister'
          type: 'publicKey'
          index: true
        },
        {
          name: 'rewarder'
          type: 'publicKey'
          index: true
        },
        {
          name: 'locker'
          type: 'publicKey'
          index: true
        },
        {
          name: 'gaugeVoterOwner'
          type: 'publicKey'
          index: true
        },
        {
          name: 'votingEpoch'
          type: 'u32'
          index: false
        },
        {
          name: 'votingPower'
          type: 'u64'
          index: false
        },
        {
          name: 'weightChangeSeqno'
          type: 'u64'
          index: false
        }
      ]
    },
    {
      name: 'ResetEpochGaugeVoterEvent'
      fields: [
        {
          name: 'gaugemeister'
          type: 'publicKey'
          index: true
        },
        {
          name: 'gaugeVoterOwner'
          type: 'publicKey'
          index: true
        },
        {
          name: 'prevVotingPower'
          type: 'u64'
          index: false
        },
        {
          name: 'votingPower'
          type: 'u64'
          index: false
        },
        {
          name: 'prevWeightChangeSeqno'
          type: 'u64'
          index: false
        },
        {
          name: 'weightChangeSeqno'
          type: 'u64'
          index: false
        }
      ]
    },
    {
      name: 'SetGaugemeisterParamsEvent'
      fields: [
        {
          name: 'prevForeman'
          type: 'publicKey'
          index: false
        },
        {
          name: 'newForeman'
          type: 'publicKey'
          index: false
        },
        {
          name: 'prevEpochDurationSeconds'
          type: 'u32'
          index: false
        },
        {
          name: 'newEpochDurationSeconds'
          type: 'u32'
          index: false
        }
      ]
    },
    {
      name: 'SyncGaugeEvent'
      fields: [
        {
          name: 'gauge'
          type: 'publicKey'
          index: false
        },
        {
          name: 'gaugemeister'
          type: 'publicKey'
          index: false
        },
        {
          name: 'epoch'
          type: 'u32'
          index: false
        },
        {
          name: 'previousShare'
          type: 'u64'
          index: false
        },
        {
          name: 'newShare'
          type: 'u64'
          index: false
        }
      ]
    }
  ]
  errors: [
    {
      code: 300
      name: 'UnauthorizedNotForeman'
      msg: 'You must be the foreman to perform this action.'
    },
    {
      code: 301
      name: 'GaugeEpochCannotBeZero'
      msg: 'Cannot sync gauges at the 0th epoch.'
    },
    {
      code: 302
      name: 'GaugeWrongEpoch'
      msg: 'The gauge is not set to the current epoch.'
    },
    {
      code: 303
      name: 'NextEpochNotReached'
      msg: 'The start time for the next epoch has not yet been reached.'
    },
    {
      code: 304
      name: 'CannotVoteMustReset'
      msg: 'Must set all votes to 0 before changing votes.'
    },
    {
      code: 305
      name: 'CannotVoteGaugeDisabled'
      msg: 'Cannot vote since gauge is disabled; all you may do is set weight to 0.'
    },
    {
      code: 306
      name: 'VoteAlreadyCommitted'
      msg: 'You have already committed your vote to this gauge.'
    },
    {
      code: 307
      name: 'CannotCommitGaugeDisabled'
      msg: 'Cannot commit votes since gauge is disabled; all you may do is set weight to 0.'
    },
    {
      code: 308
      name: 'EpochGaugeNotVoting'
      msg: 'Voting on this epoch gauge is closed.'
    },
    {
      code: 309
      name: 'WeightSeqnoChanged'
      msg: 'Gauge voter voting weights have been modified since you started committing your votes. Please withdraw your votes and try again.'
    },
    {
      code: 310
      name: 'EpochClosed'
      msg: 'You may no longer modify votes for this epoch.'
    },
    {
      code: 311
      name: 'AllocatedPowerMustBeZero'
      msg: 'You must have zero allocated power in order to reset the epoch gauge.'
    }
  ]
}
export const UgaugeJSON: UgaugeIDL = {
  version: '0.0.0',
  name: 'gauge',
  instructions: [
    {
      name: 'createGaugemeister',
      accounts: [
        {
          name: 'gaugemeister',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'base',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'operator',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'locker',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
        {
          name: 'foreman',
          type: 'publicKey',
        },
        {
          name: 'epochDurationSeconds',
          type: 'u32',
        },
        {
          name: 'firstEpochStartsAt',
          type: 'u64',
        },
      ],
    },
    {
      name: 'createGauge',
      accounts: [
        {
          name: 'gauge',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'gaugemeister',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'quarry',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'createGaugeVoter',
      accounts: [
        {
          name: 'gaugeVoter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'gaugemeister',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'escrow',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'createGaugeVote',
      accounts: [
        {
          name: 'gaugeVote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'gaugeVoter',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gauge',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'createEpochGauge',
      accounts: [
        {
          name: 'gauge',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'epochGauge',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
        {
          name: 'votingEpoch',
          type: 'u32',
        },
      ],
    },
    {
      name: 'prepareEpochGaugeVoter',
      accounts: [
        {
          name: 'gaugemeister',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'locker',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'escrow',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gaugeVoter',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'epochGaugeVoter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'resetEpochGaugeVoter',
      accounts: [
        {
          name: 'gaugemeister',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'locker',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'escrow',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gaugeVoter',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'epochGaugeVoter',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'gaugeSetVote',
      accounts: [
        {
          name: 'gaugemeister',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gauge',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gaugeVoter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'gaugeVote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'escrow',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'voteDelegate',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'weight',
          type: 'u32',
        },
      ],
    },
    {
      name: 'gaugeCommitVote',
      accounts: [
        {
          name: 'gaugemeister',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gauge',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gaugeVoter',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gaugeVote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'epochGauge',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'epochGaugeVoter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'epochGaugeVote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'voteBump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'gaugeRevertVote',
      accounts: [
        {
          name: 'gaugemeister',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gauge',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gaugeVoter',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gaugeVote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'epochGauge',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'epochGaugeVoter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'escrow',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'voteDelegate',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'epochGaugeVote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'gaugeEnable',
      accounts: [
        {
          name: 'gaugemeister',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gauge',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'foreman',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'gaugeDisable',
      accounts: [
        {
          name: 'gaugemeister',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gauge',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'foreman',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'triggerNextEpoch',
      accounts: [
        {
          name: 'gaugemeister',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'syncGauge',
      accounts: [
        {
          name: 'gaugemeister',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gauge',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'epochGauge',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'quarry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'operator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rewarder',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'quarryMineProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'quarryOperatorProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'setGaugemeisterParams',
      accounts: [
        {
          name: 'gaugemeister',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'foreman',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'newEpochDurationSeconds',
          type: 'u32',
        },
        {
          name: 'newForeman',
          type: 'publicKey',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'Gaugemeister',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'base',
            type: 'publicKey',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'rewarder',
            type: 'publicKey',
          },
          {
            name: 'operator',
            type: 'publicKey',
          },
          {
            name: 'locker',
            type: 'publicKey',
          },
          {
            name: 'foreman',
            type: 'publicKey',
          },
          {
            name: 'epochDurationSeconds',
            type: 'u32',
          },
          {
            name: 'currentRewardsEpoch',
            type: 'u32',
          },
          {
            name: 'nextEpochStartsAt',
            type: 'u64',
          },
          {
            name: 'lockerTokenMint',
            type: 'publicKey',
          },
          {
            name: 'lockerGovernor',
            type: 'publicKey',
          },
        ],
      },
    },
    {
      name: 'Gauge',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'gaugemeister',
            type: 'publicKey',
          },
          {
            name: 'quarry',
            type: 'publicKey',
          },
          {
            name: 'isDisabled',
            type: 'bool',
          },
        ],
      },
    },
    {
      name: 'GaugeVoter',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'gaugemeister',
            type: 'publicKey',
          },
          {
            name: 'escrow',
            type: 'publicKey',
          },
          {
            name: 'owner',
            type: 'publicKey',
          },
          {
            name: 'totalWeight',
            type: 'u32',
          },
          {
            name: 'weightChangeSeqno',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'GaugeVote',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'gaugeVoter',
            type: 'publicKey',
          },
          {
            name: 'gauge',
            type: 'publicKey',
          },
          {
            name: 'weight',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'EpochGauge',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'gauge',
            type: 'publicKey',
          },
          {
            name: 'votingEpoch',
            type: 'u32',
          },
          {
            name: 'totalPower',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'EpochGaugeVoter',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'gaugeVoter',
            type: 'publicKey',
          },
          {
            name: 'votingEpoch',
            type: 'u32',
          },
          {
            name: 'weightChangeSeqno',
            type: 'u64',
          },
          {
            name: 'votingPower',
            type: 'u64',
          },
          {
            name: 'allocatedPower',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'EpochGaugeVote',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'allocatedPower',
            type: 'u64',
          },
        ],
      },
    },
  ],
  events: [
    {
      name: 'EpochGaugeCreateEvent',
      fields: [
        {
          name: 'gaugemeister',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'quarry',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'votingEpoch',
          type: 'u32',
          index: false,
        },
      ],
    },
    {
      name: 'GaugeCreateEvent',
      fields: [
        {
          name: 'gaugemeister',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'rewarder',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'quarry',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'gaugeVoterOwner',
          type: 'publicKey',
          index: true,
        },
      ],
    },
    {
      name: 'GaugeVoteCreateEvent',
      fields: [
        {
          name: 'gaugemeister',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'gauge',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'quarry',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'gaugeVoterOwner',
          type: 'publicKey',
          index: true,
        },
      ],
    },
    {
      name: 'GaugeVoterCreateEvent',
      fields: [
        {
          name: 'gaugemeister',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'rewarder',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'gaugeVoterOwner',
          type: 'publicKey',
          index: true,
        },
      ],
    },
    {
      name: 'GaugemeisterCreateEvent',
      fields: [
        {
          name: 'gaugemeister',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'rewarder',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'lockerTokenMint',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'lockerGovernor',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'foreman',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'firstRewardsEpoch',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'CommitGaugeVoteEvent',
      fields: [
        {
          name: 'gaugemeister',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'gauge',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'quarry',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'gaugeVoterOwner',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'votingEpoch',
          type: 'u32',
          index: false,
        },
        {
          name: 'voteSharesForNextEpoch',
          type: 'u64',
          index: false,
        },
        {
          name: 'updatedAllocatedPower',
          type: 'u64',
          index: false,
        },
        {
          name: 'updatedTotalPower',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'GaugeDisableEvent',
      fields: [
        {
          name: 'gauge',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'gaugemeister',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'foreman',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'GaugeEnableEvent',
      fields: [
        {
          name: 'gauge',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'gaugemeister',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'foreman',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'RevertGaugeVoteEvent',
      fields: [
        {
          name: 'gaugemeister',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'gauge',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'quarry',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'gaugeVoterOwner',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'votingEpoch',
          type: 'u32',
          index: false,
        },
        {
          name: 'subtractedPower',
          type: 'u64',
          index: false,
        },
        {
          name: 'updatedAllocatedPower',
          type: 'u64',
          index: false,
        },
        {
          name: 'updatedTotalPower',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'SetGaugeVoteEvent',
      fields: [
        {
          name: 'gaugemeister',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'gauge',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'quarry',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'gaugeVoterOwner',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'voteDelegate',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'prevTotalWeight',
          type: 'u32',
          index: false,
        },
        {
          name: 'totalWeight',
          type: 'u32',
          index: false,
        },
        {
          name: 'weightChangeSeqno',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'PrepareEpochGaugeVoterEvent',
      fields: [
        {
          name: 'gaugemeister',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'rewarder',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'locker',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'gaugeVoterOwner',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'votingEpoch',
          type: 'u32',
          index: false,
        },
        {
          name: 'votingPower',
          type: 'u64',
          index: false,
        },
        {
          name: 'weightChangeSeqno',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'ResetEpochGaugeVoterEvent',
      fields: [
        {
          name: 'gaugemeister',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'gaugeVoterOwner',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'prevVotingPower',
          type: 'u64',
          index: false,
        },
        {
          name: 'votingPower',
          type: 'u64',
          index: false,
        },
        {
          name: 'prevWeightChangeSeqno',
          type: 'u64',
          index: false,
        },
        {
          name: 'weightChangeSeqno',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'SetGaugemeisterParamsEvent',
      fields: [
        {
          name: 'prevForeman',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'newForeman',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'prevEpochDurationSeconds',
          type: 'u32',
          index: false,
        },
        {
          name: 'newEpochDurationSeconds',
          type: 'u32',
          index: false,
        },
      ],
    },
    {
      name: 'SyncGaugeEvent',
      fields: [
        {
          name: 'gauge',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'gaugemeister',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'epoch',
          type: 'u32',
          index: false,
        },
        {
          name: 'previousShare',
          type: 'u64',
          index: false,
        },
        {
          name: 'newShare',
          type: 'u64',
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 300,
      name: 'UnauthorizedNotForeman',
      msg: 'You must be the foreman to perform this action.',
    },
    {
      code: 301,
      name: 'GaugeEpochCannotBeZero',
      msg: 'Cannot sync gauges at the 0th epoch.',
    },
    {
      code: 302,
      name: 'GaugeWrongEpoch',
      msg: 'The gauge is not set to the current epoch.',
    },
    {
      code: 303,
      name: 'NextEpochNotReached',
      msg: 'The start time for the next epoch has not yet been reached.',
    },
    {
      code: 304,
      name: 'CannotVoteMustReset',
      msg: 'Must set all votes to 0 before changing votes.',
    },
    {
      code: 305,
      name: 'CannotVoteGaugeDisabled',
      msg:
        'Cannot vote since gauge is disabled; all you may do is set weight to 0.',
    },
    {
      code: 306,
      name: 'VoteAlreadyCommitted',
      msg: 'You have already committed your vote to this gauge.',
    },
    {
      code: 307,
      name: 'CannotCommitGaugeDisabled',
      msg:
        'Cannot commit votes since gauge is disabled; all you may do is set weight to 0.',
    },
    {
      code: 308,
      name: 'EpochGaugeNotVoting',
      msg: 'Voting on this epoch gauge is closed.',
    },
    {
      code: 309,
      name: 'WeightSeqnoChanged',
      msg:
        'Gauge voter voting weights have been modified since you started committing your votes. Please withdraw your votes and try again.',
    },
    {
      code: 310,
      name: 'EpochClosed',
      msg: 'You may no longer modify votes for this epoch.',
    },
    {
      code: 311,
      name: 'AllocatedPowerMustBeZero',
      msg:
        'You must have zero allocated power in order to reset the epoch gauge.',
    },
  ],
}
export const UgaugeErrors = generateErrorMap(UgaugeJSON)
