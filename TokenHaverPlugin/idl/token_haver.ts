export type TokenHaver = {
  version: '0.0.1'
  name: 'token_haver'
  instructions: [
    {
      name: 'createRegistrar'
      accounts: [
        {
          name: 'registrar'
          isMut: true
          isSigner: false
          docs: [
            'The Realm Voter Registrar',
            'There can only be a single registrar per governance Realm and governing mint of the Realm'
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
          name: 'mints'
          type: {
            vec: 'publicKey'
          }
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
          docs: ['The RealmVoter voting Registrar']
        },
        {
          name: 'voterWeightRecord'
          isMut: true
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'configureMints'
      accounts: [
        {
          name: 'registrar'
          isMut: true
          isSigner: false
          docs: ['The Registrar for the given realm and governing_token_mint']
        },
        {
          name: 'realm'
          isMut: false
          isSigner: false
        },
        {
          name: 'payer'
          isMut: false
          isSigner: true
        },
        {
          name: 'realmAuthority'
          isMut: false
          isSigner: true
          docs: ['Authority of the Realm must sign and match realm.authority']
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'mints'
          type: {
            vec: 'publicKey'
          }
        }
      ]
    }
  ]
  accounts: [
    {
      name: 'maxVoterWeightRecord'
      docs: [
        'MaxVoterWeightRecord account as defined in spl-governance-addin-api',
        "It's redefined here without account_discriminator for Anchor to treat it as native account",
        '',
        'The account is used as an api interface to provide max voting power to the governance program from external addin contracts'
      ]
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'realm'
            docs: ['The Realm the MaxVoterWeightRecord belongs to']
            type: 'publicKey'
          },
          {
            name: 'governingTokenMint'
            docs: [
              'Governing Token Mint the MaxVoterWeightRecord is associated with',
              'Note: The addin can take deposits of any tokens and is not restricted to the community or council tokens only'
            ]
            type: 'publicKey'
          },
          {
            name: 'maxVoterWeight'
            docs: [
              'Max voter weight',
              'The max voter weight provided by the addin for the given realm and governing_token_mint'
            ]
            type: 'u64'
          },
          {
            name: 'maxVoterWeightExpiry'
            docs: [
              'The slot when the max voting weight expires',
              'It should be set to None if the weight never expires',
              'If the max vote weight decays with time, for example for time locked based weights, then the expiry must be set',
              'As a pattern Revise instruction to update the max weight should be invoked before governance instruction within the same transaction',
              'and the expiry set to the current slot to provide up to date weight'
            ]
            type: {
              option: 'u64'
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
    },
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
            name: 'mints'
            type: {
              vec: 'publicKey'
            }
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
      name: 'GoverningTokenOwnerMustMatch'
      msg: 'Governing TokenOwner must match'
    },
    {
      code: 6005
      name: 'TokenAccountWrongOwner'
      msg: 'All token accounts must be owned by the governing token owner'
    },
    {
      code: 6006
      name: 'TokenAccountWrongMint'
      msg: "All token accounts' mints must be included in the registrar"
    },
    {
      code: 6007
      name: 'TokenAccountNotLocked'
      msg: "All token accounts' mints must be included in the registrar"
    }
  ]
}

export const IDL: TokenHaver = {
  version: '0.0.1',
  name: 'token_haver',
  instructions: [
    {
      name: 'createRegistrar',
      accounts: [
        {
          name: 'registrar',
          isMut: true,
          isSigner: false,
          docs: [
            'The Realm Voter Registrar',
            'There can only be a single registrar per governance Realm and governing mint of the Realm',
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
          name: 'mints',
          type: {
            vec: 'publicKey',
          },
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
          docs: ['The RealmVoter voting Registrar'],
        },
        {
          name: 'voterWeightRecord',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'configureMints',
      accounts: [
        {
          name: 'registrar',
          isMut: true,
          isSigner: false,
          docs: ['The Registrar for the given realm and governing_token_mint'],
        },
        {
          name: 'realm',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'realmAuthority',
          isMut: false,
          isSigner: true,
          docs: ['Authority of the Realm must sign and match realm.authority'],
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'mints',
          type: {
            vec: 'publicKey',
          },
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'maxVoterWeightRecord',
      docs: [
        'MaxVoterWeightRecord account as defined in spl-governance-addin-api',
        "It's redefined here without account_discriminator for Anchor to treat it as native account",
        '',
        'The account is used as an api interface to provide max voting power to the governance program from external addin contracts',
      ],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'realm',
            docs: ['The Realm the MaxVoterWeightRecord belongs to'],
            type: 'publicKey',
          },
          {
            name: 'governingTokenMint',
            docs: [
              'Governing Token Mint the MaxVoterWeightRecord is associated with',
              'Note: The addin can take deposits of any tokens and is not restricted to the community or council tokens only',
            ],
            type: 'publicKey',
          },
          {
            name: 'maxVoterWeight',
            docs: [
              'Max voter weight',
              'The max voter weight provided by the addin for the given realm and governing_token_mint',
            ],
            type: 'u64',
          },
          {
            name: 'maxVoterWeightExpiry',
            docs: [
              'The slot when the max voting weight expires',
              'It should be set to None if the weight never expires',
              'If the max vote weight decays with time, for example for time locked based weights, then the expiry must be set',
              'As a pattern Revise instruction to update the max weight should be invoked before governance instruction within the same transaction',
              'and the expiry set to the current slot to provide up to date weight',
            ],
            type: {
              option: 'u64',
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
            name: 'mints',
            type: {
              vec: 'publicKey',
            },
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
      name: 'GoverningTokenOwnerMustMatch',
      msg: 'Governing TokenOwner must match',
    },
    {
      code: 6005,
      name: 'TokenAccountWrongOwner',
      msg: 'All token accounts must be owned by the governing token owner',
    },
    {
      code: 6006,
      name: 'TokenAccountWrongMint',
      msg: "All token accounts' mints must be included in the registrar",
    },
    {
      code: 6007,
      name: 'TokenAccountNotLocked',
      msg: "All token accounts' mints must be included in the registrar",
    },
  ],
}
