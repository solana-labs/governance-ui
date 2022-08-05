export type VoterStakeRegistry = {
  version: '0.2.4'
  name: 'voter_stake_registry'
  instructions: [
    {
      name: 'createRegistrar'
      accounts: [
        {
          name: 'registrar'
          isMut: true
          isSigner: false
        },
        {
          name: 'realm'
          isMut: false
          isSigner: false
        },
        {
          name: 'governanceProgramId'
          isMut: false
          isSigner: false
        },
        {
          name: 'realmGoverningTokenMint'
          isMut: false
          isSigner: false
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
        },
        {
          name: 'voterWeightRecord'
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
        },
        {
          name: 'voterWeightRecord'
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
          name: 'tokenAuthority'
          isMut: false
          isSigner: true
        },
        {
          name: 'grantAuthority'
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
    }
  ]
  accounts: [
    {
      name: 'registrar'
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
            type: 'u64'
          },
          {
            name: 'nextTimestamp'
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
            type: 'u64'
          },
          {
            name: 'endTimestamp'
            type: {
              option: 'u64'
            }
          },
          {
            name: 'vesting'
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
            type: 'u64'
          },
          {
            name: 'amountInitiallyLockedNative'
            type: 'u64'
          },
          {
            name: 'isUsed'
            type: 'bool'
          },
          {
            name: 'allowClawback'
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
            type: 'i64'
          },
          {
            name: 'endTs'
            type: 'i64'
          },
          {
            name: 'kind'
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
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'mint'
            type: 'publicKey'
          },
          {
            name: 'grantAuthority'
            type: 'publicKey'
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
            name: 'digitShift'
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
    }
  ]
}

export const IDL: VoterStakeRegistry = {
  version: '0.2.4',
  name: 'voter_stake_registry',
  instructions: [
    {
      name: 'createRegistrar',
      accounts: [
        {
          name: 'registrar',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'realm',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceProgramId',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'realmGoverningTokenMint',
          isMut: false,
          isSigner: false,
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
        },
        {
          name: 'voterWeightRecord',
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
        },
        {
          name: 'voterWeightRecord',
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
          name: 'tokenAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'grantAuthority',
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
  ],
  accounts: [
    {
      name: 'registrar',
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
            type: 'u64',
          },
          {
            name: 'nextTimestamp',
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
            type: 'u64',
          },
          {
            name: 'endTimestamp',
            type: {
              option: 'u64',
            },
          },
          {
            name: 'vesting',
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
            type: 'u64',
          },
          {
            name: 'amountInitiallyLockedNative',
            type: 'u64',
          },
          {
            name: 'isUsed',
            type: 'bool',
          },
          {
            name: 'allowClawback',
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
            type: 'i64',
          },
          {
            name: 'endTs',
            type: 'i64',
          },
          {
            name: 'kind',
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
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'mint',
            type: 'publicKey',
          },
          {
            name: 'grantAuthority',
            type: 'publicKey',
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
            name: 'digitShift',
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
  ],
}
