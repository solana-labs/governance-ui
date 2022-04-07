import { generateErrorMap } from '@saberhq/anchor-contrib';

export type UgovernIDL = {
  version: '0.0.0';
  name: 'govern';
  instructions: [
    {
      name: 'createGovernor';
      accounts: [
        {
          name: 'base';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'governor';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'smartWallet';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'bump';
          type: 'u8';
        },
        {
          name: 'electorate';
          type: 'publicKey';
        },
        {
          name: 'params';
          type: {
            defined: 'GovernanceParameters';
          };
        },
      ];
    },
    {
      name: 'createProposal';
      accounts: [
        {
          name: 'governor';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'proposal';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'proposer';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'bump';
          type: 'u8';
        },
        {
          name: 'instructions';
          type: {
            vec: {
              defined: 'ProposalInstruction';
            };
          };
        },
      ];
    },
    {
      name: 'activateProposal';
      accounts: [
        {
          name: 'governor';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'proposal';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'electorate';
          isMut: false;
          isSigner: true;
        },
      ];
      args: [];
    },
    {
      name: 'cancelProposal';
      accounts: [
        {
          name: 'governor';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'proposal';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'proposer';
          isMut: false;
          isSigner: true;
        },
      ];
      args: [];
    },
    {
      name: 'queueProposal';
      accounts: [
        {
          name: 'governor';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'proposal';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transaction';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'smartWallet';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'payer';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'smartWalletProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'txBump';
          type: 'u8';
        },
      ];
    },
    {
      name: 'newVote';
      accounts: [
        {
          name: 'proposal';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'vote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'bump';
          type: 'u8';
        },
        {
          name: 'voter';
          type: 'publicKey';
        },
      ];
    },
    {
      name: 'setVote';
      accounts: [
        {
          name: 'governor';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'proposal';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'electorate';
          isMut: false;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'side';
          type: 'u8';
        },
        {
          name: 'weight';
          type: 'u64';
        },
      ];
    },
    {
      name: 'setGovernanceParams';
      accounts: [
        {
          name: 'governor';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'smartWallet';
          isMut: false;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'GovernanceParameters';
          };
        },
      ];
    },
    {
      name: 'createProposalMeta';
      accounts: [
        {
          name: 'proposal';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'proposer';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'proposalMeta';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'bump';
          type: 'u8';
        },
        {
          name: 'title';
          type: 'string';
        },
        {
          name: 'descriptionLink';
          type: 'string';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'Governor';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'base';
            type: 'publicKey';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'proposalCount';
            type: 'u64';
          },
          {
            name: 'electorate';
            type: 'publicKey';
          },
          {
            name: 'smartWallet';
            type: 'publicKey';
          },
          {
            name: 'params';
            type: {
              defined: 'GovernanceParameters';
            };
          },
        ];
      };
    },
    {
      name: 'Proposal';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'governor';
            type: 'publicKey';
          },
          {
            name: 'index';
            type: 'u64';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'proposer';
            type: 'publicKey';
          },
          {
            name: 'quorumVotes';
            type: 'u64';
          },
          {
            name: 'forVotes';
            type: 'u64';
          },
          {
            name: 'againstVotes';
            type: 'u64';
          },
          {
            name: 'abstainVotes';
            type: 'u64';
          },
          {
            name: 'canceledAt';
            type: 'i64';
          },
          {
            name: 'createdAt';
            type: 'i64';
          },
          {
            name: 'activatedAt';
            type: 'i64';
          },
          {
            name: 'votingEndsAt';
            type: 'i64';
          },
          {
            name: 'queuedAt';
            type: 'i64';
          },
          {
            name: 'queuedTransaction';
            type: 'publicKey';
          },
          {
            name: 'instructions';
            type: {
              vec: {
                defined: 'ProposalInstruction';
              };
            };
          },
        ];
      };
    },
    {
      name: 'ProposalMeta';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'proposal';
            type: 'publicKey';
          },
          {
            name: 'title';
            type: 'string';
          },
          {
            name: 'descriptionLink';
            type: 'string';
          },
        ];
      };
    },
    {
      name: 'Vote';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'proposal';
            type: 'publicKey';
          },
          {
            name: 'voter';
            type: 'publicKey';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'side';
            type: 'u8';
          },
          {
            name: 'weight';
            type: 'u64';
          },
        ];
      };
    },
  ];
  types: [
    {
      name: 'GovernanceParameters';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'votingDelay';
            type: 'u64';
          },
          {
            name: 'votingPeriod';
            type: 'u64';
          },
          {
            name: 'quorumVotes';
            type: 'u64';
          },
          {
            name: 'timelockDelaySeconds';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'ProposalInstruction';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'programId';
            type: 'publicKey';
          },
          {
            name: 'keys';
            type: {
              vec: {
                defined: 'ProposalAccountMeta';
              };
            };
          },
          {
            name: 'data';
            type: 'bytes';
          },
        ];
      };
    },
    {
      name: 'ProposalAccountMeta';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'pubkey';
            type: 'publicKey';
          },
          {
            name: 'isSigner';
            type: 'bool';
          },
          {
            name: 'isWritable';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'ProposalState';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Draft';
          },
          {
            name: 'Active';
          },
          {
            name: 'Canceled';
          },
          {
            name: 'Defeated';
          },
          {
            name: 'Succeeded';
          },
          {
            name: 'Queued';
          },
        ];
      };
    },
    {
      name: 'VoteSide';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Pending';
          },
          {
            name: 'Against';
          },
          {
            name: 'For';
          },
          {
            name: 'Abstain';
          },
        ];
      };
    },
  ];
  events: [
    {
      name: 'GovernorCreateEvent';
      fields: [
        {
          name: 'governor';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'electorate';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'smartWallet';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'parameters';
          type: {
            defined: 'GovernanceParameters';
          };
          index: false;
        },
      ];
    },
    {
      name: 'ProposalCreateEvent';
      fields: [
        {
          name: 'governor';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'proposal';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'index';
          type: 'u64';
          index: false;
        },
        {
          name: 'instructions';
          type: {
            vec: {
              defined: 'ProposalInstruction';
            };
          };
          index: false;
        },
      ];
    },
    {
      name: 'ProposalActivateEvent';
      fields: [
        {
          name: 'governor';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'proposal';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'votingEndsAt';
          type: 'i64';
          index: false;
        },
      ];
    },
    {
      name: 'ProposalCancelEvent';
      fields: [
        {
          name: 'governor';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'proposal';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'ProposalQueueEvent';
      fields: [
        {
          name: 'governor';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'proposal';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'transaction';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'VoteSetEvent';
      fields: [
        {
          name: 'governor';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'proposal';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'voter';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'vote';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'side';
          type: 'u8';
          index: false;
        },
        {
          name: 'weight';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'ProposalMetaCreateEvent';
      fields: [
        {
          name: 'governor';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'proposal';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'title';
          type: 'string';
          index: false;
        },
        {
          name: 'descriptionLink';
          type: 'string';
          index: false;
        },
      ];
    },
    {
      name: 'GovernorSetParamsEvent';
      fields: [
        {
          name: 'governor';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'prevParams';
          type: {
            defined: 'GovernanceParameters';
          };
          index: false;
        },
        {
          name: 'params';
          type: {
            defined: 'GovernanceParameters';
          };
          index: false;
        },
      ];
    },
  ];
  errors: [
    {
      code: 300;
      name: 'InvalidVoteSide';
      msg: 'Invalid vote side.';
    },
    {
      code: 301;
      name: 'GovernorNotFound';
      msg: "The owner of the smart wallet doesn't match with current.";
    },
    {
      code: 302;
      name: 'VotingDelayNotMet';
      msg: 'The proposal cannot be activated since it has not yet passed the voting delay.';
    },
    {
      code: 303;
      name: 'ProposalNotDraft';
      msg: 'Only drafts can be canceled.';
    },
    {
      code: 304;
      name: 'ProposalNotActive';
      msg: 'The proposal must be active.';
    },
  ];
};
export const UgovernJSON: UgovernIDL = {
  version: '0.0.0',
  name: 'govern',
  instructions: [
    {
      name: 'createGovernor',
      accounts: [
        {
          name: 'base',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'governor',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'smartWallet',
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
          name: 'electorate',
          type: 'publicKey',
        },
        {
          name: 'params',
          type: {
            defined: 'GovernanceParameters',
          },
        },
      ],
    },
    {
      name: 'createProposal',
      accounts: [
        {
          name: 'governor',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'proposal',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'proposer',
          isMut: false,
          isSigner: true,
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
          name: 'instructions',
          type: {
            vec: {
              defined: 'ProposalInstruction',
            },
          },
        },
      ],
    },
    {
      name: 'activateProposal',
      accounts: [
        {
          name: 'governor',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'proposal',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'electorate',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'cancelProposal',
      accounts: [
        {
          name: 'governor',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'proposal',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'proposer',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'queueProposal',
      accounts: [
        {
          name: 'governor',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'proposal',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transaction',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'smartWallet',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'smartWalletProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'txBump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'newVote',
      accounts: [
        {
          name: 'proposal',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'vote',
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
          name: 'voter',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'setVote',
      accounts: [
        {
          name: 'governor',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'proposal',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'electorate',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'side',
          type: 'u8',
        },
        {
          name: 'weight',
          type: 'u64',
        },
      ],
    },
    {
      name: 'setGovernanceParams',
      accounts: [
        {
          name: 'governor',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'smartWallet',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'GovernanceParameters',
          },
        },
      ],
    },
    {
      name: 'createProposalMeta',
      accounts: [
        {
          name: 'proposal',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'proposer',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'proposalMeta',
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
          name: 'title',
          type: 'string',
        },
        {
          name: 'descriptionLink',
          type: 'string',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'Governor',
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
            name: 'proposalCount',
            type: 'u64',
          },
          {
            name: 'electorate',
            type: 'publicKey',
          },
          {
            name: 'smartWallet',
            type: 'publicKey',
          },
          {
            name: 'params',
            type: {
              defined: 'GovernanceParameters',
            },
          },
        ],
      },
    },
    {
      name: 'Proposal',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'governor',
            type: 'publicKey',
          },
          {
            name: 'index',
            type: 'u64',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'proposer',
            type: 'publicKey',
          },
          {
            name: 'quorumVotes',
            type: 'u64',
          },
          {
            name: 'forVotes',
            type: 'u64',
          },
          {
            name: 'againstVotes',
            type: 'u64',
          },
          {
            name: 'abstainVotes',
            type: 'u64',
          },
          {
            name: 'canceledAt',
            type: 'i64',
          },
          {
            name: 'createdAt',
            type: 'i64',
          },
          {
            name: 'activatedAt',
            type: 'i64',
          },
          {
            name: 'votingEndsAt',
            type: 'i64',
          },
          {
            name: 'queuedAt',
            type: 'i64',
          },
          {
            name: 'queuedTransaction',
            type: 'publicKey',
          },
          {
            name: 'instructions',
            type: {
              vec: {
                defined: 'ProposalInstruction',
              },
            },
          },
        ],
      },
    },
    {
      name: 'ProposalMeta',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'proposal',
            type: 'publicKey',
          },
          {
            name: 'title',
            type: 'string',
          },
          {
            name: 'descriptionLink',
            type: 'string',
          },
        ],
      },
    },
    {
      name: 'Vote',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'proposal',
            type: 'publicKey',
          },
          {
            name: 'voter',
            type: 'publicKey',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'side',
            type: 'u8',
          },
          {
            name: 'weight',
            type: 'u64',
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'GovernanceParameters',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'votingDelay',
            type: 'u64',
          },
          {
            name: 'votingPeriod',
            type: 'u64',
          },
          {
            name: 'quorumVotes',
            type: 'u64',
          },
          {
            name: 'timelockDelaySeconds',
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'ProposalInstruction',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'programId',
            type: 'publicKey',
          },
          {
            name: 'keys',
            type: {
              vec: {
                defined: 'ProposalAccountMeta',
              },
            },
          },
          {
            name: 'data',
            type: 'bytes',
          },
        ],
      },
    },
    {
      name: 'ProposalAccountMeta',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pubkey',
            type: 'publicKey',
          },
          {
            name: 'isSigner',
            type: 'bool',
          },
          {
            name: 'isWritable',
            type: 'bool',
          },
        ],
      },
    },
    {
      name: 'ProposalState',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Draft',
          },
          {
            name: 'Active',
          },
          {
            name: 'Canceled',
          },
          {
            name: 'Defeated',
          },
          {
            name: 'Succeeded',
          },
          {
            name: 'Queued',
          },
        ],
      },
    },
    {
      name: 'VoteSide',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Pending',
          },
          {
            name: 'Against',
          },
          {
            name: 'For',
          },
          {
            name: 'Abstain',
          },
        ],
      },
    },
  ],
  events: [
    {
      name: 'GovernorCreateEvent',
      fields: [
        {
          name: 'governor',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'electorate',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'smartWallet',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'parameters',
          type: {
            defined: 'GovernanceParameters',
          },
          index: false,
        },
      ],
    },
    {
      name: 'ProposalCreateEvent',
      fields: [
        {
          name: 'governor',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'proposal',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'index',
          type: 'u64',
          index: false,
        },
        {
          name: 'instructions',
          type: {
            vec: {
              defined: 'ProposalInstruction',
            },
          },
          index: false,
        },
      ],
    },
    {
      name: 'ProposalActivateEvent',
      fields: [
        {
          name: 'governor',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'proposal',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'votingEndsAt',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'ProposalCancelEvent',
      fields: [
        {
          name: 'governor',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'proposal',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'ProposalQueueEvent',
      fields: [
        {
          name: 'governor',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'proposal',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'transaction',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'VoteSetEvent',
      fields: [
        {
          name: 'governor',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'proposal',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'voter',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'vote',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'side',
          type: 'u8',
          index: false,
        },
        {
          name: 'weight',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'ProposalMetaCreateEvent',
      fields: [
        {
          name: 'governor',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'proposal',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'title',
          type: 'string',
          index: false,
        },
        {
          name: 'descriptionLink',
          type: 'string',
          index: false,
        },
      ],
    },
    {
      name: 'GovernorSetParamsEvent',
      fields: [
        {
          name: 'governor',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'prevParams',
          type: {
            defined: 'GovernanceParameters',
          },
          index: false,
        },
        {
          name: 'params',
          type: {
            defined: 'GovernanceParameters',
          },
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 300,
      name: 'InvalidVoteSide',
      msg: 'Invalid vote side.',
    },
    {
      code: 301,
      name: 'GovernorNotFound',
      msg: "The owner of the smart wallet doesn't match with current.",
    },
    {
      code: 302,
      name: 'VotingDelayNotMet',
      msg:
        'The proposal cannot be activated since it has not yet passed the voting delay.',
    },
    {
      code: 303,
      name: 'ProposalNotDraft',
      msg: 'Only drafts can be canceled.',
    },
    {
      code: 304,
      name: 'ProposalNotActive',
      msg: 'The proposal must be active.',
    },
  ],
};
export const UgovernErrors = generateErrorMap(UgovernJSON);
