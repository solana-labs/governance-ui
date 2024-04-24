export type DriftStakeVoter = {
  version: '0.0.1'
  name: 'drift_stake_voter'
  instructions: [
    {
      name: 'createRegistrar'
      accounts: [
        {
          name: 'registrar'
          isMut: true
          isSigner: false
          docs: [
            'There can only be a single registrar per Realm and governing mint of the Realm'
          ]
        },
        {
          name: 'governanceProgramId'
          isMut: false
          isSigner: false
          docs: [
            'The program id of the spl-governance program the realm belongs to'
          ]
        },
        {
          name: 'driftProgramId'
          isMut: false
          isSigner: false
        },
        {
          name: 'realm'
          isMut: false
          isSigner: false
          docs: [
            'An spl-governance Realm',
            '',
            'Realm is validated in the instruction:',
            '- Realm is owned by the governance_program_id',
            '- governing_token_mint must be the community or council mint',
            '- realm_authority is realm.authority'
          ]
        },
        {
          name: 'governingTokenMint'
          isMut: false
          isSigner: false
          docs: [
            'Either the realm community mint or the council mint.',
            'It must match Realm.community_mint or Realm.config.council_mint',
            '',
            'Note: Once the Realm voter plugin is enabled the governing_token_mint is used only as identity',
            'for the voting population and the tokens of that are no longer used'
          ]
        },
        {
          name: 'realmAuthority'
          isMut: false
          isSigner: true
          docs: ['realm_authority must sign and match Realm.authority']
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
          name: 'spotMarketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'createVoterWeightRecord'
      accounts: [
        {
          name: 'registrar'
          isMut: false
          isSigner: false
        },
        {
          name: 'voterWeightRecord'
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
          name: 'governingTokenOwner'
          type: 'publicKey'
        }
      ]
    },
    {
      name: 'updateVoterWeightRecord'
      accounts: [
        {
          name: 'registrar'
          isMut: false
          isSigner: false
        },
        {
          name: 'voterWeightRecord'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenOwnerRecord'
          isMut: false
          isSigner: false
          docs: [
            'TokenOwnerRecord for any of the configured spl-governance instances'
          ]
        },
        {
          name: 'spotMarket'
          isMut: false
          isSigner: false
          isOptional: true
        },
        {
          name: 'insuranceFundVault'
          isMut: false
          isSigner: false
          isOptional: true
        },
        {
          name: 'insuranceFundStake'
          isMut: false
          isSigner: false
          isOptional: true
        },
        {
          name: 'driftProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    }
  ]
  accounts: [
    {
      name: 'registrar'
      docs: [
        'Registrar which stores spl-governance configurations for the given Realm'
      ]
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'governanceProgramId'
            docs: ['spl-governance program the Realm belongs to']
            type: 'publicKey'
          },
          {
            name: 'realm'
            docs: ['Realm of the Registrar']
            type: 'publicKey'
          },
          {
            name: 'governingTokenMint'
            docs: [
              'Governing token mint the Registrar is for',
              'It can either be the Community or the Council mint of the Realm',
              'When the plugin is enabled the mint is only used as the identity of the governing power (voting population)',
              'and the actual token of the mint is not used'
            ]
            type: 'publicKey'
          },
          {
            name: 'driftProgramId'
            type: 'publicKey'
          },
          {
            name: 'spotMarketIndex'
            type: 'u16'
          }
        ]
      }
    },
    {
      name: 'voterWeightRecord'
      docs: [
        'VoterWeightRecord account as defined in spl-governance-addin-api',
        "It's redefined here without account_discriminator for Anchor to treat it as native account",
        '',
        'The account is used as an api interface to provide voting power to the governance program from external addin contracts'
      ]
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'realm'
            docs: ['The Realm the VoterWeightRecord belongs to']
            type: 'publicKey'
          },
          {
            name: 'governingTokenMint'
            docs: [
              'Governing Token Mint the VoterWeightRecord is associated with',
              'Note: The addin can take deposits of any tokens and is not restricted to the community or council tokens only'
            ]
            type: 'publicKey'
          },
          {
            name: 'governingTokenOwner'
            docs: [
              'The owner of the governing token and voter',
              'This is the actual owner (voter) and corresponds to TokenOwnerRecord.governing_token_owner'
            ]
            type: 'publicKey'
          },
          {
            name: 'voterWeight'
            docs: [
              "Voter's weight",
              'The weight of the voter provided by the addin for the given realm, governing_token_mint and governing_token_owner (voter)'
            ]
            type: 'u64'
          },
          {
            name: 'voterWeightExpiry'
            docs: [
              'The slot when the voting weight expires',
              'It should be set to None if the weight never expires',
              'If the voter weight decays with time, for example for time locked based weights, then the expiry must be set',
              'As a common pattern Revise instruction to update the weight should be invoked before governance instruction within the same transaction',
              'and the expiry set to the current slot to provide up to date weight'
            ]
            type: {
              option: 'u64'
            }
          },
          {
            name: 'weightAction'
            docs: [
              "The governance action the voter's weight pertains to",
              "It allows to provided voter's weight specific to the particular action the weight is evaluated for",
              'When the action is provided then the governance program asserts the executing action is the same as specified by the addin'
            ]
            type: {
              option: {
                defined: 'VoterWeightAction'
              }
            }
          },
          {
            name: 'weightActionTarget'
            docs: [
              "The target the voter's weight  action pertains to",
              "It allows to provided voter's weight specific to the target the weight is evaluated for",
              'For example when addin supplies weight to vote on a particular proposal then it must specify the proposal as the action target',
              'When the target is provided then the governance program asserts the target is the same as specified by the addin'
            ]
            type: {
              option: 'publicKey'
            }
          },
          {
            name: 'reserved'
            docs: ['Reserved space for future versions']
            type: {
              array: ['u8', 8]
            }
          }
        ]
      }
    }
  ]
  types: [
    {
      name: 'CollectionItemChangeType'
      docs: ['Enum defining collection item change type']
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Upsert'
          },
          {
            name: 'Remove'
          }
        ]
      }
    },
    {
      name: 'VoterWeightAction'
      docs: [
        'VoterWeightAction enum as defined in spl-governance-addin-api',
        "It's redefined here for Anchor to export it to IDL"
      ]
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'CastVote'
          },
          {
            name: 'CommentProposal'
          },
          {
            name: 'CreateGovernance'
          },
          {
            name: 'CreateProposal'
          },
          {
            name: 'SignOffProposal'
          }
        ]
      }
    }
  ]
  errors: [
    {
      code: 6000
      name: 'InvalidRealmAuthority'
      msg: 'Invalid Realm Authority'
    },
    {
      code: 6001
      name: 'InvalidRealmForRegistrar'
      msg: 'Invalid Realm for Registrar'
    },
    {
      code: 6002
      name: 'InvalidVoterWeightRecordRealm'
      msg: 'Invalid VoterWeightRecord Realm'
    },
    {
      code: 6003
      name: 'InvalidVoterWeightRecordMint'
      msg: 'Invalid VoterWeightRecord Mint'
    },
    {
      code: 6004
      name: 'TokenOwnerRecordFromOwnRealmNotAllowed'
      msg: 'TokenOwnerRecord from own realm is not allowed'
    },
    {
      code: 6005
      name: 'GovernanceProgramNotConfigured'
      msg: 'Governance program not configured'
    },
    {
      code: 6006
      name: 'GoverningTokenOwnerMustMatch'
      msg: 'Governing TokenOwner must match'
    },
    {
      code: 6007
      name: 'DriftError'
      msg: 'DriftError'
    }
  ]
}

export const IDL: DriftStakeVoter = {
  version: '0.0.1',
  name: 'drift_stake_voter',
  instructions: [
    {
      name: 'createRegistrar',
      accounts: [
        {
          name: 'registrar',
          isMut: true,
          isSigner: false,
          docs: [
            'There can only be a single registrar per Realm and governing mint of the Realm',
          ],
        },
        {
          name: 'governanceProgramId',
          isMut: false,
          isSigner: false,
          docs: [
            'The program id of the spl-governance program the realm belongs to',
          ],
        },
        {
          name: 'driftProgramId',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'realm',
          isMut: false,
          isSigner: false,
          docs: [
            'An spl-governance Realm',
            '',
            'Realm is validated in the instruction:',
            '- Realm is owned by the governance_program_id',
            '- governing_token_mint must be the community or council mint',
            '- realm_authority is realm.authority',
          ],
        },
        {
          name: 'governingTokenMint',
          isMut: false,
          isSigner: false,
          docs: [
            'Either the realm community mint or the council mint.',
            'It must match Realm.community_mint or Realm.config.council_mint',
            '',
            'Note: Once the Realm voter plugin is enabled the governing_token_mint is used only as identity',
            'for the voting population and the tokens of that are no longer used',
          ],
        },
        {
          name: 'realmAuthority',
          isMut: false,
          isSigner: true,
          docs: ['realm_authority must sign and match Realm.authority'],
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
          name: 'spotMarketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'createVoterWeightRecord',
      accounts: [
        {
          name: 'registrar',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'voterWeightRecord',
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
          name: 'governingTokenOwner',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'updateVoterWeightRecord',
      accounts: [
        {
          name: 'registrar',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'voterWeightRecord',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenOwnerRecord',
          isMut: false,
          isSigner: false,
          docs: [
            'TokenOwnerRecord for any of the configured spl-governance instances',
          ],
        },
        {
          name: 'spotMarket',
          isMut: false,
          isSigner: false,
          isOptional: true,
        },
        {
          name: 'insuranceFundVault',
          isMut: false,
          isSigner: false,
          isOptional: true,
        },
        {
          name: 'insuranceFundStake',
          isMut: false,
          isSigner: false,
          isOptional: true,
        },
        {
          name: 'driftProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'registrar',
      docs: [
        'Registrar which stores spl-governance configurations for the given Realm',
      ],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'governanceProgramId',
            docs: ['spl-governance program the Realm belongs to'],
            type: 'publicKey',
          },
          {
            name: 'realm',
            docs: ['Realm of the Registrar'],
            type: 'publicKey',
          },
          {
            name: 'governingTokenMint',
            docs: [
              'Governing token mint the Registrar is for',
              'It can either be the Community or the Council mint of the Realm',
              'When the plugin is enabled the mint is only used as the identity of the governing power (voting population)',
              'and the actual token of the mint is not used',
            ],
            type: 'publicKey',
          },
          {
            name: 'driftProgramId',
            type: 'publicKey',
          },
          {
            name: 'spotMarketIndex',
            type: 'u16',
          },
        ],
      },
    },
    {
      name: 'voterWeightRecord',
      docs: [
        'VoterWeightRecord account as defined in spl-governance-addin-api',
        "It's redefined here without account_discriminator for Anchor to treat it as native account",
        '',
        'The account is used as an api interface to provide voting power to the governance program from external addin contracts',
      ],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'realm',
            docs: ['The Realm the VoterWeightRecord belongs to'],
            type: 'publicKey',
          },
          {
            name: 'governingTokenMint',
            docs: [
              'Governing Token Mint the VoterWeightRecord is associated with',
              'Note: The addin can take deposits of any tokens and is not restricted to the community or council tokens only',
            ],
            type: 'publicKey',
          },
          {
            name: 'governingTokenOwner',
            docs: [
              'The owner of the governing token and voter',
              'This is the actual owner (voter) and corresponds to TokenOwnerRecord.governing_token_owner',
            ],
            type: 'publicKey',
          },
          {
            name: 'voterWeight',
            docs: [
              "Voter's weight",
              'The weight of the voter provided by the addin for the given realm, governing_token_mint and governing_token_owner (voter)',
            ],
            type: 'u64',
          },
          {
            name: 'voterWeightExpiry',
            docs: [
              'The slot when the voting weight expires',
              'It should be set to None if the weight never expires',
              'If the voter weight decays with time, for example for time locked based weights, then the expiry must be set',
              'As a common pattern Revise instruction to update the weight should be invoked before governance instruction within the same transaction',
              'and the expiry set to the current slot to provide up to date weight',
            ],
            type: {
              option: 'u64',
            },
          },
          {
            name: 'weightAction',
            docs: [
              "The governance action the voter's weight pertains to",
              "It allows to provided voter's weight specific to the particular action the weight is evaluated for",
              'When the action is provided then the governance program asserts the executing action is the same as specified by the addin',
            ],
            type: {
              option: {
                defined: 'VoterWeightAction',
              },
            },
          },
          {
            name: 'weightActionTarget',
            docs: [
              "The target the voter's weight  action pertains to",
              "It allows to provided voter's weight specific to the target the weight is evaluated for",
              'For example when addin supplies weight to vote on a particular proposal then it must specify the proposal as the action target',
              'When the target is provided then the governance program asserts the target is the same as specified by the addin',
            ],
            type: {
              option: 'publicKey',
            },
          },
          {
            name: 'reserved',
            docs: ['Reserved space for future versions'],
            type: {
              array: ['u8', 8],
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'CollectionItemChangeType',
      docs: ['Enum defining collection item change type'],
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Upsert',
          },
          {
            name: 'Remove',
          },
        ],
      },
    },
    {
      name: 'VoterWeightAction',
      docs: [
        'VoterWeightAction enum as defined in spl-governance-addin-api',
        "It's redefined here for Anchor to export it to IDL",
      ],
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'CastVote',
          },
          {
            name: 'CommentProposal',
          },
          {
            name: 'CreateGovernance',
          },
          {
            name: 'CreateProposal',
          },
          {
            name: 'SignOffProposal',
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'InvalidRealmAuthority',
      msg: 'Invalid Realm Authority',
    },
    {
      code: 6001,
      name: 'InvalidRealmForRegistrar',
      msg: 'Invalid Realm for Registrar',
    },
    {
      code: 6002,
      name: 'InvalidVoterWeightRecordRealm',
      msg: 'Invalid VoterWeightRecord Realm',
    },
    {
      code: 6003,
      name: 'InvalidVoterWeightRecordMint',
      msg: 'Invalid VoterWeightRecord Mint',
    },
    {
      code: 6004,
      name: 'TokenOwnerRecordFromOwnRealmNotAllowed',
      msg: 'TokenOwnerRecord from own realm is not allowed',
    },
    {
      code: 6005,
      name: 'GovernanceProgramNotConfigured',
      msg: 'Governance program not configured',
    },
    {
      code: 6006,
      name: 'GoverningTokenOwnerMustMatch',
      msg: 'Governing TokenOwner must match',
    },
    {
      code: 6007,
      name: 'DriftError',
      msg: 'DriftError',
    },
  ],
}
