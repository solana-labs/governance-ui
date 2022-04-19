export type Switchboard = {
  "version": "0.0.0",
  "name": "switchboard_v2",
  "instructions": [
    {
      "name": "aggregatorAddJob",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "job",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorAddJobParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorInit",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "queue",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authorWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorInitParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorLock",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorLockParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorOpenRound",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "queueAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "permission",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payoutWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dataBuffer",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorOpenRoundParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorRemoveJob",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "job",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorRemoveJobParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSaveResult",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "oracleQueue",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "queueAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feedPermission",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oraclePermission",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "historyBuffer",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSaveResultParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSetAuthority",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSetAuthorityParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSetBatchSize",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSetBatchSizeParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSetHistoryBuffer",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "buffer",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSetHistoryBufferParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSetMinJobs",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSetMinJobsParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSetMinOracles",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSetMinOraclesParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSetQueue",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "queue",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSetQueueParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSetUpdateInterval",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSetUpdateIntervalParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSetVarianceThreshold",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSetVarianceThresholdParams"
          }
        }
      ]
    },
    {
      "name": "crankInit",
      "accounts": [
        {
          "name": "crank",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "queue",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buffer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CrankInitParams"
          }
        }
      ]
    },
    {
      "name": "crankPop",
      "accounts": [
        {
          "name": "crank",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "queueAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payoutWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "crankDataBuffer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "queueDataBuffer",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CrankPopParams"
          }
        }
      ]
    },
    {
      "name": "crankPush",
      "accounts": [
        {
          "name": "crank",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "queueAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "permission",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dataBuffer",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CrankPushParams"
          }
        }
      ]
    },
    {
      "name": "jobInit",
      "accounts": [
        {
          "name": "job",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authorWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "JobInitParams"
          }
        }
      ]
    },
    {
      "name": "leaseExtend",
      "accounts": [
        {
          "name": "lease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aggregator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "queue",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "funder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "LeaseExtendParams"
          }
        }
      ]
    },
    {
      "name": "leaseInit",
      "accounts": [
        {
          "name": "lease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "queue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aggregator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "funder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "LeaseInitParams"
          }
        }
      ]
    },
    {
      "name": "leaseSetAuthority",
      "accounts": [
        {
          "name": "lease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "withdrawAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "LeaseSetAuthorityParams"
          }
        }
      ]
    },
    {
      "name": "leaseWithdraw",
      "accounts": [
        {
          "name": "lease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aggregator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "queue",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "withdrawAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "withdrawAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "LeaseWithdrawParams"
          }
        }
      ]
    },
    {
      "name": "oracleHeartbeat",
      "accounts": [
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gcOracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "permission",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dataBuffer",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "OracleHeartbeatParams"
          }
        }
      ]
    },
    {
      "name": "oracleInit",
      "accounts": [
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "queue",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "OracleInitParams"
          }
        }
      ]
    },
    {
      "name": "oracleQueueInit",
      "accounts": [
        {
          "name": "oracleQueue",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buffer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "OracleQueueInitParams"
          }
        }
      ]
    },
    {
      "name": "oracleQueueSetRewards",
      "accounts": [
        {
          "name": "queue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "OracleQueueSetRewardsParams"
          }
        }
      ]
    },
    {
      "name": "oracleQueueVrfConfig",
      "accounts": [
        {
          "name": "queue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "OracleQueueVrfConfigParams"
          }
        }
      ]
    },
    {
      "name": "oracleWithdraw",
      "accounts": [
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "withdrawAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "permission",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "OracleWithdrawParams"
          }
        }
      ]
    },
    {
      "name": "permissionInit",
      "accounts": [
        {
          "name": "permission",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "granter",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "grantee",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "PermissionInitParams"
          }
        }
      ]
    },
    {
      "name": "permissionSet",
      "accounts": [
        {
          "name": "permission",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "PermissionSetParams"
          }
        }
      ]
    },
    {
      "name": "permissionSetVoterWeight",
      "accounts": [
        {
          "name": "permission",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "permissionAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracleAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "govProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "daoMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "spawnRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterWeight",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenOwnerRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "PermissionSetVoterWeightParams"
          }
        }
      ]
    },
    {
      "name": "programConfig",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "daoMint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "ProgramConfigParams"
          }
        }
      ]
    },
    {
      "name": "programInit",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "daoMint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "ProgramInitParams"
          }
        }
      ]
    },
    {
      "name": "vaultTransfer",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "VaultTransferParams"
          }
        }
      ]
    },
    {
      "name": "vrfInit",
      "accounts": [
        {
          "name": "vrf",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracleQueue",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "VrfInitParams"
          }
        }
      ]
    },
    {
      "name": "vrfProve",
      "accounts": [
        {
          "name": "vrf",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "randomnessProducer",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "VrfProveParams"
          }
        }
      ]
    },
    {
      "name": "vrfProveAndVerify",
      "accounts": [
        {
          "name": "vrf",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callbackPid",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracleAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "oracleWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "instructionsSysvar",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "VrfProveAndVerifyParams"
          }
        }
      ]
    },
    {
      "name": "vrfRequestRandomness",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "vrf",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "queueAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dataBuffer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "permission",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "recentBlockhashes",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "VrfRequestRandomnessParams"
          }
        }
      ]
    },
    {
      "name": "vrfVerify",
      "accounts": [
        {
          "name": "vrf",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callbackPid",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracleAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracleWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "instructionsSysvar",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "VrfVerifyParams"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "SbState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "tokenVault",
            "type": "publicKey"
          },
          {
            "name": "daoMint",
            "type": "publicKey"
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                992
              ]
            }
          }
        ]
      }
    },
    {
      "name": "AggregatorAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "authorWallet",
            "type": "publicKey"
          },
          {
            "name": "queuePubkey",
            "type": "publicKey"
          },
          {
            "name": "oracleRequestBatchSize",
            "type": "u32"
          },
          {
            "name": "minOracleResults",
            "type": "u32"
          },
          {
            "name": "minJobResults",
            "type": "u32"
          },
          {
            "name": "minUpdateDelaySeconds",
            "type": "u32"
          },
          {
            "name": "startAfter",
            "type": "i64"
          },
          {
            "name": "varianceThreshold",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          },
          {
            "name": "forceReportPeriod",
            "type": "i64"
          },
          {
            "name": "expiration",
            "type": "i64"
          },
          {
            "name": "consecutiveFailureCount",
            "type": "u64"
          },
          {
            "name": "nextAllowedUpdateTime",
            "type": "i64"
          },
          {
            "name": "isLocked",
            "type": "bool"
          },
          {
            "name": "crankPubkey",
            "type": "publicKey"
          },
          {
            "name": "latestConfirmedRound",
            "type": {
              "defined": "AggregatorRound"
            }
          },
          {
            "name": "currentRound",
            "type": {
              "defined": "AggregatorRound"
            }
          },
          {
            "name": "jobPubkeysData",
            "type": {
              "array": [
                "publicKey",
                16
              ]
            }
          },
          {
            "name": "jobHashes",
            "type": {
              "array": [
                {
                  "defined": "Hash"
                },
                16
              ]
            }
          },
          {
            "name": "jobPubkeysSize",
            "type": "u32"
          },
          {
            "name": "jobsChecksum",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "historyBuffer",
            "type": "publicKey"
          },
          {
            "name": "previousConfirmedRoundResult",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          },
          {
            "name": "previousConfirmedRoundSlot",
            "type": "u64"
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                164
              ]
            }
          }
        ]
      }
    },
    {
      "name": "PermissionAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "permissions",
            "type": "u32"
          },
          {
            "name": "granter",
            "type": "publicKey"
          },
          {
            "name": "grantee",
            "type": "publicKey"
          },
          {
            "name": "expiration",
            "type": "i64"
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          }
        ]
      }
    },
    {
      "name": "RealmSpawnRecordAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          }
        ]
      }
    },
    {
      "name": "LeaseAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrow",
            "type": "publicKey"
          },
          {
            "name": "queue",
            "type": "publicKey"
          },
          {
            "name": "aggregator",
            "type": "publicKey"
          },
          {
            "name": "tokenProgram",
            "type": "publicKey"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "crankRowCount",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updateCount",
            "type": "u128"
          },
          {
            "name": "withdrawAuthority",
            "type": "publicKey"
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          }
        ]
      }
    },
    {
      "name": "OracleQueueAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "oracleTimeout",
            "type": "u32"
          },
          {
            "name": "reward",
            "type": "u64"
          },
          {
            "name": "minStake",
            "type": "u64"
          },
          {
            "name": "slashingEnabled",
            "type": "bool"
          },
          {
            "name": "varianceToleranceMultiplier",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          },
          {
            "name": "feedProbationPeriod",
            "type": "u32"
          },
          {
            "name": "currIdx",
            "type": "u32"
          },
          {
            "name": "size",
            "type": "u32"
          },
          {
            "name": "gcIdx",
            "type": "u32"
          },
          {
            "name": "consecutiveFeedFailureLimit",
            "type": "u64"
          },
          {
            "name": "consecutiveOracleFailureLimit",
            "type": "u64"
          },
          {
            "name": "unpermissionedFeedsEnabled",
            "type": "bool"
          },
          {
            "name": "unpermissionedVrfEnabled",
            "type": "bool"
          },
          {
            "name": "curatorRewardCut",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          },
          {
            "name": "lockLeaseFunding",
            "type": "bool"
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                1001
              ]
            }
          },
          {
            "name": "maxSize",
            "type": "u32"
          },
          {
            "name": "dataBuffer",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "CrankAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "queuePubkey",
            "type": "publicKey"
          },
          {
            "name": "pqSize",
            "type": "u32"
          },
          {
            "name": "maxRows",
            "type": "u32"
          },
          {
            "name": "jitterModifier",
            "type": "u8"
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                255
              ]
            }
          },
          {
            "name": "dataBuffer",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "OracleAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "oracleAuthority",
            "type": "publicKey"
          },
          {
            "name": "lastHeartbeat",
            "type": "i64"
          },
          {
            "name": "numInUse",
            "type": "u32"
          },
          {
            "name": "tokenAccount",
            "type": "publicKey"
          },
          {
            "name": "queuePubkey",
            "type": "publicKey"
          },
          {
            "name": "metrics",
            "type": {
              "defined": "OracleMetrics"
            }
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          }
        ]
      }
    },
    {
      "name": "JobAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "authorWallet",
            "type": "publicKey"
          },
          {
            "name": "expiration",
            "type": "i64"
          },
          {
            "name": "hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "data",
            "type": "bytes"
          },
          {
            "name": "referenceCount",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "VrfAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "status",
            "type": {
              "defined": "VrfStatus"
            }
          },
          {
            "name": "counter",
            "type": "u128"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "oracleQueue",
            "type": "publicKey"
          },
          {
            "name": "escrow",
            "type": "publicKey"
          },
          {
            "name": "callback",
            "type": {
              "defined": "CallbackZC"
            }
          },
          {
            "name": "batchSize",
            "type": "u32"
          },
          {
            "name": "builders",
            "type": {
              "array": [
                {
                  "defined": "VrfBuilder"
                },
                8
              ]
            }
          },
          {
            "name": "buildersLen",
            "type": "u32"
          },
          {
            "name": "testMode",
            "type": "bool"
          },
          {
            "name": "currentRound",
            "type": {
              "defined": "VrfRound"
            }
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                1024
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "AggregatorAddJobParams",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "AggregatorInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "batchSize",
            "type": "u32"
          },
          {
            "name": "minOracleResults",
            "type": "u32"
          },
          {
            "name": "minJobResults",
            "type": "u32"
          },
          {
            "name": "minUpdateDelaySeconds",
            "type": "u32"
          },
          {
            "name": "startAfter",
            "type": "i64"
          },
          {
            "name": "varianceThreshold",
            "type": {
              "defined": "BorshDecimal"
            }
          },
          {
            "name": "forceReportPeriod",
            "type": "i64"
          },
          {
            "name": "expiration",
            "type": "i64"
          },
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "AggregatorLockParams",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "AggregatorOpenRoundParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "leaseBump",
            "type": "u8"
          },
          {
            "name": "permissionBump",
            "type": "u8"
          },
          {
            "name": "jitter",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "AggregatorRemoveJobParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "jobIdx",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "AggregatorSaveResultParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oracleIdx",
            "type": "u32"
          },
          {
            "name": "error",
            "type": "bool"
          },
          {
            "name": "value",
            "type": {
              "defined": "BorshDecimal"
            }
          },
          {
            "name": "jobsChecksum",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "minResponse",
            "type": {
              "defined": "BorshDecimal"
            }
          },
          {
            "name": "maxResponse",
            "type": {
              "defined": "BorshDecimal"
            }
          },
          {
            "name": "feedPermissionBump",
            "type": "u8"
          },
          {
            "name": "oraclePermissionBump",
            "type": "u8"
          },
          {
            "name": "leaseBump",
            "type": "u8"
          },
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "AggregatorSetAuthorityParams",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "AggregatorSetBatchSizeParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "batchSize",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "AggregatorSetHistoryBufferParams",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "AggregatorSetMinJobsParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "minJobResults",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "AggregatorSetMinOraclesParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "minOracleResults",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "AggregatorSetQueueParams",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "AggregatorSetUpdateIntervalParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newInterval",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "AggregatorSetVarianceThresholdParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "varianceThreshold",
            "type": {
              "defined": "BorshDecimal"
            }
          }
        ]
      }
    },
    {
      "name": "CrankInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "bytes"
          },
          {
            "name": "metadata",
            "type": "bytes"
          },
          {
            "name": "crankSize",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "CrankPopParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "leaseBumps",
            "type": "bytes"
          },
          {
            "name": "permissionBumps",
            "type": "bytes"
          },
          {
            "name": "nonce",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "failOpenOnAccountMismatch",
            "type": {
              "option": "bool"
            }
          }
        ]
      }
    },
    {
      "name": "CrankPushParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "permissionBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "JobInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "expiration",
            "type": "i64"
          },
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "data",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "LeaseExtendParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "loadAmount",
            "type": "u64"
          },
          {
            "name": "leaseBump",
            "type": "u8"
          },
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "LeaseInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "loadAmount",
            "type": "u64"
          },
          {
            "name": "withdrawAuthority",
            "type": "publicKey"
          },
          {
            "name": "leaseBump",
            "type": "u8"
          },
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "LeaseSetAuthorityParams",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "LeaseWithdrawParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "leaseBump",
            "type": "u8"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "OracleHeartbeatParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "permissionBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "OracleInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "bytes"
          },
          {
            "name": "metadata",
            "type": "bytes"
          },
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "oracleBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "OracleQueueInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "reward",
            "type": "u64"
          },
          {
            "name": "minStake",
            "type": "u64"
          },
          {
            "name": "feedProbationPeriod",
            "type": "u32"
          },
          {
            "name": "oracleTimeout",
            "type": "u32"
          },
          {
            "name": "slashingEnabled",
            "type": "bool"
          },
          {
            "name": "varianceToleranceMultiplier",
            "type": {
              "defined": "BorshDecimal"
            }
          },
          {
            "name": "consecutiveFeedFailureLimit",
            "type": "u64"
          },
          {
            "name": "consecutiveOracleFailureLimit",
            "type": "u64"
          },
          {
            "name": "queueSize",
            "type": "u32"
          },
          {
            "name": "unpermissionedFeeds",
            "type": "bool"
          },
          {
            "name": "unpermissionedVrf",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "OracleQueueSetRewardsParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rewards",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "OracleQueueVrfConfigParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "unpermissionedVrfEnabled",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "OracleWithdrawParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "permissionBump",
            "type": "u8"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "PermissionInitParams",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "PermissionSetParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "permission",
            "type": {
              "defined": "SwitchboardPermission"
            }
          },
          {
            "name": "enable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "PermissionSetVoterWeightParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "ProgramConfigParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "token",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "daoMint",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "ProgramInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "Hash",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "AggregatorRound",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "numSuccess",
            "type": "u32"
          },
          {
            "name": "numError",
            "type": "u32"
          },
          {
            "name": "isClosed",
            "type": "bool"
          },
          {
            "name": "roundOpenSlot",
            "type": "u64"
          },
          {
            "name": "roundOpenTimestamp",
            "type": "i64"
          },
          {
            "name": "result",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          },
          {
            "name": "stdDeviation",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          },
          {
            "name": "minResponse",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          },
          {
            "name": "maxResponse",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          },
          {
            "name": "oraclePubkeysData",
            "type": {
              "array": [
                "publicKey",
                16
              ]
            }
          },
          {
            "name": "mediansData",
            "type": {
              "array": [
                {
                  "defined": "SwitchboardDecimal"
                },
                16
              ]
            }
          },
          {
            "name": "currentPayout",
            "type": {
              "array": [
                "i64",
                16
              ]
            }
          },
          {
            "name": "mediansFulfilled",
            "type": {
              "array": [
                "bool",
                16
              ]
            }
          },
          {
            "name": "errorsFulfilled",
            "type": {
              "array": [
                "bool",
                16
              ]
            }
          }
        ]
      }
    },
    {
      "name": "AggregatorHistoryRow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "value",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          }
        ]
      }
    },
    {
      "name": "SwitchboardDecimal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mantissa",
            "type": "i128"
          },
          {
            "name": "scale",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "CrankRow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "publicKey"
          },
          {
            "name": "nextTimestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "OracleMetrics",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "consecutiveSuccess",
            "type": "u64"
          },
          {
            "name": "consecutiveError",
            "type": "u64"
          },
          {
            "name": "consecutiveDisagreement",
            "type": "u64"
          },
          {
            "name": "consecutiveLateResponse",
            "type": "u64"
          },
          {
            "name": "consecutiveFailure",
            "type": "u64"
          },
          {
            "name": "totalSuccess",
            "type": "u128"
          },
          {
            "name": "totalError",
            "type": "u128"
          },
          {
            "name": "totalDisagreement",
            "type": "u128"
          },
          {
            "name": "totalLateResponse",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "BorshDecimal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mantissa",
            "type": "i128"
          },
          {
            "name": "scale",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "EcvrfProofZC",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gamma",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "c",
            "type": {
              "defined": "Scalar"
            }
          },
          {
            "name": "s",
            "type": {
              "defined": "Scalar"
            }
          }
        ]
      }
    },
    {
      "name": "Scalar",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bytes",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "FieldElementZC",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bytes",
            "type": {
              "array": [
                "u64",
                5
              ]
            }
          }
        ]
      }
    },
    {
      "name": "CompletedPointZC",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "x",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "y",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "z",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "t",
            "type": {
              "defined": "FieldElementZC"
            }
          }
        ]
      }
    },
    {
      "name": "EdwardsPointZC",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "x",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "y",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "z",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "t",
            "type": {
              "defined": "FieldElementZC"
            }
          }
        ]
      }
    },
    {
      "name": "ProjectivePointZC",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "x",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "y",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "z",
            "type": {
              "defined": "FieldElementZC"
            }
          }
        ]
      }
    },
    {
      "name": "EcvrfIntermediate",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "r",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "nS",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "d",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "t13",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "t15",
            "type": {
              "defined": "FieldElementZC"
            }
          }
        ]
      }
    },
    {
      "name": "VrfBuilder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "producer",
            "type": "publicKey"
          },
          {
            "name": "status",
            "type": {
              "defined": "VrfStatus"
            }
          },
          {
            "name": "reprProof",
            "type": {
              "array": [
                "u8",
                80
              ]
            }
          },
          {
            "name": "proof",
            "type": {
              "defined": "EcvrfProofZC"
            }
          },
          {
            "name": "yPoint",
            "type": "publicKey"
          },
          {
            "name": "stage",
            "type": "u32"
          },
          {
            "name": "stage1Out",
            "type": {
              "defined": "EcvrfIntermediate"
            }
          },
          {
            "name": "r1",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "r2",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "stage3Out",
            "type": {
              "defined": "EcvrfIntermediate"
            }
          },
          {
            "name": "hPoint",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "sReduced",
            "type": {
              "defined": "Scalar"
            }
          },
          {
            "name": "yPointBuilder",
            "type": {
              "array": [
                {
                  "defined": "FieldElementZC"
                },
                3
              ]
            }
          },
          {
            "name": "yRistrettoPoint",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "mulRound",
            "type": "u8"
          },
          {
            "name": "hashPointsRound",
            "type": "u8"
          },
          {
            "name": "mulTmp1",
            "type": {
              "defined": "CompletedPointZC"
            }
          },
          {
            "name": "uPoint1",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "uPoint2",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "vPoint1",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "vPoint2",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "uPoint",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "vPoint",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "u1",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "u2",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "invertee",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "y",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "z",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "p1Bytes",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "p2Bytes",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "p3Bytes",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "p4Bytes",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "cPrimeHashbuf",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "m1",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "m2",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "txRemaining",
            "type": "u32"
          },
          {
            "name": "verified",
            "type": "bool"
          },
          {
            "name": "result",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "AccountMetaZC",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "publicKey"
          },
          {
            "name": "isSigner",
            "type": "bool"
          },
          {
            "name": "isWritable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "AccountMetaBorsh",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "publicKey"
          },
          {
            "name": "isSigner",
            "type": "bool"
          },
          {
            "name": "isWritable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "CallbackZC",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "programId",
            "type": "publicKey"
          },
          {
            "name": "accounts",
            "type": {
              "array": [
                {
                  "defined": "AccountMetaZC"
                },
                32
              ]
            }
          },
          {
            "name": "accountsLen",
            "type": "u32"
          },
          {
            "name": "ixData",
            "type": {
              "array": [
                "u8",
                1024
              ]
            }
          },
          {
            "name": "ixDataLen",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "Callback",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "programId",
            "type": "publicKey"
          },
          {
            "name": "accounts",
            "type": {
              "vec": {
                "defined": "AccountMetaBorsh"
              }
            }
          },
          {
            "name": "ixData",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "VrfRound",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "alpha",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          },
          {
            "name": "alphaLen",
            "type": "u32"
          },
          {
            "name": "requestSlot",
            "type": "u64"
          },
          {
            "name": "requestTimestamp",
            "type": "i64"
          },
          {
            "name": "result",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "numVerified",
            "type": "u32"
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          }
        ]
      }
    },
    {
      "name": "VaultTransferParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "VrfInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "callback",
            "type": {
              "defined": "Callback"
            }
          },
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "VrfProveParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proof",
            "type": "bytes"
          },
          {
            "name": "idx",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "VrfProveAndVerifyParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "idx",
            "type": "u32"
          },
          {
            "name": "proof",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "VrfRequestRandomnessParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "permissionBump",
            "type": "u8"
          },
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "VrfVerifyParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "idx",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "SwitchboardPermission",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "PermitOracleHeartbeat"
          },
          {
            "name": "PermitOracleQueueUsage"
          },
          {
            "name": "PermitVrfRequests"
          }
        ]
      }
    },
    {
      "name": "OracleResponseType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "TypeSuccess"
          },
          {
            "name": "TypeError"
          },
          {
            "name": "TypeDisagreement"
          },
          {
            "name": "TypeNoResponse"
          }
        ]
      }
    },
    {
      "name": "SwitchboardError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "ArrayOperationError"
          },
          {
            "name": "QueueOperationError"
          },
          {
            "name": "IncorrectProgramOwnerError"
          },
          {
            "name": "InvalidAggregatorRound"
          },
          {
            "name": "TooManyAggregatorJobs"
          },
          {
            "name": "AggregatorCurrentRoundClosed"
          },
          {
            "name": "AggregatorInvalidSaveResult"
          },
          {
            "name": "InvalidStrDecimalConversion"
          },
          {
            "name": "AccountLoaderMissingSignature"
          },
          {
            "name": "MissingRequiredSignature"
          },
          {
            "name": "ArrayOverflowError"
          },
          {
            "name": "ArrayUnderflowError"
          },
          {
            "name": "PubkeyNotFoundError"
          },
          {
            "name": "AggregatorIllegalRoundOpenCall"
          },
          {
            "name": "AggregatorIllegalRoundCloseCall"
          },
          {
            "name": "AggregatorClosedError"
          },
          {
            "name": "IllegalOracleIdxError"
          },
          {
            "name": "OracleAlreadyRespondedError"
          },
          {
            "name": "ProtoDeserializeError"
          },
          {
            "name": "UnauthorizedStateUpdateError"
          },
          {
            "name": "MissingOracleAccountsError"
          },
          {
            "name": "OracleMismatchError"
          },
          {
            "name": "CrankMaxCapacityError"
          },
          {
            "name": "AggregatorLeaseInsufficientFunds"
          },
          {
            "name": "IncorrectTokenAccountMint"
          },
          {
            "name": "InvalidEscrowAccount"
          },
          {
            "name": "CrankEmptyError"
          },
          {
            "name": "PdaDeriveError"
          },
          {
            "name": "AggregatorAccountNotFound"
          },
          {
            "name": "PermissionAccountNotFound"
          },
          {
            "name": "LeaseAccountDeriveFailure"
          },
          {
            "name": "PermissionAccountDeriveFailure"
          },
          {
            "name": "EscrowAccountNotFound"
          },
          {
            "name": "LeaseAccountNotFound"
          },
          {
            "name": "DecimalConversionError"
          },
          {
            "name": "PermissionDenied"
          },
          {
            "name": "QueueAtCapacity"
          },
          {
            "name": "ExcessiveCrankRowsError"
          },
          {
            "name": "AggregatorLockedError"
          },
          {
            "name": "AggregatorInvalidBatchSizeError"
          },
          {
            "name": "AggregatorJobChecksumMismatch"
          },
          {
            "name": "IntegerOverflowError"
          },
          {
            "name": "InvalidUpdatePeriodError"
          },
          {
            "name": "NoResultsError"
          },
          {
            "name": "InvalidExpirationError"
          },
          {
            "name": "InsufficientStakeError"
          },
          {
            "name": "LeaseInactiveError"
          },
          {
            "name": "NoAggregatorJobsFound"
          },
          {
            "name": "IntegerUnderflowError"
          },
          {
            "name": "OracleQueueMismatch"
          },
          {
            "name": "OracleWalletMismatchError"
          },
          {
            "name": "InvalidBufferAccountError"
          },
          {
            "name": "InsufficientOracleQueueError"
          },
          {
            "name": "InvalidAuthorityError"
          },
          {
            "name": "InvalidTokenAccountMintError"
          },
          {
            "name": "ExcessiveLeaseWithdrawlError"
          },
          {
            "name": "InvalideHistoryAccountError"
          },
          {
            "name": "InvalidLeaseAccountEscrowError"
          },
          {
            "name": "InvalidCrankAccountError"
          },
          {
            "name": "CrankNoElementsReadyError"
          },
          {
            "name": "IndexOutOfBoundsError"
          },
          {
            "name": "VrfInvalidRequestError"
          },
          {
            "name": "VrfInvalidProofSubmissionError"
          },
          {
            "name": "VrfVerifyError"
          },
          {
            "name": "VrfCallbackError"
          },
          {
            "name": "VrfCallbackParamsError"
          },
          {
            "name": "VrfCallbackAlreadyCalledError"
          },
          {
            "name": "VrfInvalidPubkeyError"
          },
          {
            "name": "VrfTooManyVerifyCallsError"
          },
          {
            "name": "VrfRequestAlreadyLaunchedError"
          },
          {
            "name": "VrfInsufficientVerificationError"
          },
          {
            "name": "InvalidVrfProducerError"
          },
          {
            "name": "InvalidGovernancePidError"
          },
          {
            "name": "InvalidGovernanceAccountError"
          },
          {
            "name": "MissingOptionalAccount"
          },
          {
            "name": "InvalidSpawnRecordOwner"
          }
        ]
      }
    },
    {
      "name": "VrfStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "StatusNone"
          },
          {
            "name": "StatusRequesting"
          },
          {
            "name": "StatusVerifying"
          },
          {
            "name": "StatusVerified"
          },
          {
            "name": "StatusCallbackSuccess"
          },
          {
            "name": "StatusVerifyFailure"
          }
        ]
      }
    },
    {
      "name": "Error",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidPublicKey"
          },
          {
            "name": "SerializationError",
            "fields": [
              {
                "defined": "bincode::Error"
              }
            ]
          },
          {
            "name": "DeserializationError",
            "fields": [
              {
                "defined": "bincode::Error"
              }
            ]
          },
          {
            "name": "InvalidDataError"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "AggregatorInitEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "VrfRequestRandomnessEvent",
      "fields": [
        {
          "name": "vrfPubkey",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "oraclePubkeys",
          "type": {
            "vec": "publicKey"
          },
          "index": false
        },
        {
          "name": "loadAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "existingAmount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "VrfRequestEvent",
      "fields": [
        {
          "name": "vrfPubkey",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "oraclePubkeys",
          "type": {
            "vec": "publicKey"
          },
          "index": false
        }
      ]
    },
    {
      "name": "VrfProveEvent",
      "fields": [
        {
          "name": "vrfPubkey",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "oraclePubkey",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "authorityPubkey",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "VrfVerifyEvent",
      "fields": [
        {
          "name": "vrfPubkey",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "oraclePubkey",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "authorityPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "VrfCallbackPerformedEvent",
      "fields": [
        {
          "name": "vrfPubkey",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "oraclePubkey",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "AggregatorOpenRoundEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oraclePubkeys",
          "type": {
            "vec": "publicKey"
          },
          "index": false
        },
        {
          "name": "jobPubkeys",
          "type": {
            "vec": "publicKey"
          },
          "index": false
        },
        {
          "name": "remainingFunds",
          "type": "u64",
          "index": false
        },
        {
          "name": "queueAuthority",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "AggregatorValueUpdateEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "value",
          "type": {
            "defined": "BorshDecimal"
          },
          "index": false
        },
        {
          "name": "slot",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "oraclePubkeys",
          "type": {
            "vec": "publicKey"
          },
          "index": false
        },
        {
          "name": "oracleValues",
          "type": {
            "vec": {
              "defined": "BorshDecimal"
            }
          },
          "index": false
        }
      ]
    },
    {
      "name": "OracleRewardEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "leasePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oraclePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "walletPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "roundSlot",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "OracleWithdrawEvent",
      "fields": [
        {
          "name": "oraclePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "walletPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "destinationWallet",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "previousAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "newAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "LeaseWithdrawEvent",
      "fields": [
        {
          "name": "leasePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "walletPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "previousAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "newAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "OracleSlashEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "leasePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oraclePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "walletPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "roundSlot",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "LeaseFundEvent",
      "fields": [
        {
          "name": "leasePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "funder",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ProbationBrokenEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "queuePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "FeedPermissionRevokedEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "GarbageCollectFailureEvent",
      "fields": [
        {
          "name": "queuePubkey",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "OracleBootedEvent",
      "fields": [
        {
          "name": "queuePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oraclePubkey",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "CrankLeaseInsufficientFundsEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "leasePubkey",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "CrankPopExpectedFailureEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "leasePubkey",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "metadata": {
    "address": "7PMP6yE6qb3XzBQr5TK2GhuruYayZzBnT8U92ySaLESC"
  }
}

export const IDL: Switchboard = {
  "version": "0.0.0",
  "name": "switchboard_v2",
  "instructions": [
    {
      "name": "aggregatorAddJob",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "job",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorAddJobParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorInit",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "queue",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authorWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorInitParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorLock",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorLockParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorOpenRound",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "queueAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "permission",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payoutWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dataBuffer",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorOpenRoundParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorRemoveJob",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "job",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorRemoveJobParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSaveResult",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "oracleQueue",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "queueAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feedPermission",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oraclePermission",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "historyBuffer",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSaveResultParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSetAuthority",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSetAuthorityParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSetBatchSize",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSetBatchSizeParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSetHistoryBuffer",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "buffer",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSetHistoryBufferParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSetMinJobs",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSetMinJobsParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSetMinOracles",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSetMinOraclesParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSetQueue",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "queue",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSetQueueParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSetUpdateInterval",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSetUpdateIntervalParams"
          }
        }
      ]
    },
    {
      "name": "aggregatorSetVarianceThreshold",
      "accounts": [
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "AggregatorSetVarianceThresholdParams"
          }
        }
      ]
    },
    {
      "name": "crankInit",
      "accounts": [
        {
          "name": "crank",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "queue",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buffer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CrankInitParams"
          }
        }
      ]
    },
    {
      "name": "crankPop",
      "accounts": [
        {
          "name": "crank",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "queueAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payoutWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "crankDataBuffer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "queueDataBuffer",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CrankPopParams"
          }
        }
      ]
    },
    {
      "name": "crankPush",
      "accounts": [
        {
          "name": "crank",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aggregator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "queueAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "permission",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dataBuffer",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CrankPushParams"
          }
        }
      ]
    },
    {
      "name": "jobInit",
      "accounts": [
        {
          "name": "job",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authorWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "JobInitParams"
          }
        }
      ]
    },
    {
      "name": "leaseExtend",
      "accounts": [
        {
          "name": "lease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aggregator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "queue",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "funder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "LeaseExtendParams"
          }
        }
      ]
    },
    {
      "name": "leaseInit",
      "accounts": [
        {
          "name": "lease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "queue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aggregator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "funder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "LeaseInitParams"
          }
        }
      ]
    },
    {
      "name": "leaseSetAuthority",
      "accounts": [
        {
          "name": "lease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "withdrawAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "LeaseSetAuthorityParams"
          }
        }
      ]
    },
    {
      "name": "leaseWithdraw",
      "accounts": [
        {
          "name": "lease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aggregator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "queue",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "withdrawAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "withdrawAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "LeaseWithdrawParams"
          }
        }
      ]
    },
    {
      "name": "oracleHeartbeat",
      "accounts": [
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gcOracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "permission",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dataBuffer",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "OracleHeartbeatParams"
          }
        }
      ]
    },
    {
      "name": "oracleInit",
      "accounts": [
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "queue",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "OracleInitParams"
          }
        }
      ]
    },
    {
      "name": "oracleQueueInit",
      "accounts": [
        {
          "name": "oracleQueue",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buffer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "OracleQueueInitParams"
          }
        }
      ]
    },
    {
      "name": "oracleQueueSetRewards",
      "accounts": [
        {
          "name": "queue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "OracleQueueSetRewardsParams"
          }
        }
      ]
    },
    {
      "name": "oracleQueueVrfConfig",
      "accounts": [
        {
          "name": "queue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "OracleQueueVrfConfigParams"
          }
        }
      ]
    },
    {
      "name": "oracleWithdraw",
      "accounts": [
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "withdrawAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "permission",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "OracleWithdrawParams"
          }
        }
      ]
    },
    {
      "name": "permissionInit",
      "accounts": [
        {
          "name": "permission",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "granter",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "grantee",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "PermissionInitParams"
          }
        }
      ]
    },
    {
      "name": "permissionSet",
      "accounts": [
        {
          "name": "permission",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "PermissionSetParams"
          }
        }
      ]
    },
    {
      "name": "permissionSetVoterWeight",
      "accounts": [
        {
          "name": "permission",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "permissionAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracleAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "govProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "daoMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "spawnRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterWeight",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenOwnerRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "PermissionSetVoterWeightParams"
          }
        }
      ]
    },
    {
      "name": "programConfig",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "daoMint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "ProgramConfigParams"
          }
        }
      ]
    },
    {
      "name": "programInit",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "daoMint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "ProgramInitParams"
          }
        }
      ]
    },
    {
      "name": "vaultTransfer",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "VaultTransferParams"
          }
        }
      ]
    },
    {
      "name": "vrfInit",
      "accounts": [
        {
          "name": "vrf",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracleQueue",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "VrfInitParams"
          }
        }
      ]
    },
    {
      "name": "vrfProve",
      "accounts": [
        {
          "name": "vrf",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "randomnessProducer",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "VrfProveParams"
          }
        }
      ]
    },
    {
      "name": "vrfProveAndVerify",
      "accounts": [
        {
          "name": "vrf",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callbackPid",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracleAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "oracleWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "instructionsSysvar",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "VrfProveAndVerifyParams"
          }
        }
      ]
    },
    {
      "name": "vrfRequestRandomness",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "vrf",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "queueAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dataBuffer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "permission",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "recentBlockhashes",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "VrfRequestRandomnessParams"
          }
        }
      ]
    },
    {
      "name": "vrfVerify",
      "accounts": [
        {
          "name": "vrf",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callbackPid",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracleAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracleWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "instructionsSysvar",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "VrfVerifyParams"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "SbState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "tokenVault",
            "type": "publicKey"
          },
          {
            "name": "daoMint",
            "type": "publicKey"
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                992
              ]
            }
          }
        ]
      }
    },
    {
      "name": "AggregatorAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "authorWallet",
            "type": "publicKey"
          },
          {
            "name": "queuePubkey",
            "type": "publicKey"
          },
          {
            "name": "oracleRequestBatchSize",
            "type": "u32"
          },
          {
            "name": "minOracleResults",
            "type": "u32"
          },
          {
            "name": "minJobResults",
            "type": "u32"
          },
          {
            "name": "minUpdateDelaySeconds",
            "type": "u32"
          },
          {
            "name": "startAfter",
            "type": "i64"
          },
          {
            "name": "varianceThreshold",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          },
          {
            "name": "forceReportPeriod",
            "type": "i64"
          },
          {
            "name": "expiration",
            "type": "i64"
          },
          {
            "name": "consecutiveFailureCount",
            "type": "u64"
          },
          {
            "name": "nextAllowedUpdateTime",
            "type": "i64"
          },
          {
            "name": "isLocked",
            "type": "bool"
          },
          {
            "name": "crankPubkey",
            "type": "publicKey"
          },
          {
            "name": "latestConfirmedRound",
            "type": {
              "defined": "AggregatorRound"
            }
          },
          {
            "name": "currentRound",
            "type": {
              "defined": "AggregatorRound"
            }
          },
          {
            "name": "jobPubkeysData",
            "type": {
              "array": [
                "publicKey",
                16
              ]
            }
          },
          {
            "name": "jobHashes",
            "type": {
              "array": [
                {
                  "defined": "Hash"
                },
                16
              ]
            }
          },
          {
            "name": "jobPubkeysSize",
            "type": "u32"
          },
          {
            "name": "jobsChecksum",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "historyBuffer",
            "type": "publicKey"
          },
          {
            "name": "previousConfirmedRoundResult",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          },
          {
            "name": "previousConfirmedRoundSlot",
            "type": "u64"
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                164
              ]
            }
          }
        ]
      }
    },
    {
      "name": "PermissionAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "permissions",
            "type": "u32"
          },
          {
            "name": "granter",
            "type": "publicKey"
          },
          {
            "name": "grantee",
            "type": "publicKey"
          },
          {
            "name": "expiration",
            "type": "i64"
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          }
        ]
      }
    },
    {
      "name": "RealmSpawnRecordAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          }
        ]
      }
    },
    {
      "name": "LeaseAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrow",
            "type": "publicKey"
          },
          {
            "name": "queue",
            "type": "publicKey"
          },
          {
            "name": "aggregator",
            "type": "publicKey"
          },
          {
            "name": "tokenProgram",
            "type": "publicKey"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "crankRowCount",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updateCount",
            "type": "u128"
          },
          {
            "name": "withdrawAuthority",
            "type": "publicKey"
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          }
        ]
      }
    },
    {
      "name": "OracleQueueAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "oracleTimeout",
            "type": "u32"
          },
          {
            "name": "reward",
            "type": "u64"
          },
          {
            "name": "minStake",
            "type": "u64"
          },
          {
            "name": "slashingEnabled",
            "type": "bool"
          },
          {
            "name": "varianceToleranceMultiplier",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          },
          {
            "name": "feedProbationPeriod",
            "type": "u32"
          },
          {
            "name": "currIdx",
            "type": "u32"
          },
          {
            "name": "size",
            "type": "u32"
          },
          {
            "name": "gcIdx",
            "type": "u32"
          },
          {
            "name": "consecutiveFeedFailureLimit",
            "type": "u64"
          },
          {
            "name": "consecutiveOracleFailureLimit",
            "type": "u64"
          },
          {
            "name": "unpermissionedFeedsEnabled",
            "type": "bool"
          },
          {
            "name": "unpermissionedVrfEnabled",
            "type": "bool"
          },
          {
            "name": "curatorRewardCut",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          },
          {
            "name": "lockLeaseFunding",
            "type": "bool"
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                1001
              ]
            }
          },
          {
            "name": "maxSize",
            "type": "u32"
          },
          {
            "name": "dataBuffer",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "CrankAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "queuePubkey",
            "type": "publicKey"
          },
          {
            "name": "pqSize",
            "type": "u32"
          },
          {
            "name": "maxRows",
            "type": "u32"
          },
          {
            "name": "jitterModifier",
            "type": "u8"
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                255
              ]
            }
          },
          {
            "name": "dataBuffer",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "OracleAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "oracleAuthority",
            "type": "publicKey"
          },
          {
            "name": "lastHeartbeat",
            "type": "i64"
          },
          {
            "name": "numInUse",
            "type": "u32"
          },
          {
            "name": "tokenAccount",
            "type": "publicKey"
          },
          {
            "name": "queuePubkey",
            "type": "publicKey"
          },
          {
            "name": "metrics",
            "type": {
              "defined": "OracleMetrics"
            }
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          }
        ]
      }
    },
    {
      "name": "JobAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "authorWallet",
            "type": "publicKey"
          },
          {
            "name": "expiration",
            "type": "i64"
          },
          {
            "name": "hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "data",
            "type": "bytes"
          },
          {
            "name": "referenceCount",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "VrfAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "status",
            "type": {
              "defined": "VrfStatus"
            }
          },
          {
            "name": "counter",
            "type": "u128"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "oracleQueue",
            "type": "publicKey"
          },
          {
            "name": "escrow",
            "type": "publicKey"
          },
          {
            "name": "callback",
            "type": {
              "defined": "CallbackZC"
            }
          },
          {
            "name": "batchSize",
            "type": "u32"
          },
          {
            "name": "builders",
            "type": {
              "array": [
                {
                  "defined": "VrfBuilder"
                },
                8
              ]
            }
          },
          {
            "name": "buildersLen",
            "type": "u32"
          },
          {
            "name": "testMode",
            "type": "bool"
          },
          {
            "name": "currentRound",
            "type": {
              "defined": "VrfRound"
            }
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                1024
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "AggregatorAddJobParams",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "AggregatorInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "batchSize",
            "type": "u32"
          },
          {
            "name": "minOracleResults",
            "type": "u32"
          },
          {
            "name": "minJobResults",
            "type": "u32"
          },
          {
            "name": "minUpdateDelaySeconds",
            "type": "u32"
          },
          {
            "name": "startAfter",
            "type": "i64"
          },
          {
            "name": "varianceThreshold",
            "type": {
              "defined": "BorshDecimal"
            }
          },
          {
            "name": "forceReportPeriod",
            "type": "i64"
          },
          {
            "name": "expiration",
            "type": "i64"
          },
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "AggregatorLockParams",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "AggregatorOpenRoundParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "leaseBump",
            "type": "u8"
          },
          {
            "name": "permissionBump",
            "type": "u8"
          },
          {
            "name": "jitter",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "AggregatorRemoveJobParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "jobIdx",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "AggregatorSaveResultParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oracleIdx",
            "type": "u32"
          },
          {
            "name": "error",
            "type": "bool"
          },
          {
            "name": "value",
            "type": {
              "defined": "BorshDecimal"
            }
          },
          {
            "name": "jobsChecksum",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "minResponse",
            "type": {
              "defined": "BorshDecimal"
            }
          },
          {
            "name": "maxResponse",
            "type": {
              "defined": "BorshDecimal"
            }
          },
          {
            "name": "feedPermissionBump",
            "type": "u8"
          },
          {
            "name": "oraclePermissionBump",
            "type": "u8"
          },
          {
            "name": "leaseBump",
            "type": "u8"
          },
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "AggregatorSetAuthorityParams",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "AggregatorSetBatchSizeParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "batchSize",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "AggregatorSetHistoryBufferParams",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "AggregatorSetMinJobsParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "minJobResults",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "AggregatorSetMinOraclesParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "minOracleResults",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "AggregatorSetQueueParams",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "AggregatorSetUpdateIntervalParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newInterval",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "AggregatorSetVarianceThresholdParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "varianceThreshold",
            "type": {
              "defined": "BorshDecimal"
            }
          }
        ]
      }
    },
    {
      "name": "CrankInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "bytes"
          },
          {
            "name": "metadata",
            "type": "bytes"
          },
          {
            "name": "crankSize",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "CrankPopParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "leaseBumps",
            "type": "bytes"
          },
          {
            "name": "permissionBumps",
            "type": "bytes"
          },
          {
            "name": "nonce",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "failOpenOnAccountMismatch",
            "type": {
              "option": "bool"
            }
          }
        ]
      }
    },
    {
      "name": "CrankPushParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "permissionBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "JobInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "expiration",
            "type": "i64"
          },
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "data",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "LeaseExtendParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "loadAmount",
            "type": "u64"
          },
          {
            "name": "leaseBump",
            "type": "u8"
          },
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "LeaseInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "loadAmount",
            "type": "u64"
          },
          {
            "name": "withdrawAuthority",
            "type": "publicKey"
          },
          {
            "name": "leaseBump",
            "type": "u8"
          },
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "LeaseSetAuthorityParams",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "LeaseWithdrawParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "leaseBump",
            "type": "u8"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "OracleHeartbeatParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "permissionBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "OracleInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "bytes"
          },
          {
            "name": "metadata",
            "type": "bytes"
          },
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "oracleBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "OracleQueueInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "reward",
            "type": "u64"
          },
          {
            "name": "minStake",
            "type": "u64"
          },
          {
            "name": "feedProbationPeriod",
            "type": "u32"
          },
          {
            "name": "oracleTimeout",
            "type": "u32"
          },
          {
            "name": "slashingEnabled",
            "type": "bool"
          },
          {
            "name": "varianceToleranceMultiplier",
            "type": {
              "defined": "BorshDecimal"
            }
          },
          {
            "name": "consecutiveFeedFailureLimit",
            "type": "u64"
          },
          {
            "name": "consecutiveOracleFailureLimit",
            "type": "u64"
          },
          {
            "name": "queueSize",
            "type": "u32"
          },
          {
            "name": "unpermissionedFeeds",
            "type": "bool"
          },
          {
            "name": "unpermissionedVrf",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "OracleQueueSetRewardsParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rewards",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "OracleQueueVrfConfigParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "unpermissionedVrfEnabled",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "OracleWithdrawParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "permissionBump",
            "type": "u8"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "PermissionInitParams",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "PermissionSetParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "permission",
            "type": {
              "defined": "SwitchboardPermission"
            }
          },
          {
            "name": "enable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "PermissionSetVoterWeightParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "ProgramConfigParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "token",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "daoMint",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "ProgramInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "Hash",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "AggregatorRound",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "numSuccess",
            "type": "u32"
          },
          {
            "name": "numError",
            "type": "u32"
          },
          {
            "name": "isClosed",
            "type": "bool"
          },
          {
            "name": "roundOpenSlot",
            "type": "u64"
          },
          {
            "name": "roundOpenTimestamp",
            "type": "i64"
          },
          {
            "name": "result",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          },
          {
            "name": "stdDeviation",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          },
          {
            "name": "minResponse",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          },
          {
            "name": "maxResponse",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          },
          {
            "name": "oraclePubkeysData",
            "type": {
              "array": [
                "publicKey",
                16
              ]
            }
          },
          {
            "name": "mediansData",
            "type": {
              "array": [
                {
                  "defined": "SwitchboardDecimal"
                },
                16
              ]
            }
          },
          {
            "name": "currentPayout",
            "type": {
              "array": [
                "i64",
                16
              ]
            }
          },
          {
            "name": "mediansFulfilled",
            "type": {
              "array": [
                "bool",
                16
              ]
            }
          },
          {
            "name": "errorsFulfilled",
            "type": {
              "array": [
                "bool",
                16
              ]
            }
          }
        ]
      }
    },
    {
      "name": "AggregatorHistoryRow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "value",
            "type": {
              "defined": "SwitchboardDecimal"
            }
          }
        ]
      }
    },
    {
      "name": "SwitchboardDecimal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mantissa",
            "type": "i128"
          },
          {
            "name": "scale",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "CrankRow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "publicKey"
          },
          {
            "name": "nextTimestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "OracleMetrics",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "consecutiveSuccess",
            "type": "u64"
          },
          {
            "name": "consecutiveError",
            "type": "u64"
          },
          {
            "name": "consecutiveDisagreement",
            "type": "u64"
          },
          {
            "name": "consecutiveLateResponse",
            "type": "u64"
          },
          {
            "name": "consecutiveFailure",
            "type": "u64"
          },
          {
            "name": "totalSuccess",
            "type": "u128"
          },
          {
            "name": "totalError",
            "type": "u128"
          },
          {
            "name": "totalDisagreement",
            "type": "u128"
          },
          {
            "name": "totalLateResponse",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "BorshDecimal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mantissa",
            "type": "i128"
          },
          {
            "name": "scale",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "EcvrfProofZC",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gamma",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "c",
            "type": {
              "defined": "Scalar"
            }
          },
          {
            "name": "s",
            "type": {
              "defined": "Scalar"
            }
          }
        ]
      }
    },
    {
      "name": "Scalar",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bytes",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "FieldElementZC",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bytes",
            "type": {
              "array": [
                "u64",
                5
              ]
            }
          }
        ]
      }
    },
    {
      "name": "CompletedPointZC",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "x",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "y",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "z",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "t",
            "type": {
              "defined": "FieldElementZC"
            }
          }
        ]
      }
    },
    {
      "name": "EdwardsPointZC",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "x",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "y",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "z",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "t",
            "type": {
              "defined": "FieldElementZC"
            }
          }
        ]
      }
    },
    {
      "name": "ProjectivePointZC",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "x",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "y",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "z",
            "type": {
              "defined": "FieldElementZC"
            }
          }
        ]
      }
    },
    {
      "name": "EcvrfIntermediate",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "r",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "nS",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "d",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "t13",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "t15",
            "type": {
              "defined": "FieldElementZC"
            }
          }
        ]
      }
    },
    {
      "name": "VrfBuilder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "producer",
            "type": "publicKey"
          },
          {
            "name": "status",
            "type": {
              "defined": "VrfStatus"
            }
          },
          {
            "name": "reprProof",
            "type": {
              "array": [
                "u8",
                80
              ]
            }
          },
          {
            "name": "proof",
            "type": {
              "defined": "EcvrfProofZC"
            }
          },
          {
            "name": "yPoint",
            "type": "publicKey"
          },
          {
            "name": "stage",
            "type": "u32"
          },
          {
            "name": "stage1Out",
            "type": {
              "defined": "EcvrfIntermediate"
            }
          },
          {
            "name": "r1",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "r2",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "stage3Out",
            "type": {
              "defined": "EcvrfIntermediate"
            }
          },
          {
            "name": "hPoint",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "sReduced",
            "type": {
              "defined": "Scalar"
            }
          },
          {
            "name": "yPointBuilder",
            "type": {
              "array": [
                {
                  "defined": "FieldElementZC"
                },
                3
              ]
            }
          },
          {
            "name": "yRistrettoPoint",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "mulRound",
            "type": "u8"
          },
          {
            "name": "hashPointsRound",
            "type": "u8"
          },
          {
            "name": "mulTmp1",
            "type": {
              "defined": "CompletedPointZC"
            }
          },
          {
            "name": "uPoint1",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "uPoint2",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "vPoint1",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "vPoint2",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "uPoint",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "vPoint",
            "type": {
              "defined": "EdwardsPointZC"
            }
          },
          {
            "name": "u1",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "u2",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "invertee",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "y",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "z",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "p1Bytes",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "p2Bytes",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "p3Bytes",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "p4Bytes",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "cPrimeHashbuf",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "m1",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "m2",
            "type": {
              "defined": "FieldElementZC"
            }
          },
          {
            "name": "txRemaining",
            "type": "u32"
          },
          {
            "name": "verified",
            "type": "bool"
          },
          {
            "name": "result",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "AccountMetaZC",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "publicKey"
          },
          {
            "name": "isSigner",
            "type": "bool"
          },
          {
            "name": "isWritable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "AccountMetaBorsh",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "publicKey"
          },
          {
            "name": "isSigner",
            "type": "bool"
          },
          {
            "name": "isWritable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "CallbackZC",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "programId",
            "type": "publicKey"
          },
          {
            "name": "accounts",
            "type": {
              "array": [
                {
                  "defined": "AccountMetaZC"
                },
                32
              ]
            }
          },
          {
            "name": "accountsLen",
            "type": "u32"
          },
          {
            "name": "ixData",
            "type": {
              "array": [
                "u8",
                1024
              ]
            }
          },
          {
            "name": "ixDataLen",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "Callback",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "programId",
            "type": "publicKey"
          },
          {
            "name": "accounts",
            "type": {
              "vec": {
                "defined": "AccountMetaBorsh"
              }
            }
          },
          {
            "name": "ixData",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "VrfRound",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "alpha",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          },
          {
            "name": "alphaLen",
            "type": "u32"
          },
          {
            "name": "requestSlot",
            "type": "u64"
          },
          {
            "name": "requestTimestamp",
            "type": "i64"
          },
          {
            "name": "result",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "numVerified",
            "type": "u32"
          },
          {
            "name": "ebuf",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          }
        ]
      }
    },
    {
      "name": "VaultTransferParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "VrfInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "callback",
            "type": {
              "defined": "Callback"
            }
          },
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "VrfProveParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proof",
            "type": "bytes"
          },
          {
            "name": "idx",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "VrfProveAndVerifyParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "idx",
            "type": "u32"
          },
          {
            "name": "proof",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "VrfRequestRandomnessParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "permissionBump",
            "type": "u8"
          },
          {
            "name": "stateBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "VrfVerifyParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "stateBump",
            "type": "u8"
          },
          {
            "name": "idx",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "SwitchboardPermission",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "PermitOracleHeartbeat"
          },
          {
            "name": "PermitOracleQueueUsage"
          },
          {
            "name": "PermitVrfRequests"
          }
        ]
      }
    },
    {
      "name": "OracleResponseType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "TypeSuccess"
          },
          {
            "name": "TypeError"
          },
          {
            "name": "TypeDisagreement"
          },
          {
            "name": "TypeNoResponse"
          }
        ]
      }
    },
    {
      "name": "SwitchboardError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "ArrayOperationError"
          },
          {
            "name": "QueueOperationError"
          },
          {
            "name": "IncorrectProgramOwnerError"
          },
          {
            "name": "InvalidAggregatorRound"
          },
          {
            "name": "TooManyAggregatorJobs"
          },
          {
            "name": "AggregatorCurrentRoundClosed"
          },
          {
            "name": "AggregatorInvalidSaveResult"
          },
          {
            "name": "InvalidStrDecimalConversion"
          },
          {
            "name": "AccountLoaderMissingSignature"
          },
          {
            "name": "MissingRequiredSignature"
          },
          {
            "name": "ArrayOverflowError"
          },
          {
            "name": "ArrayUnderflowError"
          },
          {
            "name": "PubkeyNotFoundError"
          },
          {
            "name": "AggregatorIllegalRoundOpenCall"
          },
          {
            "name": "AggregatorIllegalRoundCloseCall"
          },
          {
            "name": "AggregatorClosedError"
          },
          {
            "name": "IllegalOracleIdxError"
          },
          {
            "name": "OracleAlreadyRespondedError"
          },
          {
            "name": "ProtoDeserializeError"
          },
          {
            "name": "UnauthorizedStateUpdateError"
          },
          {
            "name": "MissingOracleAccountsError"
          },
          {
            "name": "OracleMismatchError"
          },
          {
            "name": "CrankMaxCapacityError"
          },
          {
            "name": "AggregatorLeaseInsufficientFunds"
          },
          {
            "name": "IncorrectTokenAccountMint"
          },
          {
            "name": "InvalidEscrowAccount"
          },
          {
            "name": "CrankEmptyError"
          },
          {
            "name": "PdaDeriveError"
          },
          {
            "name": "AggregatorAccountNotFound"
          },
          {
            "name": "PermissionAccountNotFound"
          },
          {
            "name": "LeaseAccountDeriveFailure"
          },
          {
            "name": "PermissionAccountDeriveFailure"
          },
          {
            "name": "EscrowAccountNotFound"
          },
          {
            "name": "LeaseAccountNotFound"
          },
          {
            "name": "DecimalConversionError"
          },
          {
            "name": "PermissionDenied"
          },
          {
            "name": "QueueAtCapacity"
          },
          {
            "name": "ExcessiveCrankRowsError"
          },
          {
            "name": "AggregatorLockedError"
          },
          {
            "name": "AggregatorInvalidBatchSizeError"
          },
          {
            "name": "AggregatorJobChecksumMismatch"
          },
          {
            "name": "IntegerOverflowError"
          },
          {
            "name": "InvalidUpdatePeriodError"
          },
          {
            "name": "NoResultsError"
          },
          {
            "name": "InvalidExpirationError"
          },
          {
            "name": "InsufficientStakeError"
          },
          {
            "name": "LeaseInactiveError"
          },
          {
            "name": "NoAggregatorJobsFound"
          },
          {
            "name": "IntegerUnderflowError"
          },
          {
            "name": "OracleQueueMismatch"
          },
          {
            "name": "OracleWalletMismatchError"
          },
          {
            "name": "InvalidBufferAccountError"
          },
          {
            "name": "InsufficientOracleQueueError"
          },
          {
            "name": "InvalidAuthorityError"
          },
          {
            "name": "InvalidTokenAccountMintError"
          },
          {
            "name": "ExcessiveLeaseWithdrawlError"
          },
          {
            "name": "InvalideHistoryAccountError"
          },
          {
            "name": "InvalidLeaseAccountEscrowError"
          },
          {
            "name": "InvalidCrankAccountError"
          },
          {
            "name": "CrankNoElementsReadyError"
          },
          {
            "name": "IndexOutOfBoundsError"
          },
          {
            "name": "VrfInvalidRequestError"
          },
          {
            "name": "VrfInvalidProofSubmissionError"
          },
          {
            "name": "VrfVerifyError"
          },
          {
            "name": "VrfCallbackError"
          },
          {
            "name": "VrfCallbackParamsError"
          },
          {
            "name": "VrfCallbackAlreadyCalledError"
          },
          {
            "name": "VrfInvalidPubkeyError"
          },
          {
            "name": "VrfTooManyVerifyCallsError"
          },
          {
            "name": "VrfRequestAlreadyLaunchedError"
          },
          {
            "name": "VrfInsufficientVerificationError"
          },
          {
            "name": "InvalidVrfProducerError"
          },
          {
            "name": "InvalidGovernancePidError"
          },
          {
            "name": "InvalidGovernanceAccountError"
          },
          {
            "name": "MissingOptionalAccount"
          },
          {
            "name": "InvalidSpawnRecordOwner"
          }
        ]
      }
    },
    {
      "name": "VrfStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "StatusNone"
          },
          {
            "name": "StatusRequesting"
          },
          {
            "name": "StatusVerifying"
          },
          {
            "name": "StatusVerified"
          },
          {
            "name": "StatusCallbackSuccess"
          },
          {
            "name": "StatusVerifyFailure"
          }
        ]
      }
    },
    {
      "name": "Error",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidPublicKey"
          },
          {
            "name": "SerializationError",
            "fields": [
              {
                "defined": "bincode::Error"
              }
            ]
          },
          {
            "name": "DeserializationError",
            "fields": [
              {
                "defined": "bincode::Error"
              }
            ]
          },
          {
            "name": "InvalidDataError"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "AggregatorInitEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "VrfRequestRandomnessEvent",
      "fields": [
        {
          "name": "vrfPubkey",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "oraclePubkeys",
          "type": {
            "vec": "publicKey"
          },
          "index": false
        },
        {
          "name": "loadAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "existingAmount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "VrfRequestEvent",
      "fields": [
        {
          "name": "vrfPubkey",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "oraclePubkeys",
          "type": {
            "vec": "publicKey"
          },
          "index": false
        }
      ]
    },
    {
      "name": "VrfProveEvent",
      "fields": [
        {
          "name": "vrfPubkey",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "oraclePubkey",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "authorityPubkey",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "VrfVerifyEvent",
      "fields": [
        {
          "name": "vrfPubkey",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "oraclePubkey",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "authorityPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "VrfCallbackPerformedEvent",
      "fields": [
        {
          "name": "vrfPubkey",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "oraclePubkey",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "AggregatorOpenRoundEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oraclePubkeys",
          "type": {
            "vec": "publicKey"
          },
          "index": false
        },
        {
          "name": "jobPubkeys",
          "type": {
            "vec": "publicKey"
          },
          "index": false
        },
        {
          "name": "remainingFunds",
          "type": "u64",
          "index": false
        },
        {
          "name": "queueAuthority",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "AggregatorValueUpdateEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "value",
          "type": {
            "defined": "BorshDecimal"
          },
          "index": false
        },
        {
          "name": "slot",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "oraclePubkeys",
          "type": {
            "vec": "publicKey"
          },
          "index": false
        },
        {
          "name": "oracleValues",
          "type": {
            "vec": {
              "defined": "BorshDecimal"
            }
          },
          "index": false
        }
      ]
    },
    {
      "name": "OracleRewardEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "leasePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oraclePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "walletPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "roundSlot",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "OracleWithdrawEvent",
      "fields": [
        {
          "name": "oraclePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "walletPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "destinationWallet",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "previousAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "newAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "LeaseWithdrawEvent",
      "fields": [
        {
          "name": "leasePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "walletPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "previousAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "newAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "OracleSlashEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "leasePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oraclePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "walletPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "roundSlot",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "LeaseFundEvent",
      "fields": [
        {
          "name": "leasePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "funder",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ProbationBrokenEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "queuePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "FeedPermissionRevokedEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "GarbageCollectFailureEvent",
      "fields": [
        {
          "name": "queuePubkey",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "OracleBootedEvent",
      "fields": [
        {
          "name": "queuePubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oraclePubkey",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "CrankLeaseInsufficientFundsEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "leasePubkey",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "CrankPopExpectedFailureEvent",
      "fields": [
        {
          "name": "feedPubkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "leasePubkey",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "metadata": {
    "address": "7PMP6yE6qb3XzBQr5TK2GhuruYayZzBnT8U92ySaLESC"
  }
}
