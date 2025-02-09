export type VoterStakeRegistry = {
  version: '0.2.5'
  name: 'voter_stake_registry'
  docs: [
    '# Introduction',
    '',
    'The governance registry is an "addin" to the SPL governance program that',
    'allows one to both vote with many different ypes of tokens for voting and to',
    'scale voting power as a linear function of time locked--subject to some',
    'maximum upper bound.',
    '',
    'The flow for voting with this program is as follows:',
    '',
    '- Create a SPL governance realm.',
    '- Create a governance registry account.',
    '- Add exchange rates for any tokens one wants to deposit. For example,',
    'if one wants to vote with tokens A and B, where token B has twice the',
    'voting power of token A, then the exchange rate of B would be 2 and the',
    'exchange rate of A would be 1.',
    '- Create a voter account.',
    '- Deposit tokens into this program, with an optional lockup period.',
    '- Vote.',
    '',
    'Upon voting with SPL governance, a client is expected to call',
    "`decay_voting_power` to get an up to date measurement of a given `Voter`'s",
    'voting power for the given slot. If this is not done, then the transaction',
    'will fail (since the SPL governance program will require the measurement',
    'to be active for the current slot).',
    '',
    '# Interacting with SPL Governance',
    '',
    'This program does not directly interact with SPL governance via CPI.',
    'Instead, it simply writes a `VoterWeightRecord` account with a well defined',
    'format, which is then used by SPL governance as the voting power measurement',
    'for a given user.',
    '',
    '# Max Vote Weight',
    '',
    'Given that one can use multiple tokens to vote, the max vote weight needs',
    'to be a function of the total supply of all tokens, converted into a common',
    'currency. For example, if you have Token A and Token B, where 1 Token B =',
    '10 Token A, then the `max_vote_weight` should be `supply(A) + supply(B)*10`',
    'where both are converted into common decimals. Then, when calculating the',
    'weight of an individual voter, one can convert B into A via the given',
    'exchange rate, which must be fixed.',
    '',
    'Note that the above also implies that the `max_vote_weight` must fit into',
    'a u64.'
  ]
  instructions: [
    {
      name: 'createRegistrar'
      accounts: [
        {
          name: 'registrar'
          isMut: true
          isSigner: false
          docs: [
            'The voting registrar. There can only be a single registrar',
            'per governance realm and governing mint.'
          ]
        },
        {
          name: 'realm'
          isMut: false
          isSigner: false
          docs: [
            'An spl-governance realm',
            '',
            '- realm is owned by the governance_program_id',
            '- realm_governing_token_mint must be the community or council mint',
            '- realm_authority is realm.authority'
          ]
        },
        {
          name: 'governanceProgramId'
          isMut: false
          isSigner: false
          docs: [
            'The program id of the spl-governance program the realm belongs to.'
          ]
        },
        {
          name: 'realmGoverningTokenMint'
          isMut: false
          isSigner: false
          docs: ['Either the realm community mint or the council mint.']
        },
        {
          name: 'realmAuthority'
          isMut: false
          isSigner: true
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
        },
        {
          name: 'rent'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'registrarBump'
          type: 'u8'
        }
      ]
    },
    {
      name: 'configureVotingMint'
      accounts: [
        {
          name: 'registrar'
          isMut: true
          isSigner: false
        },
        {
          name: 'realmAuthority'
          isMut: false
          isSigner: true
        },
        {
          name: 'mint'
          isMut: false
          isSigner: false
          docs: ['Tokens of this mint will produce vote weight']
        }
      ]
      args: [
        {
          name: 'idx'
          type: 'u16'
        },
        {
          name: 'digitShift'
          type: 'i8'
        },
        {
          name: 'baselineVoteWeightScaledFactor'
          type: 'u64'
        },
        {
          name: 'maxExtraLockupVoteWeightScaledFactor'
          type: 'u64'
        },
        {
          name: 'lockupSaturationSecs'
          type: 'u64'
        },
        {
          name: 'grantAuthority'
          type: {
            option: 'publicKey'
          }
        }
      ]
    },
    {
      name: 'createVoter'
      accounts: [
        {
          name: 'registrar'
          isMut: false
          isSigner: false
        },
        {
          name: 'voter'
          isMut: true
          isSigner: false
        },
        {
          name: 'voterAuthority'
          isMut: false
          isSigner: true
          docs: [
            'The authority controling the voter. Must be the same as the',
            '`governing_token_owner` in the token owner record used with',
            'spl-governance.'
          ]
        },
        {
          name: 'voterWeightRecord'
          isMut: true
          isSigner: false
          docs: [
            'The voter weight record is the account that will be shown to spl-governance',
            'to prove how much vote weight the voter has. See update_voter_weight_record.'
          ]
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
        },
        {
          name: 'rent'
          isMut: false
          isSigner: false
        },
        {
          name: 'instructions'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'voterBump'
          type: 'u8'
        },
        {
          name: 'voterWeightRecordBump'
          type: 'u8'
        }
      ]
    },
    {
      name: 'createDepositEntry'
      accounts: [
        {
          name: 'registrar'
          isMut: false
          isSigner: false
        },
        {
          name: 'voter'
          isMut: true
          isSigner: false
        },
        {
          name: 'vault'
          isMut: true
          isSigner: false
        },
        {
          name: 'voterAuthority'
          isMut: false
          isSigner: true
        },
        {
          name: 'payer'
          isMut: true
          isSigner: true
        },
        {
          name: 'depositMint'
          isMut: false
          isSigner: false
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'associatedTokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'rent'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'depositEntryIndex'
          type: 'u8'
        },
        {
          name: 'kind'
          type: {
            defined: 'LockupKind'
          }
        },
        {
          name: 'startTs'
          type: {
            option: 'u64'
          }
        },
        {
          name: 'periods'
          type: 'u32'
        },
        {
          name: 'allowClawback'
          type: 'bool'
        }
      ]
    },
    {
      name: 'deposit'
      accounts: [
        {
          name: 'registrar'
          isMut: false
          isSigner: false
        },
        {
          name: 'voter'
          isMut: true
          isSigner: false
        },
        {
          name: 'vault'
          isMut: true
          isSigner: false
        },
        {
          name: 'depositToken'
          isMut: true
          isSigner: false
        },
        {
          name: 'depositAuthority'
          isMut: false
          isSigner: true
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'depositEntryIndex'
          type: 'u8'
        },
        {
          name: 'amount'
          type: 'u64'
        }
      ]
    },
    {
      name: 'withdraw'
      accounts: [
        {
          name: 'registrar'
          isMut: false
          isSigner: false
        },
        {
          name: 'voter'
          isMut: true
          isSigner: false
        },
        {
          name: 'voterAuthority'
          isMut: false
          isSigner: true
        },
        {
          name: 'tokenOwnerRecord'
          isMut: false
          isSigner: false
          docs: [
            'The token_owner_record for the voter_authority. This is needed',
            'to be able to forbid withdraws while the voter is engaged with',
            'a vote or has an open proposal.',
            '',
            '- owned by registrar.governance_program_id',
            '- for the registrar.realm',
            '- for the registrar.realm_governing_token_mint',
            '- governing_token_owner is voter_authority'
          ]
        },
        {
          name: 'voterWeightRecord'
          isMut: true
          isSigner: false
          docs: [
            'Withdraws must update the voter weight record, to prevent a stale',
            'record being used to vote after the withdraw.'
          ]
        },
        {
          name: 'vault'
          isMut: true
          isSigner: false
        },
        {
          name: 'destination'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'depositEntryIndex'
          type: 'u8'
        },
        {
          name: 'amount'
          type: 'u64'
        }
      ]
    },
    {
      name: 'grant'
      accounts: [
        {
          name: 'registrar'
          isMut: false
          isSigner: false
        },
        {
          name: 'voter'
          isMut: true
          isSigner: false
        },
        {
          name: 'voterAuthority'
          isMut: false
          isSigner: false
          docs: [
            'The account of the grantee / the address controlling the voter',
            'that the grant is going to.'
          ]
        },
        {
          name: 'voterWeightRecord'
          isMut: true
          isSigner: false
          docs: [
            'The voter weight record is the account that will be shown to spl-governance',
            'to prove how much vote weight the voter has. See update_voter_weight_record.'
          ]
        },
        {
          name: 'vault'
          isMut: true
          isSigner: false
        },
        {
          name: 'depositToken'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenAuthority'
          isMut: false
          isSigner: true
          docs: ['Authority for transfering tokens away from deposit_token']
        },
        {
          name: 'grantAuthority'
          isMut: false
          isSigner: true
          docs: [
            'Authority for making a grant to this voter account',
            '',
            'Verification inline in instruction'
          ]
        },
        {
          name: 'payer'
          isMut: true
          isSigner: true
          docs: ['Rent payer if a new account is to be created']
        },
        {
          name: 'depositMint'
          isMut: false
          isSigner: false
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'associatedTokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'rent'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'voterBump'
          type: 'u8'
        },
        {
          name: 'voterWeightRecordBump'
          type: 'u8'
        },
        {
          name: 'kind'
          type: {
            defined: 'LockupKind'
          }
        },
        {
          name: 'startTs'
          type: {
            option: 'u64'
          }
        },
        {
          name: 'periods'
          type: 'u32'
        },
        {
          name: 'allowClawback'
          type: 'bool'
        },
        {
          name: 'amount'
          type: 'u64'
        }
      ]
    },
    {
      name: 'clawback'
      accounts: [
        {
          name: 'registrar'
          isMut: false
          isSigner: false
        },
        {
          name: 'realmAuthority'
          isMut: false
          isSigner: true
        },
        {
          name: 'voter'
          isMut: true
          isSigner: false
        },
        {
          name: 'vault'
          isMut: true
          isSigner: false
        },
        {
          name: 'destination'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'depositEntryIndex'
          type: 'u8'
        }
      ]
    },
    {
      name: 'closeDepositEntry'
      accounts: [
        {
          name: 'voter'
          isMut: true
          isSigner: false
        },
        {
          name: 'voterAuthority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'depositEntryIndex'
          type: 'u8'
        }
      ]
    },
    {
      name: 'resetLockup'
      accounts: [
        {
          name: 'registrar'
          isMut: false
          isSigner: false
        },
        {
          name: 'voter'
          isMut: true
          isSigner: false
        },
        {
          name: 'voterAuthority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'depositEntryIndex'
          type: 'u8'
        },
        {
          name: 'kind'
          type: {
            defined: 'LockupKind'
          }
        },
        {
          name: 'periods'
          type: 'u32'
        }
      ]
    },
    {
      name: 'internalTransferLocked'
      accounts: [
        {
          name: 'registrar'
          isMut: false
          isSigner: false
        },
        {
          name: 'voter'
          isMut: true
          isSigner: false
        },
        {
          name: 'voterAuthority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'sourceDepositEntryIndex'
          type: 'u8'
        },
        {
          name: 'targetDepositEntryIndex'
          type: 'u8'
        },
        {
          name: 'amount'
          type: 'u64'
        }
      ]
    },
    {
      name: 'internalTransferUnlocked'
      accounts: [
        {
          name: 'registrar'
          isMut: false
          isSigner: false
        },
        {
          name: 'voter'
          isMut: true
          isSigner: false
        },
        {
          name: 'voterAuthority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'sourceDepositEntryIndex'
          type: 'u8'
        },
        {
          name: 'targetDepositEntryIndex'
          type: 'u8'
        },
        {
          name: 'amount'
          type: 'u64'
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
          name: 'voter'
          isMut: false
          isSigner: false
        },
        {
          name: 'voterWeightRecord'
          isMut: true
          isSigner: false
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'updateMaxVoteWeight'
      accounts: [
        {
          name: 'registrar'
          isMut: false
          isSigner: false
        },
        {
          name: 'maxVoteWeightRecord'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'closeVoter'
      accounts: [
        {
          name: 'registrar'
          isMut: false
          isSigner: false
        },
        {
          name: 'voter'
          isMut: true
          isSigner: false
        },
        {
          name: 'voterAuthority'
          isMut: false
          isSigner: true
        },
        {
          name: 'solDestination'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'logVoterInfo'
      accounts: [
        {
          name: 'registrar'
          isMut: false
          isSigner: false
        },
        {
          name: 'voter'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'depositEntryBegin'
          type: 'u8'
        },
        {
          name: 'depositEntryCount'
          type: 'u8'
        }
      ]
    },
    {
      name: 'setTimeOffset'
      accounts: [
        {
          name: 'registrar'
          isMut: true
          isSigner: false
        },
        {
          name: 'realmAuthority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'timeOffset'
          type: 'i64'
        }
      ]
    },
    {
      name: 'unlockDeposit'
      docs: [
        '_Requires signing by the VotingMintConfig.grant_authority or Registrar.realm_authority_',
        'Makes all tokens in a DepositEntry available for immediate withdrawal.'
      ]
      accounts: [
        {
          name: 'registrar'
          isMut: false
          isSigner: false
        },
        {
          name: 'voter'
          isMut: true
          isSigner: false
        },
        {
          name: 'voterAuthority'
          isMut: false
          isSigner: true
        },
        {
          name: 'grantAuthority'
          isMut: false
          isSigner: true
          docs: [
            'Authority for making a grant to this voter account',
            '',
            'Instruction validates grant_authority is the VotingMintConfig.grant_authority or',
            'Registrar.realm_authority.'
          ]
        }
      ]
      args: [
        {
          name: 'depositEntryIndex'
          type: 'u8'
        }
      ]
    }
  ]
  accounts: [
    {
      name: 'registrar'
      docs: ['Instance of a voting rights distributor.']
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'governanceProgramId'
            type: 'publicKey'
          },
          {
            name: 'realm'
            type: 'publicKey'
          },
          {
            name: 'realmGoverningTokenMint'
            type: 'publicKey'
          },
          {
            name: 'realmAuthority'
            type: 'publicKey'
          },
          {
            name: 'reserved1'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'votingMints'
            docs: [
              'Storage for voting mints and their configuration.',
              "The length should be adjusted for one's use case."
            ]
            type: {
              array: [
                {
                  defined: 'VotingMintConfig'
                },
                4
              ]
            }
          },
          {
            name: 'timeOffset'
            docs: [
              'Debug only: time offset, to allow tests to move forward in time.'
            ]
            type: 'i64'
          },
          {
            name: 'bump'
            type: 'u8'
          },
          {
            name: 'reserved2'
            type: {
              array: ['u8', 7]
            }
          },
          {
            name: 'reserved3'
            type: {
              array: ['u64', 11]
            }
          }
        ]
      }
    },
    {
      name: 'voter'
      docs: ['User account for minting voting rights.']
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'voterAuthority'
            type: 'publicKey'
          },
          {
            name: 'registrar'
            type: 'publicKey'
          },
          {
            name: 'deposits'
            type: {
              array: [
                {
                  defined: 'DepositEntry'
                },
                32
              ]
            }
          },
          {
            name: 'voterBump'
            type: 'u8'
          },
          {
            name: 'voterWeightRecordBump'
            type: 'u8'
          },
          {
            name: 'reserved'
            type: {
              array: ['u8', 94]
            }
          }
        ]
      }
    }
  ]
  types: [
    {
      name: 'VestingInfo'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'rate'
            docs: ['Amount of tokens vested each period']
            type: 'u64'
          },
          {
            name: 'nextTimestamp'
            docs: ['Time of the next upcoming vesting']
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'LockingInfo'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'amount'
            docs: ['Amount of locked tokens']
            type: 'u64'
          },
          {
            name: 'endTimestamp'
            docs: [
              'Time at which the lockup fully ends (None for Constant lockup)'
            ]
            type: {
              option: 'u64'
            }
          },
          {
            name: 'vesting'
            docs: ['Information about vesting, if any']
            type: {
              option: {
                defined: 'VestingInfo'
              }
            }
          }
        ]
      }
    },
    {
      name: 'DepositEntry'
      docs: [
        'Bookkeeping for a single deposit for a given mint and lockup schedule.'
      ]
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'lockup'
            type: {
              defined: 'Lockup'
            }
          },
          {
            name: 'amountDepositedNative'
            docs: [
              'Amount in deposited, in native currency. Withdraws of vested tokens',
              'directly reduce this amount.',
              '',
              'This directly tracks the total amount added by the user. They may',
              'never withdraw more than this amount.'
            ]
            type: 'u64'
          },
          {
            name: 'amountInitiallyLockedNative'
            docs: [
              'Amount in locked when the lockup began, in native currency.',
              '',
              'Note that this is not adjusted for withdraws. It is possible for this',
              'value to be bigger than amount_deposited_native after some vesting',
              'and withdrawals.',
              '',
              'This value is needed to compute the amount that vests each peroid,',
              'which should not change due to withdraws.'
            ]
            type: 'u64'
          },
          {
            name: 'isUsed'
            type: 'bool'
          },
          {
            name: 'allowClawback'
            docs: [
              'If the clawback authority is allowed to extract locked tokens.'
            ]
            type: 'bool'
          },
          {
            name: 'votingMintConfigIdx'
            type: 'u8'
          },
          {
            name: 'reserved'
            type: {
              array: ['u8', 29]
            }
          }
        ]
      }
    },
    {
      name: 'Lockup'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'startTs'
            docs: [
              'Start of the lockup.',
              '',
              'Note, that if start_ts is in the future, the funds are nevertheless',
              'locked up!',
              '',
              "Similarly vote power computations don't care about start_ts and always",
              'assume the full interval from now to end_ts.'
            ]
            type: 'i64'
          },
          {
            name: 'endTs'
            docs: ['End of the lockup.']
            type: 'i64'
          },
          {
            name: 'kind'
            docs: ['Type of lockup.']
            type: {
              defined: 'LockupKind'
            }
          },
          {
            name: 'reserved'
            type: {
              array: ['u8', 15]
            }
          }
        ]
      }
    },
    {
      name: 'VotingMintConfig'
      docs: [
        'Exchange rate for an asset that can be used to mint voting rights.',
        '',
        'See documentation of configure_voting_mint for details on how',
        'native token amounts convert to vote weight.'
      ]
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'mint'
            docs: ['Mint for this entry.']
            type: 'publicKey'
          },
          {
            name: 'grantAuthority'
            docs: ['The authority that is allowed to push grants into voters']
            type: 'publicKey'
          },
          {
            name: 'baselineVoteWeightScaledFactor'
            docs: [
              'Vote weight factor for all funds in the account, no matter if locked or not.',
              '',
              'In 1/SCALED_FACTOR_BASE units.'
            ]
            type: 'u64'
          },
          {
            name: 'maxExtraLockupVoteWeightScaledFactor'
            docs: [
              'Maximum extra vote weight factor for lockups.',
              '',
              'This is the extra votes gained for lockups lasting lockup_saturation_secs or',
              'longer. Shorter lockups receive only a fraction of the maximum extra vote weight,',
              'based on lockup_time divided by lockup_saturation_secs.',
              '',
              'In 1/SCALED_FACTOR_BASE units.'
            ]
            type: 'u64'
          },
          {
            name: 'lockupSaturationSecs'
            docs: [
              'Number of seconds of lockup needed to reach the maximum lockup bonus.'
            ]
            type: 'u64'
          },
          {
            name: 'digitShift'
            docs: [
              'Number of digits to shift native amounts, applying a 10^digit_shift factor.'
            ]
            type: 'i8'
          },
          {
            name: 'reserved1'
            type: {
              array: ['u8', 7]
            }
          },
          {
            name: 'reserved2'
            type: {
              array: ['u64', 7]
            }
          }
        ]
      }
    },
    {
      name: 'LockupKind'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'None'
          },
          {
            name: 'Daily'
          },
          {
            name: 'Monthly'
          },
          {
            name: 'Cliff'
          },
          {
            name: 'Constant'
          }
        ]
      }
    }
  ]
  events: [
    {
      name: 'VoterInfo'
      fields: [
        {
          name: 'votingPower'
          type: 'u64'
          index: false
        },
        {
          name: 'votingPowerBaseline'
          type: 'u64'
          index: false
        }
      ]
    },
    {
      name: 'DepositEntryInfo'
      fields: [
        {
          name: 'depositEntryIndex'
          type: 'u8'
          index: false
        },
        {
          name: 'votingMintConfigIndex'
          type: 'u8'
          index: false
        },
        {
          name: 'unlocked'
          type: 'u64'
          index: false
        },
        {
          name: 'votingPower'
          type: 'u64'
          index: false
        },
        {
          name: 'votingPowerBaseline'
          type: 'u64'
          index: false
        },
        {
          name: 'locking'
          type: {
            option: {
              defined: 'LockingInfo'
            }
          }
          index: false
        }
      ]
    }
  ]
  errors: [
    {
      code: 6000
      name: 'InvalidRate'
      msg: 'Exchange rate must be greater than zero'
    },
    {
      code: 6001
      name: 'RatesFull'
      msg: ''
    },
    {
      code: 6002
      name: 'VotingMintNotFound'
      msg: ''
    },
    {
      code: 6003
      name: 'DepositEntryNotFound'
      msg: ''
    },
    {
      code: 6004
      name: 'DepositEntryFull'
      msg: ''
    },
    {
      code: 6005
      name: 'VotingTokenNonZero'
      msg: ''
    },
    {
      code: 6006
      name: 'OutOfBoundsDepositEntryIndex'
      msg: ''
    },
    {
      code: 6007
      name: 'UnusedDepositEntryIndex'
      msg: ''
    },
    {
      code: 6008
      name: 'InsufficientUnlockedTokens'
      msg: ''
    },
    {
      code: 6009
      name: 'UnableToConvert'
      msg: ''
    },
    {
      code: 6010
      name: 'InvalidLockupPeriod'
      msg: ''
    },
    {
      code: 6011
      name: 'InvalidEndTs'
      msg: ''
    },
    {
      code: 6012
      name: 'InvalidDays'
      msg: ''
    },
    {
      code: 6013
      name: 'VotingMintConfigIndexAlreadyInUse'
      msg: ''
    },
    {
      code: 6014
      name: 'OutOfBoundsVotingMintConfigIndex'
      msg: ''
    },
    {
      code: 6015
      name: 'InvalidDecimals'
      msg: 'Exchange rate decimals cannot be larger than registrar decimals'
    },
    {
      code: 6016
      name: 'InvalidToDepositAndWithdrawInOneSlot'
      msg: ''
    },
    {
      code: 6017
      name: 'ShouldBeTheFirstIxInATx'
      msg: ''
    },
    {
      code: 6018
      name: 'ForbiddenCpi'
      msg: ''
    },
    {
      code: 6019
      name: 'InvalidMint'
      msg: ''
    },
    {
      code: 6020
      name: 'DebugInstruction'
      msg: ''
    },
    {
      code: 6021
      name: 'ClawbackNotAllowedOnDeposit'
      msg: ''
    },
    {
      code: 6022
      name: 'DepositStillLocked'
      msg: ''
    },
    {
      code: 6023
      name: 'InvalidAuthority'
      msg: ''
    },
    {
      code: 6024
      name: 'InvalidTokenOwnerRecord'
      msg: ''
    },
    {
      code: 6025
      name: 'InvalidRealmAuthority'
      msg: ''
    },
    {
      code: 6026
      name: 'VoterWeightOverflow'
      msg: ''
    },
    {
      code: 6027
      name: 'LockupSaturationMustBePositive'
      msg: ''
    },
    {
      code: 6028
      name: 'VotingMintConfiguredWithDifferentIndex'
      msg: ''
    },
    {
      code: 6029
      name: 'InternalProgramError'
      msg: ''
    },
    {
      code: 6030
      name: 'InsufficientLockedTokens'
      msg: ''
    },
    {
      code: 6031
      name: 'MustKeepTokensLocked'
      msg: ''
    },
    {
      code: 6032
      name: 'InvalidLockupKind'
      msg: ''
    },
    {
      code: 6033
      name: 'InvalidChangeToClawbackDepositEntry'
      msg: ''
    },
    {
      code: 6034
      name: 'InternalErrorBadLockupVoteWeight'
      msg: ''
    },
    {
      code: 6035
      name: 'DepositStartTooFarInFuture'
      msg: ''
    },
    {
      code: 6036
      name: 'VaultTokenNonZero'
      msg: ''
    },
    {
      code: 6037
      name: 'InvalidTimestampArguments'
      msg: ''
    },
    {
      code: 6038
      name: 'BadUnlockDepositAuthority'
      msg: ''
    },
    {
      code: 6039
      name: 'MintConfigNotUsed'
      msg: ''
    }
  ]
}

export const IDL: VoterStakeRegistry = {
  version: '0.2.5',
  name: 'voter_stake_registry',
  docs: [
    '# Introduction',
    '',
    'The governance registry is an "addin" to the SPL governance program that',
    'allows one to both vote with many different ypes of tokens for voting and to',
    'scale voting power as a linear function of time locked--subject to some',
    'maximum upper bound.',
    '',
    'The flow for voting with this program is as follows:',
    '',
    '- Create a SPL governance realm.',
    '- Create a governance registry account.',
    '- Add exchange rates for any tokens one wants to deposit. For example,',
    'if one wants to vote with tokens A and B, where token B has twice the',
    'voting power of token A, then the exchange rate of B would be 2 and the',
    'exchange rate of A would be 1.',
    '- Create a voter account.',
    '- Deposit tokens into this program, with an optional lockup period.',
    '- Vote.',
    '',
    'Upon voting with SPL governance, a client is expected to call',
    "`decay_voting_power` to get an up to date measurement of a given `Voter`'s",
    'voting power for the given slot. If this is not done, then the transaction',
    'will fail (since the SPL governance program will require the measurement',
    'to be active for the current slot).',
    '',
    '# Interacting with SPL Governance',
    '',
    'This program does not directly interact with SPL governance via CPI.',
    'Instead, it simply writes a `VoterWeightRecord` account with a well defined',
    'format, which is then used by SPL governance as the voting power measurement',
    'for a given user.',
    '',
    '# Max Vote Weight',
    '',
    'Given that one can use multiple tokens to vote, the max vote weight needs',
    'to be a function of the total supply of all tokens, converted into a common',
    'currency. For example, if you have Token A and Token B, where 1 Token B =',
    '10 Token A, then the `max_vote_weight` should be `supply(A) + supply(B)*10`',
    'where both are converted into common decimals. Then, when calculating the',
    'weight of an individual voter, one can convert B into A via the given',
    'exchange rate, which must be fixed.',
    '',
    'Note that the above also implies that the `max_vote_weight` must fit into',
    'a u64.',
  ],
  instructions: [
    {
      name: 'createRegistrar',
      accounts: [
        {
          name: 'registrar',
          isMut: true,
          isSigner: false,
          docs: [
            'The voting registrar. There can only be a single registrar',
            'per governance realm and governing mint.',
          ],
        },
        {
          name: 'realm',
          isMut: false,
          isSigner: false,
          docs: [
            'An spl-governance realm',
            '',
            '- realm is owned by the governance_program_id',
            '- realm_governing_token_mint must be the community or council mint',
            '- realm_authority is realm.authority',
          ],
        },
        {
          name: 'governanceProgramId',
          isMut: false,
          isSigner: false,
          docs: [
            'The program id of the spl-governance program the realm belongs to.',
          ],
        },
        {
          name: 'realmGoverningTokenMint',
          isMut: false,
          isSigner: false,
          docs: ['Either the realm community mint or the council mint.'],
        },
        {
          name: 'realmAuthority',
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
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'registrarBump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'configureVotingMint',
      accounts: [
        {
          name: 'registrar',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'realmAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
          docs: ['Tokens of this mint will produce vote weight'],
        },
      ],
      args: [
        {
          name: 'idx',
          type: 'u16',
        },
        {
          name: 'digitShift',
          type: 'i8',
        },
        {
          name: 'baselineVoteWeightScaledFactor',
          type: 'u64',
        },
        {
          name: 'maxExtraLockupVoteWeightScaledFactor',
          type: 'u64',
        },
        {
          name: 'lockupSaturationSecs',
          type: 'u64',
        },
        {
          name: 'grantAuthority',
          type: {
            option: 'publicKey',
          },
        },
      ],
    },
    {
      name: 'createVoter',
      accounts: [
        {
          name: 'registrar',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'voter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'voterAuthority',
          isMut: false,
          isSigner: true,
          docs: [
            'The authority controling the voter. Must be the same as the',
            '`governing_token_owner` in the token owner record used with',
            'spl-governance.',
          ],
        },
        {
          name: 'voterWeightRecord',
          isMut: true,
          isSigner: false,
          docs: [
            'The voter weight record is the account that will be shown to spl-governance',
            'to prove how much vote weight the voter has. See update_voter_weight_record.',
          ],
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
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'instructions',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'voterBump',
          type: 'u8',
        },
        {
          name: 'voterWeightRecordBump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'createDepositEntry',
      accounts: [
        {
          name: 'registrar',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'voter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'voterAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'depositMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'depositEntryIndex',
          type: 'u8',
        },
        {
          name: 'kind',
          type: {
            defined: 'LockupKind',
          },
        },
        {
          name: 'startTs',
          type: {
            option: 'u64',
          },
        },
        {
          name: 'periods',
          type: 'u32',
        },
        {
          name: 'allowClawback',
          type: 'bool',
        },
      ],
    },
    {
      name: 'deposit',
      accounts: [
        {
          name: 'registrar',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'voter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'depositEntryIndex',
          type: 'u8',
        },
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdraw',
      accounts: [
        {
          name: 'registrar',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'voter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'voterAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenOwnerRecord',
          isMut: false,
          isSigner: false,
          docs: [
            'The token_owner_record for the voter_authority. This is needed',
            'to be able to forbid withdraws while the voter is engaged with',
            'a vote or has an open proposal.',
            '',
            '- owned by registrar.governance_program_id',
            '- for the registrar.realm',
            '- for the registrar.realm_governing_token_mint',
            '- governing_token_owner is voter_authority',
          ],
        },
        {
          name: 'voterWeightRecord',
          isMut: true,
          isSigner: false,
          docs: [
            'Withdraws must update the voter weight record, to prevent a stale',
            'record being used to vote after the withdraw.',
          ],
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'destination',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'depositEntryIndex',
          type: 'u8',
        },
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'grant',
      accounts: [
        {
          name: 'registrar',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'voter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'voterAuthority',
          isMut: false,
          isSigner: false,
          docs: [
            'The account of the grantee / the address controlling the voter',
            'that the grant is going to.',
          ],
        },
        {
          name: 'voterWeightRecord',
          isMut: true,
          isSigner: false,
          docs: [
            'The voter weight record is the account that will be shown to spl-governance',
            'to prove how much vote weight the voter has. See update_voter_weight_record.',
          ],
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenAuthority',
          isMut: false,
          isSigner: true,
          docs: ['Authority for transfering tokens away from deposit_token'],
        },
        {
          name: 'grantAuthority',
          isMut: false,
          isSigner: true,
          docs: [
            'Authority for making a grant to this voter account',
            '',
            'Verification inline in instruction',
          ],
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
          docs: ['Rent payer if a new account is to be created'],
        },
        {
          name: 'depositMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'voterBump',
          type: 'u8',
        },
        {
          name: 'voterWeightRecordBump',
          type: 'u8',
        },
        {
          name: 'kind',
          type: {
            defined: 'LockupKind',
          },
        },
        {
          name: 'startTs',
          type: {
            option: 'u64',
          },
        },
        {
          name: 'periods',
          type: 'u32',
        },
        {
          name: 'allowClawback',
          type: 'bool',
        },
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'clawback',
      accounts: [
        {
          name: 'registrar',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'realmAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'voter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'destination',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'depositEntryIndex',
          type: 'u8',
        },
      ],
    },
    {
      name: 'closeDepositEntry',
      accounts: [
        {
          name: 'voter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'voterAuthority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'depositEntryIndex',
          type: 'u8',
        },
      ],
    },
    {
      name: 'resetLockup',
      accounts: [
        {
          name: 'registrar',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'voter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'voterAuthority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'depositEntryIndex',
          type: 'u8',
        },
        {
          name: 'kind',
          type: {
            defined: 'LockupKind',
          },
        },
        {
          name: 'periods',
          type: 'u32',
        },
      ],
    },
    {
      name: 'internalTransferLocked',
      accounts: [
        {
          name: 'registrar',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'voter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'voterAuthority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'sourceDepositEntryIndex',
          type: 'u8',
        },
        {
          name: 'targetDepositEntryIndex',
          type: 'u8',
        },
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'internalTransferUnlocked',
      accounts: [
        {
          name: 'registrar',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'voter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'voterAuthority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'sourceDepositEntryIndex',
          type: 'u8',
        },
        {
          name: 'targetDepositEntryIndex',
          type: 'u8',
        },
        {
          name: 'amount',
          type: 'u64',
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
          name: 'voter',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'voterWeightRecord',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'updateMaxVoteWeight',
      accounts: [
        {
          name: 'registrar',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'maxVoteWeightRecord',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'closeVoter',
      accounts: [
        {
          name: 'registrar',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'voter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'voterAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'solDestination',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'logVoterInfo',
      accounts: [
        {
          name: 'registrar',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'voter',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'depositEntryBegin',
          type: 'u8',
        },
        {
          name: 'depositEntryCount',
          type: 'u8',
        },
      ],
    },
    {
      name: 'setTimeOffset',
      accounts: [
        {
          name: 'registrar',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'realmAuthority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'timeOffset',
          type: 'i64',
        },
      ],
    },
    {
      name: 'unlockDeposit',
      docs: [
        '_Requires signing by the VotingMintConfig.grant_authority or Registrar.realm_authority_',
        'Makes all tokens in a DepositEntry available for immediate withdrawal.',
      ],
      accounts: [
        {
          name: 'registrar',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'voter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'voterAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'grantAuthority',
          isMut: false,
          isSigner: true,
          docs: [
            'Authority for making a grant to this voter account',
            '',
            'Instruction validates grant_authority is the VotingMintConfig.grant_authority or',
            'Registrar.realm_authority.',
          ],
        },
      ],
      args: [
        {
          name: 'depositEntryIndex',
          type: 'u8',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'registrar',
      docs: ['Instance of a voting rights distributor.'],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'governanceProgramId',
            type: 'publicKey',
          },
          {
            name: 'realm',
            type: 'publicKey',
          },
          {
            name: 'realmGoverningTokenMint',
            type: 'publicKey',
          },
          {
            name: 'realmAuthority',
            type: 'publicKey',
          },
          {
            name: 'reserved1',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'votingMints',
            docs: [
              'Storage for voting mints and their configuration.',
              "The length should be adjusted for one's use case.",
            ],
            type: {
              array: [
                {
                  defined: 'VotingMintConfig',
                },
                4,
              ],
            },
          },
          {
            name: 'timeOffset',
            docs: [
              'Debug only: time offset, to allow tests to move forward in time.',
            ],
            type: 'i64',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'reserved2',
            type: {
              array: ['u8', 7],
            },
          },
          {
            name: 'reserved3',
            type: {
              array: ['u64', 11],
            },
          },
        ],
      },
    },
    {
      name: 'voter',
      docs: ['User account for minting voting rights.'],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'voterAuthority',
            type: 'publicKey',
          },
          {
            name: 'registrar',
            type: 'publicKey',
          },
          {
            name: 'deposits',
            type: {
              array: [
                {
                  defined: 'DepositEntry',
                },
                32,
              ],
            },
          },
          {
            name: 'voterBump',
            type: 'u8',
          },
          {
            name: 'voterWeightRecordBump',
            type: 'u8',
          },
          {
            name: 'reserved',
            type: {
              array: ['u8', 94],
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'VestingInfo',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'rate',
            docs: ['Amount of tokens vested each period'],
            type: 'u64',
          },
          {
            name: 'nextTimestamp',
            docs: ['Time of the next upcoming vesting'],
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'LockingInfo',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amount',
            docs: ['Amount of locked tokens'],
            type: 'u64',
          },
          {
            name: 'endTimestamp',
            docs: [
              'Time at which the lockup fully ends (None for Constant lockup)',
            ],
            type: {
              option: 'u64',
            },
          },
          {
            name: 'vesting',
            docs: ['Information about vesting, if any'],
            type: {
              option: {
                defined: 'VestingInfo',
              },
            },
          },
        ],
      },
    },
    {
      name: 'DepositEntry',
      docs: [
        'Bookkeeping for a single deposit for a given mint and lockup schedule.',
      ],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'lockup',
            type: {
              defined: 'Lockup',
            },
          },
          {
            name: 'amountDepositedNative',
            docs: [
              'Amount in deposited, in native currency. Withdraws of vested tokens',
              'directly reduce this amount.',
              '',
              'This directly tracks the total amount added by the user. They may',
              'never withdraw more than this amount.',
            ],
            type: 'u64',
          },
          {
            name: 'amountInitiallyLockedNative',
            docs: [
              'Amount in locked when the lockup began, in native currency.',
              '',
              'Note that this is not adjusted for withdraws. It is possible for this',
              'value to be bigger than amount_deposited_native after some vesting',
              'and withdrawals.',
              '',
              'This value is needed to compute the amount that vests each peroid,',
              'which should not change due to withdraws.',
            ],
            type: 'u64',
          },
          {
            name: 'isUsed',
            type: 'bool',
          },
          {
            name: 'allowClawback',
            docs: [
              'If the clawback authority is allowed to extract locked tokens.',
            ],
            type: 'bool',
          },
          {
            name: 'votingMintConfigIdx',
            type: 'u8',
          },
          {
            name: 'reserved',
            type: {
              array: ['u8', 29],
            },
          },
        ],
      },
    },
    {
      name: 'Lockup',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'startTs',
            docs: [
              'Start of the lockup.',
              '',
              'Note, that if start_ts is in the future, the funds are nevertheless',
              'locked up!',
              '',
              "Similarly vote power computations don't care about start_ts and always",
              'assume the full interval from now to end_ts.',
            ],
            type: 'i64',
          },
          {
            name: 'endTs',
            docs: ['End of the lockup.'],
            type: 'i64',
          },
          {
            name: 'kind',
            docs: ['Type of lockup.'],
            type: {
              defined: 'LockupKind',
            },
          },
          {
            name: 'reserved',
            type: {
              array: ['u8', 15],
            },
          },
        ],
      },
    },
    {
      name: 'VotingMintConfig',
      docs: [
        'Exchange rate for an asset that can be used to mint voting rights.',
        '',
        'See documentation of configure_voting_mint for details on how',
        'native token amounts convert to vote weight.',
      ],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'mint',
            docs: ['Mint for this entry.'],
            type: 'publicKey',
          },
          {
            name: 'grantAuthority',
            docs: ['The authority that is allowed to push grants into voters'],
            type: 'publicKey',
          },
          {
            name: 'baselineVoteWeightScaledFactor',
            docs: [
              'Vote weight factor for all funds in the account, no matter if locked or not.',
              '',
              'In 1/SCALED_FACTOR_BASE units.',
            ],
            type: 'u64',
          },
          {
            name: 'maxExtraLockupVoteWeightScaledFactor',
            docs: [
              'Maximum extra vote weight factor for lockups.',
              '',
              'This is the extra votes gained for lockups lasting lockup_saturation_secs or',
              'longer. Shorter lockups receive only a fraction of the maximum extra vote weight,',
              'based on lockup_time divided by lockup_saturation_secs.',
              '',
              'In 1/SCALED_FACTOR_BASE units.',
            ],
            type: 'u64',
          },
          {
            name: 'lockupSaturationSecs',
            docs: [
              'Number of seconds of lockup needed to reach the maximum lockup bonus.',
            ],
            type: 'u64',
          },
          {
            name: 'digitShift',
            docs: [
              'Number of digits to shift native amounts, applying a 10^digit_shift factor.',
            ],
            type: 'i8',
          },
          {
            name: 'reserved1',
            type: {
              array: ['u8', 7],
            },
          },
          {
            name: 'reserved2',
            type: {
              array: ['u64', 7],
            },
          },
        ],
      },
    },
    {
      name: 'LockupKind',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'None',
          },
          {
            name: 'Daily',
          },
          {
            name: 'Monthly',
          },
          {
            name: 'Cliff',
          },
          {
            name: 'Constant',
          },
        ],
      },
    },
  ],
  events: [
    {
      name: 'VoterInfo',
      fields: [
        {
          name: 'votingPower',
          type: 'u64',
          index: false,
        },
        {
          name: 'votingPowerBaseline',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'DepositEntryInfo',
      fields: [
        {
          name: 'depositEntryIndex',
          type: 'u8',
          index: false,
        },
        {
          name: 'votingMintConfigIndex',
          type: 'u8',
          index: false,
        },
        {
          name: 'unlocked',
          type: 'u64',
          index: false,
        },
        {
          name: 'votingPower',
          type: 'u64',
          index: false,
        },
        {
          name: 'votingPowerBaseline',
          type: 'u64',
          index: false,
        },
        {
          name: 'locking',
          type: {
            option: {
              defined: 'LockingInfo',
            },
          },
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'InvalidRate',
      msg: 'Exchange rate must be greater than zero',
    },
    {
      code: 6001,
      name: 'RatesFull',
      msg: '',
    },
    {
      code: 6002,
      name: 'VotingMintNotFound',
      msg: '',
    },
    {
      code: 6003,
      name: 'DepositEntryNotFound',
      msg: '',
    },
    {
      code: 6004,
      name: 'DepositEntryFull',
      msg: '',
    },
    {
      code: 6005,
      name: 'VotingTokenNonZero',
      msg: '',
    },
    {
      code: 6006,
      name: 'OutOfBoundsDepositEntryIndex',
      msg: '',
    },
    {
      code: 6007,
      name: 'UnusedDepositEntryIndex',
      msg: '',
    },
    {
      code: 6008,
      name: 'InsufficientUnlockedTokens',
      msg: '',
    },
    {
      code: 6009,
      name: 'UnableToConvert',
      msg: '',
    },
    {
      code: 6010,
      name: 'InvalidLockupPeriod',
      msg: '',
    },
    {
      code: 6011,
      name: 'InvalidEndTs',
      msg: '',
    },
    {
      code: 6012,
      name: 'InvalidDays',
      msg: '',
    },
    {
      code: 6013,
      name: 'VotingMintConfigIndexAlreadyInUse',
      msg: '',
    },
    {
      code: 6014,
      name: 'OutOfBoundsVotingMintConfigIndex',
      msg: '',
    },
    {
      code: 6015,
      name: 'InvalidDecimals',
      msg: 'Exchange rate decimals cannot be larger than registrar decimals',
    },
    {
      code: 6016,
      name: 'InvalidToDepositAndWithdrawInOneSlot',
      msg: '',
    },
    {
      code: 6017,
      name: 'ShouldBeTheFirstIxInATx',
      msg: '',
    },
    {
      code: 6018,
      name: 'ForbiddenCpi',
      msg: '',
    },
    {
      code: 6019,
      name: 'InvalidMint',
      msg: '',
    },
    {
      code: 6020,
      name: 'DebugInstruction',
      msg: '',
    },
    {
      code: 6021,
      name: 'ClawbackNotAllowedOnDeposit',
      msg: '',
    },
    {
      code: 6022,
      name: 'DepositStillLocked',
      msg: '',
    },
    {
      code: 6023,
      name: 'InvalidAuthority',
      msg: '',
    },
    {
      code: 6024,
      name: 'InvalidTokenOwnerRecord',
      msg: '',
    },
    {
      code: 6025,
      name: 'InvalidRealmAuthority',
      msg: '',
    },
    {
      code: 6026,
      name: 'VoterWeightOverflow',
      msg: '',
    },
    {
      code: 6027,
      name: 'LockupSaturationMustBePositive',
      msg: '',
    },
    {
      code: 6028,
      name: 'VotingMintConfiguredWithDifferentIndex',
      msg: '',
    },
    {
      code: 6029,
      name: 'InternalProgramError',
      msg: '',
    },
    {
      code: 6030,
      name: 'InsufficientLockedTokens',
      msg: '',
    },
    {
      code: 6031,
      name: 'MustKeepTokensLocked',
      msg: '',
    },
    {
      code: 6032,
      name: 'InvalidLockupKind',
      msg: '',
    },
    {
      code: 6033,
      name: 'InvalidChangeToClawbackDepositEntry',
      msg: '',
    },
    {
      code: 6034,
      name: 'InternalErrorBadLockupVoteWeight',
      msg: '',
    },
    {
      code: 6035,
      name: 'DepositStartTooFarInFuture',
      msg: '',
    },
    {
      code: 6036,
      name: 'VaultTokenNonZero',
      msg: '',
    },
    {
      code: 6037,
      name: 'InvalidTimestampArguments',
      msg: '',
    },
    {
      code: 6038,
      name: 'BadUnlockDepositAuthority',
      msg: '',
    },
    {
      code: 6039,
      name: 'MintConfigNotUsed',
      msg: '',
    },
  ],
}
