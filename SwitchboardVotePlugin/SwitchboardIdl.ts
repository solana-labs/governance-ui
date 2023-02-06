export type Switchboard = {
  version: '0.1.0'
  name: 'switchboard_v2'
  instructions: [
    {
      name: 'aggregatorAddJob'
      accounts: [
        {
          name: 'aggregator'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'job'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'AggregatorAddJobParams'
          }
        }
      ]
    },
    {
      name: 'aggregatorInit'
      accounts: [
        {
          name: 'aggregator'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: false
        },
        {
          name: 'queue'
          isMut: false
          isSigner: false
        },
        {
          name: 'programState'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'AggregatorInitParams'
          }
        }
      ]
    },
    {
      name: 'aggregatorLock'
      accounts: [
        {
          name: 'aggregator'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: true
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'AggregatorLockParams'
          }
        }
      ]
    },
    {
      name: 'aggregatorOpenRound'
      accounts: [
        {
          name: 'aggregator'
          isMut: true
          isSigner: false
        },
        {
          name: 'lease'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracleQueue'
          isMut: true
          isSigner: false
        },
        {
          name: 'queueAuthority'
          isMut: false
          isSigner: false
        },
        {
          name: 'permission'
          isMut: true
          isSigner: false
        },
        {
          name: 'escrow'
          isMut: true
          isSigner: false
        },
        {
          name: 'programState'
          isMut: false
          isSigner: false
        },
        {
          name: 'payoutWallet'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'dataBuffer'
          isMut: false
          isSigner: false
        },
        {
          name: 'mint'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'AggregatorOpenRoundParams'
          }
        }
      ]
    },
    {
      name: 'aggregatorRemoveJob'
      accounts: [
        {
          name: 'aggregator'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'job'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'AggregatorRemoveJobParams'
          }
        }
      ]
    },
    {
      name: 'aggregatorSaveResult'
      accounts: [
        {
          name: 'aggregator'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracle'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracleAuthority'
          isMut: false
          isSigner: true
        },
        {
          name: 'oracleQueue'
          isMut: false
          isSigner: false
        },
        {
          name: 'queueAuthority'
          isMut: false
          isSigner: false
        },
        {
          name: 'feedPermission'
          isMut: true
          isSigner: false
        },
        {
          name: 'oraclePermission'
          isMut: false
          isSigner: false
        },
        {
          name: 'lease'
          isMut: true
          isSigner: false
        },
        {
          name: 'escrow'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'programState'
          isMut: false
          isSigner: false
        },
        {
          name: 'historyBuffer'
          isMut: true
          isSigner: false
        },
        {
          name: 'mint'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'AggregatorSaveResultParams'
          }
        }
      ]
    },
    {
      name: 'aggregatorSetAuthority'
      accounts: [
        {
          name: 'aggregator'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'newAuthority'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'AggregatorSetAuthorityParams'
          }
        }
      ]
    },
    {
      name: 'aggregatorSetBatchSize'
      accounts: [
        {
          name: 'aggregator'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'AggregatorSetBatchSizeParams'
          }
        }
      ]
    },
    {
      name: 'aggregatorSetHistoryBuffer'
      accounts: [
        {
          name: 'aggregator'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'buffer'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'AggregatorSetHistoryBufferParams'
          }
        }
      ]
    },
    {
      name: 'aggregatorSetMinJobs'
      accounts: [
        {
          name: 'aggregator'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'AggregatorSetMinJobsParams'
          }
        }
      ]
    },
    {
      name: 'aggregatorSetMinOracles'
      accounts: [
        {
          name: 'aggregator'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'AggregatorSetMinOraclesParams'
          }
        }
      ]
    },
    {
      name: 'aggregatorSetQueue'
      accounts: [
        {
          name: 'aggregator'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'queue'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'AggregatorSetQueueParams'
          }
        }
      ]
    },
    {
      name: 'aggregatorSetUpdateInterval'
      accounts: [
        {
          name: 'aggregator'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'AggregatorSetUpdateIntervalParams'
          }
        }
      ]
    },
    {
      name: 'aggregatorSetVarianceThreshold'
      accounts: [
        {
          name: 'aggregator'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'AggregatorSetVarianceThresholdParams'
          }
        }
      ]
    },
    {
      name: 'crankInit'
      accounts: [
        {
          name: 'crank'
          isMut: true
          isSigner: true
        },
        {
          name: 'queue'
          isMut: false
          isSigner: false
        },
        {
          name: 'buffer'
          isMut: true
          isSigner: false
        },
        {
          name: 'payer'
          isMut: true
          isSigner: false
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'CrankInitParams'
          }
        }
      ]
    },
    {
      name: 'crankPop'
      accounts: [
        {
          name: 'crank'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracleQueue'
          isMut: true
          isSigner: false
        },
        {
          name: 'queueAuthority'
          isMut: false
          isSigner: false
        },
        {
          name: 'programState'
          isMut: false
          isSigner: false
        },
        {
          name: 'payoutWallet'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'crankDataBuffer'
          isMut: true
          isSigner: false
        },
        {
          name: 'queueDataBuffer'
          isMut: false
          isSigner: false
        },
        {
          name: 'mint'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'CrankPopParams'
          }
        }
      ]
    },
    {
      name: 'crankPush'
      accounts: [
        {
          name: 'crank'
          isMut: true
          isSigner: false
        },
        {
          name: 'aggregator'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracleQueue'
          isMut: true
          isSigner: false
        },
        {
          name: 'queueAuthority'
          isMut: false
          isSigner: false
        },
        {
          name: 'permission'
          isMut: false
          isSigner: false
        },
        {
          name: 'lease'
          isMut: true
          isSigner: false
        },
        {
          name: 'escrow'
          isMut: true
          isSigner: false
        },
        {
          name: 'programState'
          isMut: false
          isSigner: false
        },
        {
          name: 'dataBuffer'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'CrankPushParams'
          }
        }
      ]
    },
    {
      name: 'jobInit'
      accounts: [
        {
          name: 'job'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: false
        },
        {
          name: 'programState'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'JobInitParams'
          }
        }
      ]
    },
    {
      name: 'leaseExtend'
      accounts: [
        {
          name: 'lease'
          isMut: true
          isSigner: false
        },
        {
          name: 'aggregator'
          isMut: false
          isSigner: false
        },
        {
          name: 'queue'
          isMut: false
          isSigner: false
        },
        {
          name: 'funder'
          isMut: true
          isSigner: false
        },
        {
          name: 'owner'
          isMut: true
          isSigner: true
        },
        {
          name: 'escrow'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'programState'
          isMut: false
          isSigner: false
        },
        {
          name: 'mint'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'LeaseExtendParams'
          }
        }
      ]
    },
    {
      name: 'leaseInit'
      accounts: [
        {
          name: 'lease'
          isMut: true
          isSigner: false
        },
        {
          name: 'queue'
          isMut: true
          isSigner: false
        },
        {
          name: 'aggregator'
          isMut: false
          isSigner: false
        },
        {
          name: 'funder'
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
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'owner'
          isMut: true
          isSigner: true
        },
        {
          name: 'escrow'
          isMut: true
          isSigner: false
        },
        {
          name: 'programState'
          isMut: false
          isSigner: false
        },
        {
          name: 'mint'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'LeaseInitParams'
          }
        }
      ]
    },
    {
      name: 'leaseSetAuthority'
      accounts: [
        {
          name: 'lease'
          isMut: true
          isSigner: false
        },
        {
          name: 'withdrawAuthority'
          isMut: false
          isSigner: true
        },
        {
          name: 'newAuthority'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'LeaseSetAuthorityParams'
          }
        }
      ]
    },
    {
      name: 'leaseWithdraw'
      accounts: [
        {
          name: 'lease'
          isMut: true
          isSigner: false
        },
        {
          name: 'escrow'
          isMut: true
          isSigner: false
        },
        {
          name: 'aggregator'
          isMut: false
          isSigner: false
        },
        {
          name: 'queue'
          isMut: false
          isSigner: false
        },
        {
          name: 'withdrawAuthority'
          isMut: false
          isSigner: true
        },
        {
          name: 'withdrawAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'programState'
          isMut: false
          isSigner: false
        },
        {
          name: 'mint'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'LeaseWithdrawParams'
          }
        }
      ]
    },
    {
      name: 'oracleHeartbeat'
      accounts: [
        {
          name: 'oracle'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracleAuthority'
          isMut: false
          isSigner: true
        },
        {
          name: 'tokenAccount'
          isMut: false
          isSigner: false
        },
        {
          name: 'gcOracle'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracleQueue'
          isMut: true
          isSigner: false
        },
        {
          name: 'permission'
          isMut: false
          isSigner: false
        },
        {
          name: 'dataBuffer'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'OracleHeartbeatParams'
          }
        }
      ]
    },
    {
      name: 'oracleInit'
      accounts: [
        {
          name: 'oracle'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracleAuthority'
          isMut: false
          isSigner: false
        },
        {
          name: 'wallet'
          isMut: false
          isSigner: false
        },
        {
          name: 'programState'
          isMut: false
          isSigner: false
        },
        {
          name: 'queue'
          isMut: false
          isSigner: false
        },
        {
          name: 'payer'
          isMut: true
          isSigner: false
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'OracleInitParams'
          }
        }
      ]
    },
    {
      name: 'oracleQueueInit'
      accounts: [
        {
          name: 'oracleQueue'
          isMut: true
          isSigner: true
        },
        {
          name: 'authority'
          isMut: false
          isSigner: false
        },
        {
          name: 'buffer'
          isMut: true
          isSigner: false
        },
        {
          name: 'payer'
          isMut: true
          isSigner: false
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'mint'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'OracleQueueInitParams'
          }
        }
      ]
    },
    {
      name: 'oracleQueueSetRewards'
      accounts: [
        {
          name: 'queue'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'OracleQueueSetRewardsParams'
          }
        }
      ]
    },
    {
      name: 'oracleQueueVrfConfig'
      accounts: [
        {
          name: 'queue'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'OracleQueueVrfConfigParams'
          }
        }
      ]
    },
    {
      name: 'oracleWithdraw'
      accounts: [
        {
          name: 'oracle'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracleAuthority'
          isMut: false
          isSigner: true
        },
        {
          name: 'tokenAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'withdrawAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracleQueue'
          isMut: true
          isSigner: false
        },
        {
          name: 'permission'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'programState'
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
          name: 'params'
          type: {
            defined: 'OracleWithdrawParams'
          }
        }
      ]
    },
    {
      name: 'permissionInit'
      accounts: [
        {
          name: 'permission'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: false
        },
        {
          name: 'granter'
          isMut: false
          isSigner: false
        },
        {
          name: 'grantee'
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
          name: 'params'
          type: {
            defined: 'PermissionInitParams'
          }
        }
      ]
    },
    {
      name: 'permissionSet'
      accounts: [
        {
          name: 'permission'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'PermissionSetParams'
          }
        }
      ]
    },
    {
      name: 'permissionSetVoterWeight'
      accounts: [
        {
          name: 'permission'
          isMut: false
          isSigner: false
        },
        {
          name: 'permissionAuthority'
          isMut: false
          isSigner: false
        },
        {
          name: 'oracle'
          isMut: false
          isSigner: false
        },
        {
          name: 'oracleAuthority'
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
        },
        {
          name: 'programState'
          isMut: false
          isSigner: false
        },
        {
          name: 'govProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'daoMint'
          isMut: false
          isSigner: false
        },
        {
          name: 'spawnRecord'
          isMut: true
          isSigner: false
        },
        {
          name: 'voterWeight'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenOwnerRecord'
          isMut: true
          isSigner: false
        },
        {
          name: 'realm'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'PermissionSetVoterWeightParams'
          }
        }
      ]
    },
    {
      name: 'programConfig'
      accounts: [
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'programState'
          isMut: false
          isSigner: false
        },
        {
          name: 'daoMint'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'ProgramConfigParams'
          }
        }
      ]
    },
    {
      name: 'programInit'
      accounts: [
        {
          name: 'state'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: false
        },
        {
          name: 'tokenMint'
          isMut: true
          isSigner: false
        },
        {
          name: 'vault'
          isMut: true
          isSigner: false
        },
        {
          name: 'payer'
          isMut: true
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
          name: 'daoMint'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'ProgramInitParams'
          }
        }
      ]
    },
    {
      name: 'vaultTransfer'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'to'
          isMut: true
          isSigner: false
        },
        {
          name: 'vault'
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
          name: 'params'
          type: {
            defined: 'VaultTransferParams'
          }
        }
      ]
    },
    {
      name: 'vrfInit'
      accounts: [
        {
          name: 'vrf'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: false
        },
        {
          name: 'oracleQueue'
          isMut: false
          isSigner: false
        },
        {
          name: 'escrow'
          isMut: true
          isSigner: false
        },
        {
          name: 'programState'
          isMut: false
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
          name: 'params'
          type: {
            defined: 'VrfInitParams'
          }
        }
      ]
    },
    {
      name: 'vrfProve'
      accounts: [
        {
          name: 'vrf'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracle'
          isMut: false
          isSigner: false
        },
        {
          name: 'randomnessProducer'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'VrfProveParams'
          }
        }
      ]
    },
    {
      name: 'vrfProveAndVerify'
      accounts: [
        {
          name: 'vrf'
          isMut: true
          isSigner: false
        },
        {
          name: 'callbackPid'
          isMut: false
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'escrow'
          isMut: true
          isSigner: false
        },
        {
          name: 'programState'
          isMut: false
          isSigner: false
        },
        {
          name: 'oracle'
          isMut: false
          isSigner: false
        },
        {
          name: 'oracleAuthority'
          isMut: false
          isSigner: true
        },
        {
          name: 'oracleWallet'
          isMut: true
          isSigner: false
        },
        {
          name: 'instructionsSysvar'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'VrfProveAndVerifyParams'
          }
        }
      ]
    },
    {
      name: 'vrfRequestRandomness'
      accounts: [
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'vrf'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracleQueue'
          isMut: true
          isSigner: false
        },
        {
          name: 'queueAuthority'
          isMut: false
          isSigner: false
        },
        {
          name: 'dataBuffer'
          isMut: false
          isSigner: false
        },
        {
          name: 'permission'
          isMut: true
          isSigner: false
        },
        {
          name: 'escrow'
          isMut: true
          isSigner: false
        },
        {
          name: 'payerWallet'
          isMut: true
          isSigner: false
        },
        {
          name: 'payerAuthority'
          isMut: false
          isSigner: true
        },
        {
          name: 'recentBlockhashes'
          isMut: false
          isSigner: false
        },
        {
          name: 'programState'
          isMut: false
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
          name: 'params'
          type: {
            defined: 'VrfRequestRandomnessParams'
          }
        }
      ]
    },
    {
      name: 'vrfVerify'
      accounts: [
        {
          name: 'vrf'
          isMut: true
          isSigner: false
        },
        {
          name: 'callbackPid'
          isMut: false
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'escrow'
          isMut: true
          isSigner: false
        },
        {
          name: 'programState'
          isMut: false
          isSigner: false
        },
        {
          name: 'oracle'
          isMut: false
          isSigner: false
        },
        {
          name: 'oracleAuthority'
          isMut: false
          isSigner: false
        },
        {
          name: 'oracleWallet'
          isMut: true
          isSigner: false
        },
        {
          name: 'instructionsSysvar'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'VrfVerifyParams'
          }
        }
      ]
    }
  ]
  accounts: [
    {
      name: 'SbState'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'authority'
            type: 'publicKey'
          },
          {
            name: 'tokenMint'
            type: 'publicKey'
          },
          {
            name: 'tokenVault'
            type: 'publicKey'
          },
          {
            name: 'daoMint'
            type: 'publicKey'
          },
          {
            name: 'ebuf'
            type: {
              array: ['u8', 992]
            }
          }
        ]
      }
    },
    {
      name: 'AggregatorAccountData'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'name'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'metadata'
            type: {
              array: ['u8', 128]
            }
          },
          {
            name: 'reserved1'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'queuePubkey'
            type: 'publicKey'
          },
          {
            name: 'oracleRequestBatchSize'
            type: 'u32'
          },
          {
            name: 'minOracleResults'
            type: 'u32'
          },
          {
            name: 'minJobResults'
            type: 'u32'
          },
          {
            name: 'minUpdateDelaySeconds'
            type: 'u32'
          },
          {
            name: 'startAfter'
            type: 'i64'
          },
          {
            name: 'varianceThreshold'
            type: {
              defined: 'SwitchboardDecimal'
            }
          },
          {
            name: 'forceReportPeriod'
            type: 'i64'
          },
          {
            name: 'expiration'
            type: 'i64'
          },
          {
            name: 'consecutiveFailureCount'
            type: 'u64'
          },
          {
            name: 'nextAllowedUpdateTime'
            type: 'i64'
          },
          {
            name: 'isLocked'
            type: 'bool'
          },
          {
            name: 'crankPubkey'
            type: 'publicKey'
          },
          {
            name: 'latestConfirmedRound'
            type: {
              defined: 'AggregatorRound'
            }
          },
          {
            name: 'currentRound'
            type: {
              defined: 'AggregatorRound'
            }
          },
          {
            name: 'jobPubkeysData'
            type: {
              array: ['publicKey', 16]
            }
          },
          {
            name: 'jobHashes'
            type: {
              array: [
                {
                  defined: 'Hash'
                },
                16
              ]
            }
          },
          {
            name: 'jobPubkeysSize'
            type: 'u32'
          },
          {
            name: 'jobsChecksum'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'authority'
            type: 'publicKey'
          },
          {
            name: 'historyBuffer'
            type: 'publicKey'
          },
          {
            name: 'previousConfirmedRoundResult'
            type: {
              defined: 'SwitchboardDecimal'
            }
          },
          {
            name: 'previousConfirmedRoundSlot'
            type: 'u64'
          },
          {
            name: 'disableCrank'
            type: 'bool'
          },
          {
            name: 'jobWeights'
            type: {
              array: ['u8', 16]
            }
          },
          {
            name: 'ebuf'
            type: {
              array: ['u8', 147]
            }
          }
        ]
      }
    },
    {
      name: 'PermissionAccountData'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'authority'
            type: 'publicKey'
          },
          {
            name: 'permissions'
            type: 'u32'
          },
          {
            name: 'granter'
            type: 'publicKey'
          },
          {
            name: 'grantee'
            type: 'publicKey'
          },
          {
            name: 'expiration'
            type: 'i64'
          },
          {
            name: 'ebuf'
            type: {
              array: ['u8', 256]
            }
          }
        ]
      }
    },
    {
      name: 'RealmSpawnRecordAccountData'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'ebuf'
            type: {
              array: ['u8', 256]
            }
          }
        ]
      }
    },
    {
      name: 'LeaseAccountData'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'escrow'
            type: 'publicKey'
          },
          {
            name: 'queue'
            type: 'publicKey'
          },
          {
            name: 'aggregator'
            type: 'publicKey'
          },
          {
            name: 'tokenProgram'
            type: 'publicKey'
          },
          {
            name: 'isActive'
            type: 'bool'
          },
          {
            name: 'crankRowCount'
            type: 'u32'
          },
          {
            name: 'createdAt'
            type: 'i64'
          },
          {
            name: 'updateCount'
            type: 'u128'
          },
          {
            name: 'withdrawAuthority'
            type: 'publicKey'
          },
          {
            name: 'ebuf'
            type: {
              array: ['u8', 256]
            }
          }
        ]
      }
    },
    {
      name: 'OracleQueueAccountData'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'name'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'metadata'
            type: {
              array: ['u8', 64]
            }
          },
          {
            name: 'authority'
            type: 'publicKey'
          },
          {
            name: 'oracleTimeout'
            type: 'u32'
          },
          {
            name: 'reward'
            type: 'u64'
          },
          {
            name: 'minStake'
            type: 'u64'
          },
          {
            name: 'slashingEnabled'
            type: 'bool'
          },
          {
            name: 'varianceToleranceMultiplier'
            type: {
              defined: 'SwitchboardDecimal'
            }
          },
          {
            name: 'feedProbationPeriod'
            type: 'u32'
          },
          {
            name: 'currIdx'
            type: 'u32'
          },
          {
            name: 'size'
            type: 'u32'
          },
          {
            name: 'gcIdx'
            type: 'u32'
          },
          {
            name: 'consecutiveFeedFailureLimit'
            type: 'u64'
          },
          {
            name: 'consecutiveOracleFailureLimit'
            type: 'u64'
          },
          {
            name: 'unpermissionedFeedsEnabled'
            type: 'bool'
          },
          {
            name: 'unpermissionedVrfEnabled'
            type: 'bool'
          },
          {
            name: 'curatorRewardCut'
            type: {
              defined: 'SwitchboardDecimal'
            }
          },
          {
            name: 'lockLeaseFunding'
            type: 'bool'
          },
          {
            name: 'mint'
            type: 'publicKey'
          },
          {
            name: 'ebuf'
            type: {
              array: ['u8', 969]
            }
          },
          {
            name: 'maxSize'
            type: 'u32'
          },
          {
            name: 'dataBuffer'
            type: 'publicKey'
          }
        ]
      }
    },
    {
      name: 'CrankAccountData'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'name'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'metadata'
            type: {
              array: ['u8', 64]
            }
          },
          {
            name: 'queuePubkey'
            type: 'publicKey'
          },
          {
            name: 'pqSize'
            type: 'u32'
          },
          {
            name: 'maxRows'
            type: 'u32'
          },
          {
            name: 'jitterModifier'
            type: 'u8'
          },
          {
            name: 'ebuf'
            type: {
              array: ['u8', 255]
            }
          },
          {
            name: 'dataBuffer'
            type: 'publicKey'
          }
        ]
      }
    },
    {
      name: 'OracleAccountData'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'name'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'metadata'
            type: {
              array: ['u8', 128]
            }
          },
          {
            name: 'oracleAuthority'
            type: 'publicKey'
          },
          {
            name: 'lastHeartbeat'
            type: 'i64'
          },
          {
            name: 'numInUse'
            type: 'u32'
          },
          {
            name: 'tokenAccount'
            type: 'publicKey'
          },
          {
            name: 'queuePubkey'
            type: 'publicKey'
          },
          {
            name: 'metrics'
            type: {
              defined: 'OracleMetrics'
            }
          },
          {
            name: 'ebuf'
            type: {
              array: ['u8', 256]
            }
          }
        ]
      }
    },
    {
      name: 'JobAccountData'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'name'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'metadata'
            type: {
              array: ['u8', 64]
            }
          },
          {
            name: 'authority'
            type: 'publicKey'
          },
          {
            name: 'expiration'
            type: 'i64'
          },
          {
            name: 'hash'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'data'
            type: 'bytes'
          },
          {
            name: 'referenceCount'
            type: 'u32'
          },
          {
            name: 'totalSpent'
            type: 'u64'
          },
          {
            name: 'createdAt'
            type: 'i64'
          }
        ]
      }
    },
    {
      name: 'VrfAccountData'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'status'
            type: {
              defined: 'VrfStatus'
            }
          },
          {
            name: 'counter'
            type: 'u128'
          },
          {
            name: 'authority'
            type: 'publicKey'
          },
          {
            name: 'oracleQueue'
            type: 'publicKey'
          },
          {
            name: 'escrow'
            type: 'publicKey'
          },
          {
            name: 'callback'
            type: {
              defined: 'CallbackZC'
            }
          },
          {
            name: 'batchSize'
            type: 'u32'
          },
          {
            name: 'builders'
            type: {
              array: [
                {
                  defined: 'VrfBuilder'
                },
                8
              ]
            }
          },
          {
            name: 'buildersLen'
            type: 'u32'
          },
          {
            name: 'testMode'
            type: 'bool'
          },
          {
            name: 'currentRound'
            type: {
              defined: 'VrfRound'
            }
          },
          {
            name: 'ebuf'
            type: {
              array: ['u8', 1024]
            }
          }
        ]
      }
    }
  ]
  types: [
    {
      name: 'AggregatorAddJobParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'weight'
            type: {
              option: 'u8'
            }
          }
        ]
      }
    },
    {
      name: 'AggregatorInitParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'name'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'metadata'
            type: {
              array: ['u8', 128]
            }
          },
          {
            name: 'batchSize'
            type: 'u32'
          },
          {
            name: 'minOracleResults'
            type: 'u32'
          },
          {
            name: 'minJobResults'
            type: 'u32'
          },
          {
            name: 'minUpdateDelaySeconds'
            type: 'u32'
          },
          {
            name: 'startAfter'
            type: 'i64'
          },
          {
            name: 'varianceThreshold'
            type: {
              defined: 'BorshDecimal'
            }
          },
          {
            name: 'forceReportPeriod'
            type: 'i64'
          },
          {
            name: 'expiration'
            type: 'i64'
          },
          {
            name: 'stateBump'
            type: 'u8'
          },
          {
            name: 'disableCrank'
            type: 'bool'
          }
        ]
      }
    },
    {
      name: 'AggregatorLockParams'
      type: {
        kind: 'struct'
        fields: []
      }
    },
    {
      name: 'AggregatorOpenRoundParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'stateBump'
            type: 'u8'
          },
          {
            name: 'leaseBump'
            type: 'u8'
          },
          {
            name: 'permissionBump'
            type: 'u8'
          },
          {
            name: 'jitter'
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'AggregatorRemoveJobParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'jobIdx'
            type: 'u32'
          }
        ]
      }
    },
    {
      name: 'AggregatorSaveResultParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'oracleIdx'
            type: 'u32'
          },
          {
            name: 'error'
            type: 'bool'
          },
          {
            name: 'value'
            type: {
              defined: 'BorshDecimal'
            }
          },
          {
            name: 'jobsChecksum'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'minResponse'
            type: {
              defined: 'BorshDecimal'
            }
          },
          {
            name: 'maxResponse'
            type: {
              defined: 'BorshDecimal'
            }
          },
          {
            name: 'feedPermissionBump'
            type: 'u8'
          },
          {
            name: 'oraclePermissionBump'
            type: 'u8'
          },
          {
            name: 'leaseBump'
            type: 'u8'
          },
          {
            name: 'stateBump'
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'AggregatorSetAuthorityParams'
      type: {
        kind: 'struct'
        fields: []
      }
    },
    {
      name: 'AggregatorSetBatchSizeParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'batchSize'
            type: 'u32'
          }
        ]
      }
    },
    {
      name: 'AggregatorSetHistoryBufferParams'
      type: {
        kind: 'struct'
        fields: []
      }
    },
    {
      name: 'AggregatorSetMinJobsParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'minJobResults'
            type: 'u32'
          }
        ]
      }
    },
    {
      name: 'AggregatorSetMinOraclesParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'minOracleResults'
            type: 'u32'
          }
        ]
      }
    },
    {
      name: 'AggregatorSetQueueParams'
      type: {
        kind: 'struct'
        fields: []
      }
    },
    {
      name: 'AggregatorSetUpdateIntervalParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'newInterval'
            type: 'u32'
          }
        ]
      }
    },
    {
      name: 'AggregatorSetVarianceThresholdParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'varianceThreshold'
            type: {
              defined: 'BorshDecimal'
            }
          }
        ]
      }
    },
    {
      name: 'CrankInitParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'name'
            type: 'bytes'
          },
          {
            name: 'metadata'
            type: 'bytes'
          },
          {
            name: 'crankSize'
            type: 'u32'
          }
        ]
      }
    },
    {
      name: 'CrankPopParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'stateBump'
            type: 'u8'
          },
          {
            name: 'leaseBumps'
            type: 'bytes'
          },
          {
            name: 'permissionBumps'
            type: 'bytes'
          },
          {
            name: 'nonce'
            type: {
              option: 'u32'
            }
          },
          {
            name: 'failOpenOnAccountMismatch'
            type: {
              option: 'bool'
            }
          }
        ]
      }
    },
    {
      name: 'CrankPushParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'stateBump'
            type: 'u8'
          },
          {
            name: 'permissionBump'
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'JobInitParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'name'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'expiration'
            type: 'i64'
          },
          {
            name: 'stateBump'
            type: 'u8'
          },
          {
            name: 'data'
            type: 'bytes'
          }
        ]
      }
    },
    {
      name: 'LeaseExtendParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'loadAmount'
            type: 'u64'
          },
          {
            name: 'leaseBump'
            type: 'u8'
          },
          {
            name: 'stateBump'
            type: 'u8'
          },
          {
            name: 'walletBumps'
            type: 'bytes'
          }
        ]
      }
    },
    {
      name: 'LeaseInitParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'loadAmount'
            type: 'u64'
          },
          {
            name: 'withdrawAuthority'
            type: 'publicKey'
          },
          {
            name: 'leaseBump'
            type: 'u8'
          },
          {
            name: 'stateBump'
            type: 'u8'
          },
          {
            name: 'walletBumps'
            type: 'bytes'
          }
        ]
      }
    },
    {
      name: 'LeaseSetAuthorityParams'
      type: {
        kind: 'struct'
        fields: []
      }
    },
    {
      name: 'LeaseWithdrawParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'stateBump'
            type: 'u8'
          },
          {
            name: 'leaseBump'
            type: 'u8'
          },
          {
            name: 'amount'
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'OracleHeartbeatParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'permissionBump'
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'OracleInitParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'name'
            type: 'bytes'
          },
          {
            name: 'metadata'
            type: 'bytes'
          },
          {
            name: 'stateBump'
            type: 'u8'
          },
          {
            name: 'oracleBump'
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'OracleQueueInitParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'name'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'metadata'
            type: {
              array: ['u8', 64]
            }
          },
          {
            name: 'reward'
            type: 'u64'
          },
          {
            name: 'minStake'
            type: 'u64'
          },
          {
            name: 'feedProbationPeriod'
            type: 'u32'
          },
          {
            name: 'oracleTimeout'
            type: 'u32'
          },
          {
            name: 'slashingEnabled'
            type: 'bool'
          },
          {
            name: 'varianceToleranceMultiplier'
            type: {
              defined: 'BorshDecimal'
            }
          },
          {
            name: 'consecutiveFeedFailureLimit'
            type: 'u64'
          },
          {
            name: 'consecutiveOracleFailureLimit'
            type: 'u64'
          },
          {
            name: 'queueSize'
            type: 'u32'
          },
          {
            name: 'unpermissionedFeeds'
            type: 'bool'
          },
          {
            name: 'unpermissionedVrf'
            type: 'bool'
          }
        ]
      }
    },
    {
      name: 'OracleQueueSetRewardsParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'rewards'
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'OracleQueueVrfConfigParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'unpermissionedVrfEnabled'
            type: 'bool'
          }
        ]
      }
    },
    {
      name: 'OracleWithdrawParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'stateBump'
            type: 'u8'
          },
          {
            name: 'permissionBump'
            type: 'u8'
          },
          {
            name: 'amount'
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'PermissionInitParams'
      type: {
        kind: 'struct'
        fields: []
      }
    },
    {
      name: 'PermissionSetParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'permission'
            type: {
              defined: 'SwitchboardPermission'
            }
          },
          {
            name: 'enable'
            type: 'bool'
          }
        ]
      }
    },
    {
      name: 'PermissionSetVoterWeightParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'stateBump'
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'ProgramConfigParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'token'
            type: 'publicKey'
          },
          {
            name: 'bump'
            type: 'u8'
          },
          {
            name: 'daoMint'
            type: 'publicKey'
          }
        ]
      }
    },
    {
      name: 'ProgramInitParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'stateBump'
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'VaultTransferParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'stateBump'
            type: 'u8'
          },
          {
            name: 'amount'
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'VrfInitParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'callback'
            type: {
              defined: 'Callback'
            }
          },
          {
            name: 'stateBump'
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'VrfProveParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'proof'
            type: 'bytes'
          },
          {
            name: 'idx'
            type: 'u32'
          }
        ]
      }
    },
    {
      name: 'VrfProveAndVerifyParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'nonce'
            type: {
              option: 'u32'
            }
          },
          {
            name: 'stateBump'
            type: 'u8'
          },
          {
            name: 'idx'
            type: 'u32'
          },
          {
            name: 'proof'
            type: 'bytes'
          }
        ]
      }
    },
    {
      name: 'VrfRequestRandomnessParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'permissionBump'
            type: 'u8'
          },
          {
            name: 'stateBump'
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'VrfVerifyParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'nonce'
            type: {
              option: 'u32'
            }
          },
          {
            name: 'stateBump'
            type: 'u8'
          },
          {
            name: 'idx'
            type: 'u32'
          }
        ]
      }
    },
    {
      name: 'Hash'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'data'
            type: {
              array: ['u8', 32]
            }
          }
        ]
      }
    },
    {
      name: 'AggregatorRound'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'numSuccess'
            type: 'u32'
          },
          {
            name: 'numError'
            type: 'u32'
          },
          {
            name: 'isClosed'
            type: 'bool'
          },
          {
            name: 'roundOpenSlot'
            type: 'u64'
          },
          {
            name: 'roundOpenTimestamp'
            type: 'i64'
          },
          {
            name: 'result'
            type: {
              defined: 'SwitchboardDecimal'
            }
          },
          {
            name: 'stdDeviation'
            type: {
              defined: 'SwitchboardDecimal'
            }
          },
          {
            name: 'minResponse'
            type: {
              defined: 'SwitchboardDecimal'
            }
          },
          {
            name: 'maxResponse'
            type: {
              defined: 'SwitchboardDecimal'
            }
          },
          {
            name: 'oraclePubkeysData'
            type: {
              array: ['publicKey', 16]
            }
          },
          {
            name: 'mediansData'
            type: {
              array: [
                {
                  defined: 'SwitchboardDecimal'
                },
                16
              ]
            }
          },
          {
            name: 'currentPayout'
            type: {
              array: ['i64', 16]
            }
          },
          {
            name: 'mediansFulfilled'
            type: {
              array: ['bool', 16]
            }
          },
          {
            name: 'errorsFulfilled'
            type: {
              array: ['bool', 16]
            }
          }
        ]
      }
    },
    {
      name: 'AggregatorHistoryRow'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'timestamp'
            type: 'i64'
          },
          {
            name: 'value'
            type: {
              defined: 'SwitchboardDecimal'
            }
          }
        ]
      }
    },
    {
      name: 'SwitchboardDecimal'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'mantissa'
            type: 'i128'
          },
          {
            name: 'scale'
            type: 'u32'
          }
        ]
      }
    },
    {
      name: 'CrankRow'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'pubkey'
            type: 'publicKey'
          },
          {
            name: 'nextTimestamp'
            type: 'i64'
          }
        ]
      }
    },
    {
      name: 'OracleMetrics'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'consecutiveSuccess'
            type: 'u64'
          },
          {
            name: 'consecutiveError'
            type: 'u64'
          },
          {
            name: 'consecutiveDisagreement'
            type: 'u64'
          },
          {
            name: 'consecutiveLateResponse'
            type: 'u64'
          },
          {
            name: 'consecutiveFailure'
            type: 'u64'
          },
          {
            name: 'totalSuccess'
            type: 'u128'
          },
          {
            name: 'totalError'
            type: 'u128'
          },
          {
            name: 'totalDisagreement'
            type: 'u128'
          },
          {
            name: 'totalLateResponse'
            type: 'u128'
          }
        ]
      }
    },
    {
      name: 'BorshDecimal'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'mantissa'
            type: 'i128'
          },
          {
            name: 'scale'
            type: 'u32'
          }
        ]
      }
    },
    {
      name: 'EcvrfProofZC'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'gamma'
            type: {
              defined: 'EdwardsPointZC'
            }
          },
          {
            name: 'c'
            type: {
              defined: 'Scalar'
            }
          },
          {
            name: 's'
            type: {
              defined: 'Scalar'
            }
          }
        ]
      }
    },
    {
      name: 'Scalar'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'bytes'
            type: {
              array: ['u8', 32]
            }
          }
        ]
      }
    },
    {
      name: 'FieldElementZC'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'bytes'
            type: {
              array: ['u64', 5]
            }
          }
        ]
      }
    },
    {
      name: 'CompletedPointZC'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'x'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 'y'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 'z'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 't'
            type: {
              defined: 'FieldElementZC'
            }
          }
        ]
      }
    },
    {
      name: 'EdwardsPointZC'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'x'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 'y'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 'z'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 't'
            type: {
              defined: 'FieldElementZC'
            }
          }
        ]
      }
    },
    {
      name: 'ProjectivePointZC'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'x'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 'y'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 'z'
            type: {
              defined: 'FieldElementZC'
            }
          }
        ]
      }
    },
    {
      name: 'EcvrfIntermediate'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'r'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 'nS'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 'd'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 't13'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 't15'
            type: {
              defined: 'FieldElementZC'
            }
          }
        ]
      }
    },
    {
      name: 'VrfBuilder'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'producer'
            type: 'publicKey'
          },
          {
            name: 'status'
            type: {
              defined: 'VrfStatus'
            }
          },
          {
            name: 'reprProof'
            type: {
              array: ['u8', 80]
            }
          },
          {
            name: 'proof'
            type: {
              defined: 'EcvrfProofZC'
            }
          },
          {
            name: 'yPoint'
            type: 'publicKey'
          },
          {
            name: 'stage'
            type: 'u32'
          },
          {
            name: 'stage1Out'
            type: {
              defined: 'EcvrfIntermediate'
            }
          },
          {
            name: 'r1'
            type: {
              defined: 'EdwardsPointZC'
            }
          },
          {
            name: 'r2'
            type: {
              defined: 'EdwardsPointZC'
            }
          },
          {
            name: 'stage3Out'
            type: {
              defined: 'EcvrfIntermediate'
            }
          },
          {
            name: 'hPoint'
            type: {
              defined: 'EdwardsPointZC'
            }
          },
          {
            name: 'sReduced'
            type: {
              defined: 'Scalar'
            }
          },
          {
            name: 'yPointBuilder'
            type: {
              array: [
                {
                  defined: 'FieldElementZC'
                },
                3
              ]
            }
          },
          {
            name: 'yRistrettoPoint'
            type: {
              defined: 'EdwardsPointZC'
            }
          },
          {
            name: 'mulRound'
            type: 'u8'
          },
          {
            name: 'hashPointsRound'
            type: 'u8'
          },
          {
            name: 'mulTmp1'
            type: {
              defined: 'CompletedPointZC'
            }
          },
          {
            name: 'uPoint1'
            type: {
              defined: 'EdwardsPointZC'
            }
          },
          {
            name: 'uPoint2'
            type: {
              defined: 'EdwardsPointZC'
            }
          },
          {
            name: 'vPoint1'
            type: {
              defined: 'EdwardsPointZC'
            }
          },
          {
            name: 'vPoint2'
            type: {
              defined: 'EdwardsPointZC'
            }
          },
          {
            name: 'uPoint'
            type: {
              defined: 'EdwardsPointZC'
            }
          },
          {
            name: 'vPoint'
            type: {
              defined: 'EdwardsPointZC'
            }
          },
          {
            name: 'u1'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 'u2'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 'invertee'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 'y'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 'z'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 'p1Bytes'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'p2Bytes'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'p3Bytes'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'p4Bytes'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'cPrimeHashbuf'
            type: {
              array: ['u8', 16]
            }
          },
          {
            name: 'm1'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 'm2'
            type: {
              defined: 'FieldElementZC'
            }
          },
          {
            name: 'txRemaining'
            type: 'u32'
          },
          {
            name: 'verified'
            type: 'bool'
          },
          {
            name: 'result'
            type: {
              array: ['u8', 32]
            }
          }
        ]
      }
    },
    {
      name: 'AccountMetaZC'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'pubkey'
            type: 'publicKey'
          },
          {
            name: 'isSigner'
            type: 'bool'
          },
          {
            name: 'isWritable'
            type: 'bool'
          }
        ]
      }
    },
    {
      name: 'AccountMetaBorsh'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'pubkey'
            type: 'publicKey'
          },
          {
            name: 'isSigner'
            type: 'bool'
          },
          {
            name: 'isWritable'
            type: 'bool'
          }
        ]
      }
    },
    {
      name: 'CallbackZC'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'programId'
            type: 'publicKey'
          },
          {
            name: 'accounts'
            type: {
              array: [
                {
                  defined: 'AccountMetaZC'
                },
                32
              ]
            }
          },
          {
            name: 'accountsLen'
            type: 'u32'
          },
          {
            name: 'ixData'
            type: {
              array: ['u8', 1024]
            }
          },
          {
            name: 'ixDataLen'
            type: 'u32'
          }
        ]
      }
    },
    {
      name: 'Callback'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'programId'
            type: 'publicKey'
          },
          {
            name: 'accounts'
            type: {
              vec: {
                defined: 'AccountMetaBorsh'
              }
            }
          },
          {
            name: 'ixData'
            type: 'bytes'
          }
        ]
      }
    },
    {
      name: 'VrfRound'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'alpha'
            type: {
              array: ['u8', 256]
            }
          },
          {
            name: 'alphaLen'
            type: 'u32'
          },
          {
            name: 'requestSlot'
            type: 'u64'
          },
          {
            name: 'requestTimestamp'
            type: 'i64'
          },
          {
            name: 'result'
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'numVerified'
            type: 'u32'
          },
          {
            name: 'ebuf'
            type: {
              array: ['u8', 256]
            }
          }
        ]
      }
    },
    {
      name: 'Lanes'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'C'
          },
          {
            name: 'D'
          },
          {
            name: 'AB'
          },
          {
            name: 'AC'
          },
          {
            name: 'CD'
          },
          {
            name: 'AD'
          },
          {
            name: 'BC'
          },
          {
            name: 'ABCD'
          }
        ]
      }
    },
    {
      name: 'Shuffle'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'AAAA'
          },
          {
            name: 'BBBB'
          },
          {
            name: 'CACA'
          },
          {
            name: 'DBBD'
          },
          {
            name: 'ADDA'
          },
          {
            name: 'CBCB'
          },
          {
            name: 'ABAB'
          },
          {
            name: 'BADC'
          },
          {
            name: 'BACD'
          },
          {
            name: 'ABDC'
          }
        ]
      }
    },
    {
      name: 'Shuffle'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'AAAA'
          },
          {
            name: 'BBBB'
          },
          {
            name: 'BADC'
          },
          {
            name: 'BACD'
          },
          {
            name: 'ADDA'
          },
          {
            name: 'CBCB'
          },
          {
            name: 'ABDC'
          },
          {
            name: 'ABAB'
          },
          {
            name: 'DBBD'
          },
          {
            name: 'CACA'
          }
        ]
      }
    },
    {
      name: 'Lanes'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'D'
          },
          {
            name: 'C'
          },
          {
            name: 'AB'
          },
          {
            name: 'AC'
          },
          {
            name: 'AD'
          },
          {
            name: 'BCD'
          }
        ]
      }
    },
    {
      name: 'Error'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'InvalidPublicKey'
          },
          {
            name: 'SerializationError'
          },
          {
            name: 'DeserializationError'
          },
          {
            name: 'InvalidDataError'
          }
        ]
      }
    },
    {
      name: 'SwitchboardPermission'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'PermitOracleHeartbeat'
          },
          {
            name: 'PermitOracleQueueUsage'
          },
          {
            name: 'PermitVrfRequests'
          }
        ]
      }
    },
    {
      name: 'OracleResponseType'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'TypeSuccess'
          },
          {
            name: 'TypeError'
          },
          {
            name: 'TypeDisagreement'
          },
          {
            name: 'TypeNoResponse'
          }
        ]
      }
    },
    {
      name: 'VrfStatus'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'StatusNone'
          },
          {
            name: 'StatusRequesting'
          },
          {
            name: 'StatusVerifying'
          },
          {
            name: 'StatusVerified'
          },
          {
            name: 'StatusCallbackSuccess'
          },
          {
            name: 'StatusVerifyFailure'
          }
        ]
      }
    }
  ]
  events: [
    {
      name: 'AggregatorInitEvent'
      fields: [
        {
          name: 'feedPubkey'
          type: 'publicKey'
          index: false
        }
      ]
    },
    {
      name: 'VrfRequestRandomnessEvent'
      fields: [
        {
          name: 'vrfPubkey'
          type: 'publicKey'
          index: true
        },
        {
          name: 'oraclePubkeys'
          type: {
            vec: 'publicKey'
          }
          index: false
        },
        {
          name: 'loadAmount'
          type: 'u64'
          index: false
        },
        {
          name: 'existingAmount'
          type: 'u64'
          index: false
        }
      ]
    },
    {
      name: 'VrfRequestEvent'
      fields: [
        {
          name: 'vrfPubkey'
          type: 'publicKey'
          index: true
        },
        {
          name: 'oraclePubkeys'
          type: {
            vec: 'publicKey'
          }
          index: false
        }
      ]
    },
    {
      name: 'VrfProveEvent'
      fields: [
        {
          name: 'vrfPubkey'
          type: 'publicKey'
          index: true
        },
        {
          name: 'oraclePubkey'
          type: 'publicKey'
          index: true
        },
        {
          name: 'authorityPubkey'
          type: 'publicKey'
          index: false
        }
      ]
    },
    {
      name: 'VrfVerifyEvent'
      fields: [
        {
          name: 'vrfPubkey'
          type: 'publicKey'
          index: true
        },
        {
          name: 'oraclePubkey'
          type: 'publicKey'
          index: true
        },
        {
          name: 'authorityPubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'amount'
          type: 'u64'
          index: false
        }
      ]
    },
    {
      name: 'VrfCallbackPerformedEvent'
      fields: [
        {
          name: 'vrfPubkey'
          type: 'publicKey'
          index: true
        },
        {
          name: 'oraclePubkey'
          type: 'publicKey'
          index: true
        },
        {
          name: 'amount'
          type: 'u64'
          index: false
        }
      ]
    },
    {
      name: 'AggregatorOpenRoundEvent'
      fields: [
        {
          name: 'feedPubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'oraclePubkeys'
          type: {
            vec: 'publicKey'
          }
          index: false
        },
        {
          name: 'jobPubkeys'
          type: {
            vec: 'publicKey'
          }
          index: false
        },
        {
          name: 'remainingFunds'
          type: 'u64'
          index: false
        },
        {
          name: 'queueAuthority'
          type: 'publicKey'
          index: false
        }
      ]
    },
    {
      name: 'AggregatorValueUpdateEvent'
      fields: [
        {
          name: 'feedPubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'value'
          type: {
            defined: 'BorshDecimal'
          }
          index: false
        },
        {
          name: 'slot'
          type: 'u64'
          index: false
        },
        {
          name: 'timestamp'
          type: 'i64'
          index: false
        },
        {
          name: 'oraclePubkeys'
          type: {
            vec: 'publicKey'
          }
          index: false
        },
        {
          name: 'oracleValues'
          type: {
            vec: {
              defined: 'BorshDecimal'
            }
          }
          index: false
        }
      ]
    },
    {
      name: 'OracleRewardEvent'
      fields: [
        {
          name: 'feedPubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'leasePubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'oraclePubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'walletPubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'amount'
          type: 'u64'
          index: false
        },
        {
          name: 'roundSlot'
          type: 'u64'
          index: false
        },
        {
          name: 'timestamp'
          type: 'i64'
          index: false
        }
      ]
    },
    {
      name: 'OracleWithdrawEvent'
      fields: [
        {
          name: 'oraclePubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'walletPubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'destinationWallet'
          type: 'publicKey'
          index: false
        },
        {
          name: 'previousAmount'
          type: 'u64'
          index: false
        },
        {
          name: 'newAmount'
          type: 'u64'
          index: false
        },
        {
          name: 'timestamp'
          type: 'i64'
          index: false
        }
      ]
    },
    {
      name: 'LeaseWithdrawEvent'
      fields: [
        {
          name: 'leasePubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'walletPubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'previousAmount'
          type: 'u64'
          index: false
        },
        {
          name: 'newAmount'
          type: 'u64'
          index: false
        },
        {
          name: 'timestamp'
          type: 'i64'
          index: false
        }
      ]
    },
    {
      name: 'OracleSlashEvent'
      fields: [
        {
          name: 'feedPubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'leasePubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'oraclePubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'walletPubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'amount'
          type: 'u64'
          index: false
        },
        {
          name: 'roundSlot'
          type: 'u64'
          index: false
        },
        {
          name: 'timestamp'
          type: 'i64'
          index: false
        }
      ]
    },
    {
      name: 'LeaseFundEvent'
      fields: [
        {
          name: 'leasePubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'funder'
          type: 'publicKey'
          index: false
        },
        {
          name: 'amount'
          type: 'u64'
          index: false
        },
        {
          name: 'timestamp'
          type: 'i64'
          index: false
        }
      ]
    },
    {
      name: 'ProbationBrokenEvent'
      fields: [
        {
          name: 'feedPubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'queuePubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'timestamp'
          type: 'i64'
          index: false
        }
      ]
    },
    {
      name: 'FeedPermissionRevokedEvent'
      fields: [
        {
          name: 'feedPubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'timestamp'
          type: 'i64'
          index: false
        }
      ]
    },
    {
      name: 'GarbageCollectFailureEvent'
      fields: [
        {
          name: 'queuePubkey'
          type: 'publicKey'
          index: false
        }
      ]
    },
    {
      name: 'OracleBootedEvent'
      fields: [
        {
          name: 'queuePubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'oraclePubkey'
          type: 'publicKey'
          index: false
        }
      ]
    },
    {
      name: 'CrankLeaseInsufficientFundsEvent'
      fields: [
        {
          name: 'feedPubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'leasePubkey'
          type: 'publicKey'
          index: false
        }
      ]
    },
    {
      name: 'CrankPopExpectedFailureEvent'
      fields: [
        {
          name: 'feedPubkey'
          type: 'publicKey'
          index: false
        },
        {
          name: 'leasePubkey'
          type: 'publicKey'
          index: false
        }
      ]
    }
  ]
  errors: [
    {
      code: 6000
      name: 'ArrayOperationError'
      msg: 'Illegal operation on a Switchboard array.'
    },
    {
      code: 6001
      name: 'QueueOperationError'
      msg: 'Illegal operation on a Switchboard queue.'
    },
    {
      code: 6002
      name: 'IncorrectProgramOwnerError'
      msg: 'An account required to be owned by the program has a different owner.'
    },
    {
      code: 6003
      name: 'InvalidAggregatorRound'
      msg: 'Aggregator is not currently populated with a valid round.'
    },
    {
      code: 6004
      name: 'TooManyAggregatorJobs'
      msg: 'Aggregator cannot fit any more jobs.'
    },
    {
      code: 6005
      name: 'AggregatorCurrentRoundClosed'
      msg: "Aggregator's current round is closed. No results are being accepted."
    },
    {
      code: 6006
      name: 'AggregatorInvalidSaveResult'
      msg: 'Aggregator received an invalid save result instruction.'
    },
    {
      code: 6007
      name: 'InvalidStrDecimalConversion'
      msg: 'Failed to convert string to decimal format.'
    },
    {
      code: 6008
      name: 'AccountLoaderMissingSignature'
      msg: 'AccountLoader account is missing a required signature.'
    },
    {
      code: 6009
      name: 'MissingRequiredSignature'
      msg: 'Account is missing a required signature.'
    },
    {
      code: 6010
      name: 'ArrayOverflowError'
      msg: 'The attempted action will overflow a zero-copy account array.'
    },
    {
      code: 6011
      name: 'ArrayUnderflowError'
      msg: 'The attempted action will underflow a zero-copy account array.'
    },
    {
      code: 6012
      name: 'PubkeyNotFoundError'
      msg: 'The queried public key was not found.'
    },
    {
      code: 6013
      name: 'AggregatorIllegalRoundOpenCall'
      msg: 'Aggregator round open called too early.'
    },
    {
      code: 6014
      name: 'AggregatorIllegalRoundCloseCall'
      msg: 'Aggregator round close called too early.'
    },
    {
      code: 6015
      name: 'AggregatorClosedError'
      msg: 'Aggregator is closed. Illegal action.'
    },
    {
      code: 6016
      name: 'IllegalOracleIdxError'
      msg: 'Illegal oracle index.'
    },
    {
      code: 6017
      name: 'OracleAlreadyRespondedError'
      msg: 'The provided oracle has already responded this round.'
    },
    {
      code: 6018
      name: 'ProtoDeserializeError'
      msg: 'Failed to deserialize protocol buffer.'
    },
    {
      code: 6019
      name: 'UnauthorizedStateUpdateError'
      msg: 'Unauthorized program state modification attempted.'
    },
    {
      code: 6020
      name: 'MissingOracleAccountsError'
      msg: 'Not enough oracle accounts provided to closeRounds.'
    },
    {
      code: 6021
      name: 'OracleMismatchError'
      msg: 'An unexpected oracle account was provided for the transaction.'
    },
    {
      code: 6022
      name: 'CrankMaxCapacityError'
      msg: "Attempted to push to a Crank that's at capacity"
    },
    {
      code: 6023
      name: 'AggregatorLeaseInsufficientFunds'
      msg: 'Aggregator update call attempted but attached lease has insufficient funds.'
    },
    {
      code: 6024
      name: 'IncorrectTokenAccountMint'
      msg: 'The provided token account does not point to the Switchboard token mint.'
    },
    {
      code: 6025
      name: 'InvalidEscrowAccount'
      msg: 'An invalid escrow account was provided.'
    },
    {
      code: 6026
      name: 'CrankEmptyError'
      msg: 'Crank empty. Pop failed.'
    },
    {
      code: 6027
      name: 'PdaDeriveError'
      msg: 'Failed to derive a PDA from the provided seed.'
    },
    {
      code: 6028
      name: 'AggregatorAccountNotFound'
      msg: 'Aggregator account missing from provided account list.'
    },
    {
      code: 6029
      name: 'PermissionAccountNotFound'
      msg: 'Permission account missing from provided account list.'
    },
    {
      code: 6030
      name: 'LeaseAccountDeriveFailure'
      msg: 'Failed to derive a lease account.'
    },
    {
      code: 6031
      name: 'PermissionAccountDeriveFailure'
      msg: 'Failed to derive a permission account.'
    },
    {
      code: 6032
      name: 'EscrowAccountNotFound'
      msg: 'Escrow account missing from provided account list.'
    },
    {
      code: 6033
      name: 'LeaseAccountNotFound'
      msg: 'Lease account missing from provided account list.'
    },
    {
      code: 6034
      name: 'DecimalConversionError'
      msg: 'Decimal conversion method failed.'
    },
    {
      code: 6035
      name: 'PermissionDenied'
      msg: 'Permission account is missing required flags for the given action.'
    },
    {
      code: 6036
      name: 'QueueAtCapacity'
      msg: 'Oracle queue is at lease capacity.'
    },
    {
      code: 6037
      name: 'ExcessiveCrankRowsError'
      msg: 'Data feed is already pushed on a crank.'
    },
    {
      code: 6038
      name: 'AggregatorLockedError'
      msg: 'Aggregator is locked, no setting modifications or job additions allowed.'
    },
    {
      code: 6039
      name: 'AggregatorInvalidBatchSizeError'
      msg: 'Aggregator invalid batch size.'
    },
    {
      code: 6040
      name: 'AggregatorJobChecksumMismatch'
      msg: 'Oracle provided an incorrect aggregator job checksum.'
    },
    {
      code: 6041
      name: 'IntegerOverflowError'
      msg: 'An integer overflow occurred.'
    },
    {
      code: 6042
      name: 'InvalidUpdatePeriodError'
      msg: 'Minimum update period is 5 seconds.'
    },
    {
      code: 6043
      name: 'NoResultsError'
      msg: 'Aggregator round evaluation attempted with no results.'
    },
    {
      code: 6044
      name: 'InvalidExpirationError'
      msg: 'An expiration constraint was broken.'
    },
    {
      code: 6045
      name: 'InsufficientStakeError'
      msg: 'An account provided insufficient stake for action.'
    },
    {
      code: 6046
      name: 'LeaseInactiveError'
      msg: 'The provided lease account is not active.'
    },
    {
      code: 6047
      name: 'NoAggregatorJobsFound'
      msg: 'No jobs are currently included in the aggregator.'
    },
    {
      code: 6048
      name: 'IntegerUnderflowError'
      msg: 'An integer underflow occurred.'
    },
    {
      code: 6049
      name: 'OracleQueueMismatch'
      msg: 'An invalid oracle queue account was provided.'
    },
    {
      code: 6050
      name: 'OracleWalletMismatchError'
      msg: 'An unexpected oracle wallet account was provided for the transaction.'
    },
    {
      code: 6051
      name: 'InvalidBufferAccountError'
      msg: 'An invalid buffer account was provided.'
    },
    {
      code: 6052
      name: 'InsufficientOracleQueueError'
      msg: 'Insufficient oracle queue size.'
    },
    {
      code: 6053
      name: 'InvalidAuthorityError'
      msg: 'Invalid authority account provided.'
    },
    {
      code: 6054
      name: 'InvalidTokenAccountMintError'
      msg: 'A provided token wallet is associated with an incorrect mint.'
    },
    {
      code: 6055
      name: 'ExcessiveLeaseWithdrawlError'
      msg: 'You must leave enough funds to perform at least 1 update in the lease.'
    },
    {
      code: 6056
      name: 'InvalideHistoryAccountError'
      msg: 'Invalid history account provided.'
    },
    {
      code: 6057
      name: 'InvalidLeaseAccountEscrowError'
      msg: 'Invalid lease account escrow.'
    },
    {
      code: 6058
      name: 'InvalidCrankAccountError'
      msg: 'Invalid crank provided.'
    },
    {
      code: 6059
      name: 'CrankNoElementsReadyError'
      msg: 'No elements ready to be popped.'
    },
    {
      code: 6060
      name: 'IndexOutOfBoundsError'
      msg: 'Index out of bounds'
    },
    {
      code: 6061
      name: 'VrfInvalidRequestError'
      msg: 'Invalid vrf request params'
    },
    {
      code: 6062
      name: 'VrfInvalidProofSubmissionError'
      msg: 'Vrf proof failed to verify'
    },
    {
      code: 6063
      name: 'VrfVerifyError'
      msg: 'Error in verifying vrf proof.'
    },
    {
      code: 6064
      name: 'VrfCallbackError'
      msg: 'Vrf callback function failed.'
    },
    {
      code: 6065
      name: 'VrfCallbackParamsError'
      msg: 'Invalid vrf callback params provided.'
    },
    {
      code: 6066
      name: 'VrfCallbackAlreadyCalledError'
      msg: 'Vrf callback has already been triggered.'
    },
    {
      code: 6067
      name: 'VrfInvalidPubkeyError'
      msg: 'The provided pubkey is invalid to use in ecvrf proofs'
    },
    {
      code: 6068
      name: 'VrfTooManyVerifyCallsError'
      msg: 'Number of required verify calls exceeded'
    },
    {
      code: 6069
      name: 'VrfRequestAlreadyLaunchedError'
      msg: 'Vrf request is already pending'
    },
    {
      code: 6070
      name: 'VrfInsufficientVerificationError'
      msg: 'Insufficient amount of proofs collected for VRF callback'
    },
    {
      code: 6071
      name: 'InvalidVrfProducerError'
      msg: 'An incorrect oracle attempted to submit a proof'
    },
    {
      code: 6072
      name: 'InvalidGovernancePidError'
      msg: 'Invalid SPLGovernance Account Supplied'
    },
    {
      code: 6073
      name: 'InvalidGovernanceAccountError'
      msg: 'An Invalid Governance Account was supplied'
    },
    {
      code: 6074
      name: 'MissingOptionalAccount'
      msg: 'Expected an optional account'
    },
    {
      code: 6075
      name: 'InvalidSpawnRecordOwner'
      msg: 'Invalid Owner for Spawn Record'
    },
    {
      code: 6076
      name: 'NoopError'
      msg: 'Noop error'
    },
    {
      code: 6077
      name: 'MissingRequiredAccountsError'
      msg: 'A required instruction account was not included'
    },
    {
      code: 6078
      name: 'InvalidMintError'
      msg: 'Invalid mint account passed for instruction'
    },
    {
      code: 6079
      name: 'InvalidTokenAccountKeyError'
      msg: 'An invalid token account was passed into the instruction'
    },
    {
      code: 6080
      name: 'InvalidJobAccountError'
      msg: ''
    }
  ]
}

export const IDL: Switchboard = {
  version: '0.1.0',
  name: 'switchboard_v2',
  instructions: [
    {
      name: 'aggregatorAddJob',
      accounts: [
        {
          name: 'aggregator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'job',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AggregatorAddJobParams',
          },
        },
      ],
    },
    {
      name: 'aggregatorInit',
      accounts: [
        {
          name: 'aggregator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'queue',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'programState',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AggregatorInitParams',
          },
        },
      ],
    },
    {
      name: 'aggregatorLock',
      accounts: [
        {
          name: 'aggregator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AggregatorLockParams',
          },
        },
      ],
    },
    {
      name: 'aggregatorOpenRound',
      accounts: [
        {
          name: 'aggregator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lease',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracleQueue',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'queueAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'permission',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'escrow',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'programState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'payoutWallet',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'dataBuffer',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AggregatorOpenRoundParams',
          },
        },
      ],
    },
    {
      name: 'aggregatorRemoveJob',
      accounts: [
        {
          name: 'aggregator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'job',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AggregatorRemoveJobParams',
          },
        },
      ],
    },
    {
      name: 'aggregatorSaveResult',
      accounts: [
        {
          name: 'aggregator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracleAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'oracleQueue',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'queueAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'feedPermission',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oraclePermission',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lease',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'escrow',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'programState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'historyBuffer',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AggregatorSaveResultParams',
          },
        },
      ],
    },
    {
      name: 'aggregatorSetAuthority',
      accounts: [
        {
          name: 'aggregator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'newAuthority',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AggregatorSetAuthorityParams',
          },
        },
      ],
    },
    {
      name: 'aggregatorSetBatchSize',
      accounts: [
        {
          name: 'aggregator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AggregatorSetBatchSizeParams',
          },
        },
      ],
    },
    {
      name: 'aggregatorSetHistoryBuffer',
      accounts: [
        {
          name: 'aggregator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'buffer',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AggregatorSetHistoryBufferParams',
          },
        },
      ],
    },
    {
      name: 'aggregatorSetMinJobs',
      accounts: [
        {
          name: 'aggregator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AggregatorSetMinJobsParams',
          },
        },
      ],
    },
    {
      name: 'aggregatorSetMinOracles',
      accounts: [
        {
          name: 'aggregator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AggregatorSetMinOraclesParams',
          },
        },
      ],
    },
    {
      name: 'aggregatorSetQueue',
      accounts: [
        {
          name: 'aggregator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'queue',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AggregatorSetQueueParams',
          },
        },
      ],
    },
    {
      name: 'aggregatorSetUpdateInterval',
      accounts: [
        {
          name: 'aggregator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AggregatorSetUpdateIntervalParams',
          },
        },
      ],
    },
    {
      name: 'aggregatorSetVarianceThreshold',
      accounts: [
        {
          name: 'aggregator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AggregatorSetVarianceThresholdParams',
          },
        },
      ],
    },
    {
      name: 'crankInit',
      accounts: [
        {
          name: 'crank',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'queue',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'buffer',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
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
          name: 'params',
          type: {
            defined: 'CrankInitParams',
          },
        },
      ],
    },
    {
      name: 'crankPop',
      accounts: [
        {
          name: 'crank',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracleQueue',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'queueAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'programState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'payoutWallet',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'crankDataBuffer',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'queueDataBuffer',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'CrankPopParams',
          },
        },
      ],
    },
    {
      name: 'crankPush',
      accounts: [
        {
          name: 'crank',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aggregator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracleQueue',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'queueAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'permission',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lease',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'escrow',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'programState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'dataBuffer',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'CrankPushParams',
          },
        },
      ],
    },
    {
      name: 'jobInit',
      accounts: [
        {
          name: 'job',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'programState',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'JobInitParams',
          },
        },
      ],
    },
    {
      name: 'leaseExtend',
      accounts: [
        {
          name: 'lease',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aggregator',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'queue',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'funder',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'escrow',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'programState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'LeaseExtendParams',
          },
        },
      ],
    },
    {
      name: 'leaseInit',
      accounts: [
        {
          name: 'lease',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'queue',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aggregator',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'funder',
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
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'escrow',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'programState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'LeaseInitParams',
          },
        },
      ],
    },
    {
      name: 'leaseSetAuthority',
      accounts: [
        {
          name: 'lease',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'withdrawAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'newAuthority',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'LeaseSetAuthorityParams',
          },
        },
      ],
    },
    {
      name: 'leaseWithdraw',
      accounts: [
        {
          name: 'lease',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'escrow',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aggregator',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'queue',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'withdrawAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'withdrawAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'programState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'LeaseWithdrawParams',
          },
        },
      ],
    },
    {
      name: 'oracleHeartbeat',
      accounts: [
        {
          name: 'oracle',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracleAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gcOracle',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracleQueue',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'permission',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'dataBuffer',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'OracleHeartbeatParams',
          },
        },
      ],
    },
    {
      name: 'oracleInit',
      accounts: [
        {
          name: 'oracle',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracleAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'wallet',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'programState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'queue',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
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
          name: 'params',
          type: {
            defined: 'OracleInitParams',
          },
        },
      ],
    },
    {
      name: 'oracleQueueInit',
      accounts: [
        {
          name: 'oracleQueue',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'buffer',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'OracleQueueInitParams',
          },
        },
      ],
    },
    {
      name: 'oracleQueueSetRewards',
      accounts: [
        {
          name: 'queue',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'OracleQueueSetRewardsParams',
          },
        },
      ],
    },
    {
      name: 'oracleQueueVrfConfig',
      accounts: [
        {
          name: 'queue',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'OracleQueueVrfConfigParams',
          },
        },
      ],
    },
    {
      name: 'oracleWithdraw',
      accounts: [
        {
          name: 'oracle',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracleAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'withdrawAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracleQueue',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'permission',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'programState',
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
          name: 'params',
          type: {
            defined: 'OracleWithdrawParams',
          },
        },
      ],
    },
    {
      name: 'permissionInit',
      accounts: [
        {
          name: 'permission',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'granter',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'grantee',
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
          name: 'params',
          type: {
            defined: 'PermissionInitParams',
          },
        },
      ],
    },
    {
      name: 'permissionSet',
      accounts: [
        {
          name: 'permission',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'PermissionSetParams',
          },
        },
      ],
    },
    {
      name: 'permissionSetVoterWeight',
      accounts: [
        {
          name: 'permission',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'permissionAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracleAuthority',
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
        {
          name: 'programState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'govProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'daoMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spawnRecord',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'voterWeight',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenOwnerRecord',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'realm',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'PermissionSetVoterWeightParams',
          },
        },
      ],
    },
    {
      name: 'programConfig',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'programState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'daoMint',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'ProgramConfigParams',
          },
        },
      ],
    },
    {
      name: 'programInit',
      accounts: [
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
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
          name: 'daoMint',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'ProgramInitParams',
          },
        },
      ],
    },
    {
      name: 'vaultTransfer',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'to',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
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
          name: 'params',
          type: {
            defined: 'VaultTransferParams',
          },
        },
      ],
    },
    {
      name: 'vrfInit',
      accounts: [
        {
          name: 'vrf',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracleQueue',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'escrow',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'programState',
          isMut: false,
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
          name: 'params',
          type: {
            defined: 'VrfInitParams',
          },
        },
      ],
    },
    {
      name: 'vrfProve',
      accounts: [
        {
          name: 'vrf',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'randomnessProducer',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'VrfProveParams',
          },
        },
      ],
    },
    {
      name: 'vrfProveAndVerify',
      accounts: [
        {
          name: 'vrf',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'callbackPid',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'escrow',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'programState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracleAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'oracleWallet',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'instructionsSysvar',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'VrfProveAndVerifyParams',
          },
        },
      ],
    },
    {
      name: 'vrfRequestRandomness',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'vrf',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracleQueue',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'queueAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'dataBuffer',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'permission',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'escrow',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payerWallet',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payerAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'recentBlockhashes',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'programState',
          isMut: false,
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
          name: 'params',
          type: {
            defined: 'VrfRequestRandomnessParams',
          },
        },
      ],
    },
    {
      name: 'vrfVerify',
      accounts: [
        {
          name: 'vrf',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'callbackPid',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'escrow',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'programState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracleAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracleWallet',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'instructionsSysvar',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'VrfVerifyParams',
          },
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'SbState',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'tokenMint',
            type: 'publicKey',
          },
          {
            name: 'tokenVault',
            type: 'publicKey',
          },
          {
            name: 'daoMint',
            type: 'publicKey',
          },
          {
            name: 'ebuf',
            type: {
              array: ['u8', 992],
            },
          },
        ],
      },
    },
    {
      name: 'AggregatorAccountData',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'metadata',
            type: {
              array: ['u8', 128],
            },
          },
          {
            name: 'reserved1',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'queuePubkey',
            type: 'publicKey',
          },
          {
            name: 'oracleRequestBatchSize',
            type: 'u32',
          },
          {
            name: 'minOracleResults',
            type: 'u32',
          },
          {
            name: 'minJobResults',
            type: 'u32',
          },
          {
            name: 'minUpdateDelaySeconds',
            type: 'u32',
          },
          {
            name: 'startAfter',
            type: 'i64',
          },
          {
            name: 'varianceThreshold',
            type: {
              defined: 'SwitchboardDecimal',
            },
          },
          {
            name: 'forceReportPeriod',
            type: 'i64',
          },
          {
            name: 'expiration',
            type: 'i64',
          },
          {
            name: 'consecutiveFailureCount',
            type: 'u64',
          },
          {
            name: 'nextAllowedUpdateTime',
            type: 'i64',
          },
          {
            name: 'isLocked',
            type: 'bool',
          },
          {
            name: 'crankPubkey',
            type: 'publicKey',
          },
          {
            name: 'latestConfirmedRound',
            type: {
              defined: 'AggregatorRound',
            },
          },
          {
            name: 'currentRound',
            type: {
              defined: 'AggregatorRound',
            },
          },
          {
            name: 'jobPubkeysData',
            type: {
              array: ['publicKey', 16],
            },
          },
          {
            name: 'jobHashes',
            type: {
              array: [
                {
                  defined: 'Hash',
                },
                16,
              ],
            },
          },
          {
            name: 'jobPubkeysSize',
            type: 'u32',
          },
          {
            name: 'jobsChecksum',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'historyBuffer',
            type: 'publicKey',
          },
          {
            name: 'previousConfirmedRoundResult',
            type: {
              defined: 'SwitchboardDecimal',
            },
          },
          {
            name: 'previousConfirmedRoundSlot',
            type: 'u64',
          },
          {
            name: 'disableCrank',
            type: 'bool',
          },
          {
            name: 'jobWeights',
            type: {
              array: ['u8', 16],
            },
          },
          {
            name: 'ebuf',
            type: {
              array: ['u8', 147],
            },
          },
        ],
      },
    },
    {
      name: 'PermissionAccountData',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'permissions',
            type: 'u32',
          },
          {
            name: 'granter',
            type: 'publicKey',
          },
          {
            name: 'grantee',
            type: 'publicKey',
          },
          {
            name: 'expiration',
            type: 'i64',
          },
          {
            name: 'ebuf',
            type: {
              array: ['u8', 256],
            },
          },
        ],
      },
    },
    {
      name: 'RealmSpawnRecordAccountData',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'ebuf',
            type: {
              array: ['u8', 256],
            },
          },
        ],
      },
    },
    {
      name: 'LeaseAccountData',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'escrow',
            type: 'publicKey',
          },
          {
            name: 'queue',
            type: 'publicKey',
          },
          {
            name: 'aggregator',
            type: 'publicKey',
          },
          {
            name: 'tokenProgram',
            type: 'publicKey',
          },
          {
            name: 'isActive',
            type: 'bool',
          },
          {
            name: 'crankRowCount',
            type: 'u32',
          },
          {
            name: 'createdAt',
            type: 'i64',
          },
          {
            name: 'updateCount',
            type: 'u128',
          },
          {
            name: 'withdrawAuthority',
            type: 'publicKey',
          },
          {
            name: 'ebuf',
            type: {
              array: ['u8', 256],
            },
          },
        ],
      },
    },
    {
      name: 'OracleQueueAccountData',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'metadata',
            type: {
              array: ['u8', 64],
            },
          },
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'oracleTimeout',
            type: 'u32',
          },
          {
            name: 'reward',
            type: 'u64',
          },
          {
            name: 'minStake',
            type: 'u64',
          },
          {
            name: 'slashingEnabled',
            type: 'bool',
          },
          {
            name: 'varianceToleranceMultiplier',
            type: {
              defined: 'SwitchboardDecimal',
            },
          },
          {
            name: 'feedProbationPeriod',
            type: 'u32',
          },
          {
            name: 'currIdx',
            type: 'u32',
          },
          {
            name: 'size',
            type: 'u32',
          },
          {
            name: 'gcIdx',
            type: 'u32',
          },
          {
            name: 'consecutiveFeedFailureLimit',
            type: 'u64',
          },
          {
            name: 'consecutiveOracleFailureLimit',
            type: 'u64',
          },
          {
            name: 'unpermissionedFeedsEnabled',
            type: 'bool',
          },
          {
            name: 'unpermissionedVrfEnabled',
            type: 'bool',
          },
          {
            name: 'curatorRewardCut',
            type: {
              defined: 'SwitchboardDecimal',
            },
          },
          {
            name: 'lockLeaseFunding',
            type: 'bool',
          },
          {
            name: 'mint',
            type: 'publicKey',
          },
          {
            name: 'ebuf',
            type: {
              array: ['u8', 969],
            },
          },
          {
            name: 'maxSize',
            type: 'u32',
          },
          {
            name: 'dataBuffer',
            type: 'publicKey',
          },
        ],
      },
    },
    {
      name: 'CrankAccountData',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'metadata',
            type: {
              array: ['u8', 64],
            },
          },
          {
            name: 'queuePubkey',
            type: 'publicKey',
          },
          {
            name: 'pqSize',
            type: 'u32',
          },
          {
            name: 'maxRows',
            type: 'u32',
          },
          {
            name: 'jitterModifier',
            type: 'u8',
          },
          {
            name: 'ebuf',
            type: {
              array: ['u8', 255],
            },
          },
          {
            name: 'dataBuffer',
            type: 'publicKey',
          },
        ],
      },
    },
    {
      name: 'OracleAccountData',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'metadata',
            type: {
              array: ['u8', 128],
            },
          },
          {
            name: 'oracleAuthority',
            type: 'publicKey',
          },
          {
            name: 'lastHeartbeat',
            type: 'i64',
          },
          {
            name: 'numInUse',
            type: 'u32',
          },
          {
            name: 'tokenAccount',
            type: 'publicKey',
          },
          {
            name: 'queuePubkey',
            type: 'publicKey',
          },
          {
            name: 'metrics',
            type: {
              defined: 'OracleMetrics',
            },
          },
          {
            name: 'ebuf',
            type: {
              array: ['u8', 256],
            },
          },
        ],
      },
    },
    {
      name: 'JobAccountData',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'metadata',
            type: {
              array: ['u8', 64],
            },
          },
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'expiration',
            type: 'i64',
          },
          {
            name: 'hash',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'data',
            type: 'bytes',
          },
          {
            name: 'referenceCount',
            type: 'u32',
          },
          {
            name: 'totalSpent',
            type: 'u64',
          },
          {
            name: 'createdAt',
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'VrfAccountData',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'status',
            type: {
              defined: 'VrfStatus',
            },
          },
          {
            name: 'counter',
            type: 'u128',
          },
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'oracleQueue',
            type: 'publicKey',
          },
          {
            name: 'escrow',
            type: 'publicKey',
          },
          {
            name: 'callback',
            type: {
              defined: 'CallbackZC',
            },
          },
          {
            name: 'batchSize',
            type: 'u32',
          },
          {
            name: 'builders',
            type: {
              array: [
                {
                  defined: 'VrfBuilder',
                },
                8,
              ],
            },
          },
          {
            name: 'buildersLen',
            type: 'u32',
          },
          {
            name: 'testMode',
            type: 'bool',
          },
          {
            name: 'currentRound',
            type: {
              defined: 'VrfRound',
            },
          },
          {
            name: 'ebuf',
            type: {
              array: ['u8', 1024],
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'AggregatorAddJobParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'weight',
            type: {
              option: 'u8',
            },
          },
        ],
      },
    },
    {
      name: 'AggregatorInitParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'metadata',
            type: {
              array: ['u8', 128],
            },
          },
          {
            name: 'batchSize',
            type: 'u32',
          },
          {
            name: 'minOracleResults',
            type: 'u32',
          },
          {
            name: 'minJobResults',
            type: 'u32',
          },
          {
            name: 'minUpdateDelaySeconds',
            type: 'u32',
          },
          {
            name: 'startAfter',
            type: 'i64',
          },
          {
            name: 'varianceThreshold',
            type: {
              defined: 'BorshDecimal',
            },
          },
          {
            name: 'forceReportPeriod',
            type: 'i64',
          },
          {
            name: 'expiration',
            type: 'i64',
          },
          {
            name: 'stateBump',
            type: 'u8',
          },
          {
            name: 'disableCrank',
            type: 'bool',
          },
        ],
      },
    },
    {
      name: 'AggregatorLockParams',
      type: {
        kind: 'struct',
        fields: [],
      },
    },
    {
      name: 'AggregatorOpenRoundParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'stateBump',
            type: 'u8',
          },
          {
            name: 'leaseBump',
            type: 'u8',
          },
          {
            name: 'permissionBump',
            type: 'u8',
          },
          {
            name: 'jitter',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'AggregatorRemoveJobParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'jobIdx',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'AggregatorSaveResultParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'oracleIdx',
            type: 'u32',
          },
          {
            name: 'error',
            type: 'bool',
          },
          {
            name: 'value',
            type: {
              defined: 'BorshDecimal',
            },
          },
          {
            name: 'jobsChecksum',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'minResponse',
            type: {
              defined: 'BorshDecimal',
            },
          },
          {
            name: 'maxResponse',
            type: {
              defined: 'BorshDecimal',
            },
          },
          {
            name: 'feedPermissionBump',
            type: 'u8',
          },
          {
            name: 'oraclePermissionBump',
            type: 'u8',
          },
          {
            name: 'leaseBump',
            type: 'u8',
          },
          {
            name: 'stateBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'AggregatorSetAuthorityParams',
      type: {
        kind: 'struct',
        fields: [],
      },
    },
    {
      name: 'AggregatorSetBatchSizeParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'batchSize',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'AggregatorSetHistoryBufferParams',
      type: {
        kind: 'struct',
        fields: [],
      },
    },
    {
      name: 'AggregatorSetMinJobsParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'minJobResults',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'AggregatorSetMinOraclesParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'minOracleResults',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'AggregatorSetQueueParams',
      type: {
        kind: 'struct',
        fields: [],
      },
    },
    {
      name: 'AggregatorSetUpdateIntervalParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'newInterval',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'AggregatorSetVarianceThresholdParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'varianceThreshold',
            type: {
              defined: 'BorshDecimal',
            },
          },
        ],
      },
    },
    {
      name: 'CrankInitParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: 'bytes',
          },
          {
            name: 'metadata',
            type: 'bytes',
          },
          {
            name: 'crankSize',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'CrankPopParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'stateBump',
            type: 'u8',
          },
          {
            name: 'leaseBumps',
            type: 'bytes',
          },
          {
            name: 'permissionBumps',
            type: 'bytes',
          },
          {
            name: 'nonce',
            type: {
              option: 'u32',
            },
          },
          {
            name: 'failOpenOnAccountMismatch',
            type: {
              option: 'bool',
            },
          },
        ],
      },
    },
    {
      name: 'CrankPushParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'stateBump',
            type: 'u8',
          },
          {
            name: 'permissionBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'JobInitParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'expiration',
            type: 'i64',
          },
          {
            name: 'stateBump',
            type: 'u8',
          },
          {
            name: 'data',
            type: 'bytes',
          },
        ],
      },
    },
    {
      name: 'LeaseExtendParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'loadAmount',
            type: 'u64',
          },
          {
            name: 'leaseBump',
            type: 'u8',
          },
          {
            name: 'stateBump',
            type: 'u8',
          },
          {
            name: 'walletBumps',
            type: 'bytes',
          },
        ],
      },
    },
    {
      name: 'LeaseInitParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'loadAmount',
            type: 'u64',
          },
          {
            name: 'withdrawAuthority',
            type: 'publicKey',
          },
          {
            name: 'leaseBump',
            type: 'u8',
          },
          {
            name: 'stateBump',
            type: 'u8',
          },
          {
            name: 'walletBumps',
            type: 'bytes',
          },
        ],
      },
    },
    {
      name: 'LeaseSetAuthorityParams',
      type: {
        kind: 'struct',
        fields: [],
      },
    },
    {
      name: 'LeaseWithdrawParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'stateBump',
            type: 'u8',
          },
          {
            name: 'leaseBump',
            type: 'u8',
          },
          {
            name: 'amount',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'OracleHeartbeatParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'permissionBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'OracleInitParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: 'bytes',
          },
          {
            name: 'metadata',
            type: 'bytes',
          },
          {
            name: 'stateBump',
            type: 'u8',
          },
          {
            name: 'oracleBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'OracleQueueInitParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'metadata',
            type: {
              array: ['u8', 64],
            },
          },
          {
            name: 'reward',
            type: 'u64',
          },
          {
            name: 'minStake',
            type: 'u64',
          },
          {
            name: 'feedProbationPeriod',
            type: 'u32',
          },
          {
            name: 'oracleTimeout',
            type: 'u32',
          },
          {
            name: 'slashingEnabled',
            type: 'bool',
          },
          {
            name: 'varianceToleranceMultiplier',
            type: {
              defined: 'BorshDecimal',
            },
          },
          {
            name: 'consecutiveFeedFailureLimit',
            type: 'u64',
          },
          {
            name: 'consecutiveOracleFailureLimit',
            type: 'u64',
          },
          {
            name: 'queueSize',
            type: 'u32',
          },
          {
            name: 'unpermissionedFeeds',
            type: 'bool',
          },
          {
            name: 'unpermissionedVrf',
            type: 'bool',
          },
        ],
      },
    },
    {
      name: 'OracleQueueSetRewardsParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'rewards',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'OracleQueueVrfConfigParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'unpermissionedVrfEnabled',
            type: 'bool',
          },
        ],
      },
    },
    {
      name: 'OracleWithdrawParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'stateBump',
            type: 'u8',
          },
          {
            name: 'permissionBump',
            type: 'u8',
          },
          {
            name: 'amount',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'PermissionInitParams',
      type: {
        kind: 'struct',
        fields: [],
      },
    },
    {
      name: 'PermissionSetParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'permission',
            type: {
              defined: 'SwitchboardPermission',
            },
          },
          {
            name: 'enable',
            type: 'bool',
          },
        ],
      },
    },
    {
      name: 'PermissionSetVoterWeightParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'stateBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'ProgramConfigParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'token',
            type: 'publicKey',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'daoMint',
            type: 'publicKey',
          },
        ],
      },
    },
    {
      name: 'ProgramInitParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'stateBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'VaultTransferParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'stateBump',
            type: 'u8',
          },
          {
            name: 'amount',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'VrfInitParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'callback',
            type: {
              defined: 'Callback',
            },
          },
          {
            name: 'stateBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'VrfProveParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'proof',
            type: 'bytes',
          },
          {
            name: 'idx',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'VrfProveAndVerifyParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'nonce',
            type: {
              option: 'u32',
            },
          },
          {
            name: 'stateBump',
            type: 'u8',
          },
          {
            name: 'idx',
            type: 'u32',
          },
          {
            name: 'proof',
            type: 'bytes',
          },
        ],
      },
    },
    {
      name: 'VrfRequestRandomnessParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'permissionBump',
            type: 'u8',
          },
          {
            name: 'stateBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'VrfVerifyParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'nonce',
            type: {
              option: 'u32',
            },
          },
          {
            name: 'stateBump',
            type: 'u8',
          },
          {
            name: 'idx',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'Hash',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'data',
            type: {
              array: ['u8', 32],
            },
          },
        ],
      },
    },
    {
      name: 'AggregatorRound',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'numSuccess',
            type: 'u32',
          },
          {
            name: 'numError',
            type: 'u32',
          },
          {
            name: 'isClosed',
            type: 'bool',
          },
          {
            name: 'roundOpenSlot',
            type: 'u64',
          },
          {
            name: 'roundOpenTimestamp',
            type: 'i64',
          },
          {
            name: 'result',
            type: {
              defined: 'SwitchboardDecimal',
            },
          },
          {
            name: 'stdDeviation',
            type: {
              defined: 'SwitchboardDecimal',
            },
          },
          {
            name: 'minResponse',
            type: {
              defined: 'SwitchboardDecimal',
            },
          },
          {
            name: 'maxResponse',
            type: {
              defined: 'SwitchboardDecimal',
            },
          },
          {
            name: 'oraclePubkeysData',
            type: {
              array: ['publicKey', 16],
            },
          },
          {
            name: 'mediansData',
            type: {
              array: [
                {
                  defined: 'SwitchboardDecimal',
                },
                16,
              ],
            },
          },
          {
            name: 'currentPayout',
            type: {
              array: ['i64', 16],
            },
          },
          {
            name: 'mediansFulfilled',
            type: {
              array: ['bool', 16],
            },
          },
          {
            name: 'errorsFulfilled',
            type: {
              array: ['bool', 16],
            },
          },
        ],
      },
    },
    {
      name: 'AggregatorHistoryRow',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'timestamp',
            type: 'i64',
          },
          {
            name: 'value',
            type: {
              defined: 'SwitchboardDecimal',
            },
          },
        ],
      },
    },
    {
      name: 'SwitchboardDecimal',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'mantissa',
            type: 'i128',
          },
          {
            name: 'scale',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'CrankRow',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pubkey',
            type: 'publicKey',
          },
          {
            name: 'nextTimestamp',
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'OracleMetrics',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'consecutiveSuccess',
            type: 'u64',
          },
          {
            name: 'consecutiveError',
            type: 'u64',
          },
          {
            name: 'consecutiveDisagreement',
            type: 'u64',
          },
          {
            name: 'consecutiveLateResponse',
            type: 'u64',
          },
          {
            name: 'consecutiveFailure',
            type: 'u64',
          },
          {
            name: 'totalSuccess',
            type: 'u128',
          },
          {
            name: 'totalError',
            type: 'u128',
          },
          {
            name: 'totalDisagreement',
            type: 'u128',
          },
          {
            name: 'totalLateResponse',
            type: 'u128',
          },
        ],
      },
    },
    {
      name: 'BorshDecimal',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'mantissa',
            type: 'i128',
          },
          {
            name: 'scale',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'EcvrfProofZC',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'gamma',
            type: {
              defined: 'EdwardsPointZC',
            },
          },
          {
            name: 'c',
            type: {
              defined: 'Scalar',
            },
          },
          {
            name: 's',
            type: {
              defined: 'Scalar',
            },
          },
        ],
      },
    },
    {
      name: 'Scalar',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bytes',
            type: {
              array: ['u8', 32],
            },
          },
        ],
      },
    },
    {
      name: 'FieldElementZC',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bytes',
            type: {
              array: ['u64', 5],
            },
          },
        ],
      },
    },
    {
      name: 'CompletedPointZC',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'x',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 'y',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 'z',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 't',
            type: {
              defined: 'FieldElementZC',
            },
          },
        ],
      },
    },
    {
      name: 'EdwardsPointZC',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'x',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 'y',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 'z',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 't',
            type: {
              defined: 'FieldElementZC',
            },
          },
        ],
      },
    },
    {
      name: 'ProjectivePointZC',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'x',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 'y',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 'z',
            type: {
              defined: 'FieldElementZC',
            },
          },
        ],
      },
    },
    {
      name: 'EcvrfIntermediate',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'r',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 'nS',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 'd',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 't13',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 't15',
            type: {
              defined: 'FieldElementZC',
            },
          },
        ],
      },
    },
    {
      name: 'VrfBuilder',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'producer',
            type: 'publicKey',
          },
          {
            name: 'status',
            type: {
              defined: 'VrfStatus',
            },
          },
          {
            name: 'reprProof',
            type: {
              array: ['u8', 80],
            },
          },
          {
            name: 'proof',
            type: {
              defined: 'EcvrfProofZC',
            },
          },
          {
            name: 'yPoint',
            type: 'publicKey',
          },
          {
            name: 'stage',
            type: 'u32',
          },
          {
            name: 'stage1Out',
            type: {
              defined: 'EcvrfIntermediate',
            },
          },
          {
            name: 'r1',
            type: {
              defined: 'EdwardsPointZC',
            },
          },
          {
            name: 'r2',
            type: {
              defined: 'EdwardsPointZC',
            },
          },
          {
            name: 'stage3Out',
            type: {
              defined: 'EcvrfIntermediate',
            },
          },
          {
            name: 'hPoint',
            type: {
              defined: 'EdwardsPointZC',
            },
          },
          {
            name: 'sReduced',
            type: {
              defined: 'Scalar',
            },
          },
          {
            name: 'yPointBuilder',
            type: {
              array: [
                {
                  defined: 'FieldElementZC',
                },
                3,
              ],
            },
          },
          {
            name: 'yRistrettoPoint',
            type: {
              defined: 'EdwardsPointZC',
            },
          },
          {
            name: 'mulRound',
            type: 'u8',
          },
          {
            name: 'hashPointsRound',
            type: 'u8',
          },
          {
            name: 'mulTmp1',
            type: {
              defined: 'CompletedPointZC',
            },
          },
          {
            name: 'uPoint1',
            type: {
              defined: 'EdwardsPointZC',
            },
          },
          {
            name: 'uPoint2',
            type: {
              defined: 'EdwardsPointZC',
            },
          },
          {
            name: 'vPoint1',
            type: {
              defined: 'EdwardsPointZC',
            },
          },
          {
            name: 'vPoint2',
            type: {
              defined: 'EdwardsPointZC',
            },
          },
          {
            name: 'uPoint',
            type: {
              defined: 'EdwardsPointZC',
            },
          },
          {
            name: 'vPoint',
            type: {
              defined: 'EdwardsPointZC',
            },
          },
          {
            name: 'u1',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 'u2',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 'invertee',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 'y',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 'z',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 'p1Bytes',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'p2Bytes',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'p3Bytes',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'p4Bytes',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'cPrimeHashbuf',
            type: {
              array: ['u8', 16],
            },
          },
          {
            name: 'm1',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 'm2',
            type: {
              defined: 'FieldElementZC',
            },
          },
          {
            name: 'txRemaining',
            type: 'u32',
          },
          {
            name: 'verified',
            type: 'bool',
          },
          {
            name: 'result',
            type: {
              array: ['u8', 32],
            },
          },
        ],
      },
    },
    {
      name: 'AccountMetaZC',
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
      name: 'AccountMetaBorsh',
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
      name: 'CallbackZC',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'programId',
            type: 'publicKey',
          },
          {
            name: 'accounts',
            type: {
              array: [
                {
                  defined: 'AccountMetaZC',
                },
                32,
              ],
            },
          },
          {
            name: 'accountsLen',
            type: 'u32',
          },
          {
            name: 'ixData',
            type: {
              array: ['u8', 1024],
            },
          },
          {
            name: 'ixDataLen',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'Callback',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'programId',
            type: 'publicKey',
          },
          {
            name: 'accounts',
            type: {
              vec: {
                defined: 'AccountMetaBorsh',
              },
            },
          },
          {
            name: 'ixData',
            type: 'bytes',
          },
        ],
      },
    },
    {
      name: 'VrfRound',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'alpha',
            type: {
              array: ['u8', 256],
            },
          },
          {
            name: 'alphaLen',
            type: 'u32',
          },
          {
            name: 'requestSlot',
            type: 'u64',
          },
          {
            name: 'requestTimestamp',
            type: 'i64',
          },
          {
            name: 'result',
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'numVerified',
            type: 'u32',
          },
          {
            name: 'ebuf',
            type: {
              array: ['u8', 256],
            },
          },
        ],
      },
    },
    {
      name: 'Lanes',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'C',
          },
          {
            name: 'D',
          },
          {
            name: 'AB',
          },
          {
            name: 'AC',
          },
          {
            name: 'CD',
          },
          {
            name: 'AD',
          },
          {
            name: 'BC',
          },
          {
            name: 'ABCD',
          },
        ],
      },
    },
    {
      name: 'Shuffle',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'AAAA',
          },
          {
            name: 'BBBB',
          },
          {
            name: 'CACA',
          },
          {
            name: 'DBBD',
          },
          {
            name: 'ADDA',
          },
          {
            name: 'CBCB',
          },
          {
            name: 'ABAB',
          },
          {
            name: 'BADC',
          },
          {
            name: 'BACD',
          },
          {
            name: 'ABDC',
          },
        ],
      },
    },
    {
      name: 'Shuffle',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'AAAA',
          },
          {
            name: 'BBBB',
          },
          {
            name: 'BADC',
          },
          {
            name: 'BACD',
          },
          {
            name: 'ADDA',
          },
          {
            name: 'CBCB',
          },
          {
            name: 'ABDC',
          },
          {
            name: 'ABAB',
          },
          {
            name: 'DBBD',
          },
          {
            name: 'CACA',
          },
        ],
      },
    },
    {
      name: 'Lanes',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'D',
          },
          {
            name: 'C',
          },
          {
            name: 'AB',
          },
          {
            name: 'AC',
          },
          {
            name: 'AD',
          },
          {
            name: 'BCD',
          },
        ],
      },
    },
    {
      name: 'Error',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'InvalidPublicKey',
          },
          {
            name: 'SerializationError',
          },
          {
            name: 'DeserializationError',
          },
          {
            name: 'InvalidDataError',
          },
        ],
      },
    },
    {
      name: 'SwitchboardPermission',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'PermitOracleHeartbeat',
          },
          {
            name: 'PermitOracleQueueUsage',
          },
          {
            name: 'PermitVrfRequests',
          },
        ],
      },
    },
    {
      name: 'OracleResponseType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'TypeSuccess',
          },
          {
            name: 'TypeError',
          },
          {
            name: 'TypeDisagreement',
          },
          {
            name: 'TypeNoResponse',
          },
        ],
      },
    },
    {
      name: 'VrfStatus',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'StatusNone',
          },
          {
            name: 'StatusRequesting',
          },
          {
            name: 'StatusVerifying',
          },
          {
            name: 'StatusVerified',
          },
          {
            name: 'StatusCallbackSuccess',
          },
          {
            name: 'StatusVerifyFailure',
          },
        ],
      },
    },
  ],
  events: [
    {
      name: 'AggregatorInitEvent',
      fields: [
        {
          name: 'feedPubkey',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'VrfRequestRandomnessEvent',
      fields: [
        {
          name: 'vrfPubkey',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'oraclePubkeys',
          type: {
            vec: 'publicKey',
          },
          index: false,
        },
        {
          name: 'loadAmount',
          type: 'u64',
          index: false,
        },
        {
          name: 'existingAmount',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'VrfRequestEvent',
      fields: [
        {
          name: 'vrfPubkey',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'oraclePubkeys',
          type: {
            vec: 'publicKey',
          },
          index: false,
        },
      ],
    },
    {
      name: 'VrfProveEvent',
      fields: [
        {
          name: 'vrfPubkey',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'oraclePubkey',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'authorityPubkey',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'VrfVerifyEvent',
      fields: [
        {
          name: 'vrfPubkey',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'oraclePubkey',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'authorityPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'VrfCallbackPerformedEvent',
      fields: [
        {
          name: 'vrfPubkey',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'oraclePubkey',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'AggregatorOpenRoundEvent',
      fields: [
        {
          name: 'feedPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'oraclePubkeys',
          type: {
            vec: 'publicKey',
          },
          index: false,
        },
        {
          name: 'jobPubkeys',
          type: {
            vec: 'publicKey',
          },
          index: false,
        },
        {
          name: 'remainingFunds',
          type: 'u64',
          index: false,
        },
        {
          name: 'queueAuthority',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'AggregatorValueUpdateEvent',
      fields: [
        {
          name: 'feedPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'value',
          type: {
            defined: 'BorshDecimal',
          },
          index: false,
        },
        {
          name: 'slot',
          type: 'u64',
          index: false,
        },
        {
          name: 'timestamp',
          type: 'i64',
          index: false,
        },
        {
          name: 'oraclePubkeys',
          type: {
            vec: 'publicKey',
          },
          index: false,
        },
        {
          name: 'oracleValues',
          type: {
            vec: {
              defined: 'BorshDecimal',
            },
          },
          index: false,
        },
      ],
    },
    {
      name: 'OracleRewardEvent',
      fields: [
        {
          name: 'feedPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'leasePubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'oraclePubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'walletPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
        {
          name: 'roundSlot',
          type: 'u64',
          index: false,
        },
        {
          name: 'timestamp',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'OracleWithdrawEvent',
      fields: [
        {
          name: 'oraclePubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'walletPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'destinationWallet',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'previousAmount',
          type: 'u64',
          index: false,
        },
        {
          name: 'newAmount',
          type: 'u64',
          index: false,
        },
        {
          name: 'timestamp',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'LeaseWithdrawEvent',
      fields: [
        {
          name: 'leasePubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'walletPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'previousAmount',
          type: 'u64',
          index: false,
        },
        {
          name: 'newAmount',
          type: 'u64',
          index: false,
        },
        {
          name: 'timestamp',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'OracleSlashEvent',
      fields: [
        {
          name: 'feedPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'leasePubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'oraclePubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'walletPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
        {
          name: 'roundSlot',
          type: 'u64',
          index: false,
        },
        {
          name: 'timestamp',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'LeaseFundEvent',
      fields: [
        {
          name: 'leasePubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'funder',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
        {
          name: 'timestamp',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'ProbationBrokenEvent',
      fields: [
        {
          name: 'feedPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'queuePubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'timestamp',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'FeedPermissionRevokedEvent',
      fields: [
        {
          name: 'feedPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'timestamp',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'GarbageCollectFailureEvent',
      fields: [
        {
          name: 'queuePubkey',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'OracleBootedEvent',
      fields: [
        {
          name: 'queuePubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'oraclePubkey',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'CrankLeaseInsufficientFundsEvent',
      fields: [
        {
          name: 'feedPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'leasePubkey',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'CrankPopExpectedFailureEvent',
      fields: [
        {
          name: 'feedPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'leasePubkey',
          type: 'publicKey',
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'ArrayOperationError',
      msg: 'Illegal operation on a Switchboard array.',
    },
    {
      code: 6001,
      name: 'QueueOperationError',
      msg: 'Illegal operation on a Switchboard queue.',
    },
    {
      code: 6002,
      name: 'IncorrectProgramOwnerError',
      msg:
        'An account required to be owned by the program has a different owner.',
    },
    {
      code: 6003,
      name: 'InvalidAggregatorRound',
      msg: 'Aggregator is not currently populated with a valid round.',
    },
    {
      code: 6004,
      name: 'TooManyAggregatorJobs',
      msg: 'Aggregator cannot fit any more jobs.',
    },
    {
      code: 6005,
      name: 'AggregatorCurrentRoundClosed',
      msg:
        "Aggregator's current round is closed. No results are being accepted.",
    },
    {
      code: 6006,
      name: 'AggregatorInvalidSaveResult',
      msg: 'Aggregator received an invalid save result instruction.',
    },
    {
      code: 6007,
      name: 'InvalidStrDecimalConversion',
      msg: 'Failed to convert string to decimal format.',
    },
    {
      code: 6008,
      name: 'AccountLoaderMissingSignature',
      msg: 'AccountLoader account is missing a required signature.',
    },
    {
      code: 6009,
      name: 'MissingRequiredSignature',
      msg: 'Account is missing a required signature.',
    },
    {
      code: 6010,
      name: 'ArrayOverflowError',
      msg: 'The attempted action will overflow a zero-copy account array.',
    },
    {
      code: 6011,
      name: 'ArrayUnderflowError',
      msg: 'The attempted action will underflow a zero-copy account array.',
    },
    {
      code: 6012,
      name: 'PubkeyNotFoundError',
      msg: 'The queried public key was not found.',
    },
    {
      code: 6013,
      name: 'AggregatorIllegalRoundOpenCall',
      msg: 'Aggregator round open called too early.',
    },
    {
      code: 6014,
      name: 'AggregatorIllegalRoundCloseCall',
      msg: 'Aggregator round close called too early.',
    },
    {
      code: 6015,
      name: 'AggregatorClosedError',
      msg: 'Aggregator is closed. Illegal action.',
    },
    {
      code: 6016,
      name: 'IllegalOracleIdxError',
      msg: 'Illegal oracle index.',
    },
    {
      code: 6017,
      name: 'OracleAlreadyRespondedError',
      msg: 'The provided oracle has already responded this round.',
    },
    {
      code: 6018,
      name: 'ProtoDeserializeError',
      msg: 'Failed to deserialize protocol buffer.',
    },
    {
      code: 6019,
      name: 'UnauthorizedStateUpdateError',
      msg: 'Unauthorized program state modification attempted.',
    },
    {
      code: 6020,
      name: 'MissingOracleAccountsError',
      msg: 'Not enough oracle accounts provided to closeRounds.',
    },
    {
      code: 6021,
      name: 'OracleMismatchError',
      msg: 'An unexpected oracle account was provided for the transaction.',
    },
    {
      code: 6022,
      name: 'CrankMaxCapacityError',
      msg: "Attempted to push to a Crank that's at capacity",
    },
    {
      code: 6023,
      name: 'AggregatorLeaseInsufficientFunds',
      msg:
        'Aggregator update call attempted but attached lease has insufficient funds.',
    },
    {
      code: 6024,
      name: 'IncorrectTokenAccountMint',
      msg:
        'The provided token account does not point to the Switchboard token mint.',
    },
    {
      code: 6025,
      name: 'InvalidEscrowAccount',
      msg: 'An invalid escrow account was provided.',
    },
    {
      code: 6026,
      name: 'CrankEmptyError',
      msg: 'Crank empty. Pop failed.',
    },
    {
      code: 6027,
      name: 'PdaDeriveError',
      msg: 'Failed to derive a PDA from the provided seed.',
    },
    {
      code: 6028,
      name: 'AggregatorAccountNotFound',
      msg: 'Aggregator account missing from provided account list.',
    },
    {
      code: 6029,
      name: 'PermissionAccountNotFound',
      msg: 'Permission account missing from provided account list.',
    },
    {
      code: 6030,
      name: 'LeaseAccountDeriveFailure',
      msg: 'Failed to derive a lease account.',
    },
    {
      code: 6031,
      name: 'PermissionAccountDeriveFailure',
      msg: 'Failed to derive a permission account.',
    },
    {
      code: 6032,
      name: 'EscrowAccountNotFound',
      msg: 'Escrow account missing from provided account list.',
    },
    {
      code: 6033,
      name: 'LeaseAccountNotFound',
      msg: 'Lease account missing from provided account list.',
    },
    {
      code: 6034,
      name: 'DecimalConversionError',
      msg: 'Decimal conversion method failed.',
    },
    {
      code: 6035,
      name: 'PermissionDenied',
      msg: 'Permission account is missing required flags for the given action.',
    },
    {
      code: 6036,
      name: 'QueueAtCapacity',
      msg: 'Oracle queue is at lease capacity.',
    },
    {
      code: 6037,
      name: 'ExcessiveCrankRowsError',
      msg: 'Data feed is already pushed on a crank.',
    },
    {
      code: 6038,
      name: 'AggregatorLockedError',
      msg:
        'Aggregator is locked, no setting modifications or job additions allowed.',
    },
    {
      code: 6039,
      name: 'AggregatorInvalidBatchSizeError',
      msg: 'Aggregator invalid batch size.',
    },
    {
      code: 6040,
      name: 'AggregatorJobChecksumMismatch',
      msg: 'Oracle provided an incorrect aggregator job checksum.',
    },
    {
      code: 6041,
      name: 'IntegerOverflowError',
      msg: 'An integer overflow occurred.',
    },
    {
      code: 6042,
      name: 'InvalidUpdatePeriodError',
      msg: 'Minimum update period is 5 seconds.',
    },
    {
      code: 6043,
      name: 'NoResultsError',
      msg: 'Aggregator round evaluation attempted with no results.',
    },
    {
      code: 6044,
      name: 'InvalidExpirationError',
      msg: 'An expiration constraint was broken.',
    },
    {
      code: 6045,
      name: 'InsufficientStakeError',
      msg: 'An account provided insufficient stake for action.',
    },
    {
      code: 6046,
      name: 'LeaseInactiveError',
      msg: 'The provided lease account is not active.',
    },
    {
      code: 6047,
      name: 'NoAggregatorJobsFound',
      msg: 'No jobs are currently included in the aggregator.',
    },
    {
      code: 6048,
      name: 'IntegerUnderflowError',
      msg: 'An integer underflow occurred.',
    },
    {
      code: 6049,
      name: 'OracleQueueMismatch',
      msg: 'An invalid oracle queue account was provided.',
    },
    {
      code: 6050,
      name: 'OracleWalletMismatchError',
      msg:
        'An unexpected oracle wallet account was provided for the transaction.',
    },
    {
      code: 6051,
      name: 'InvalidBufferAccountError',
      msg: 'An invalid buffer account was provided.',
    },
    {
      code: 6052,
      name: 'InsufficientOracleQueueError',
      msg: 'Insufficient oracle queue size.',
    },
    {
      code: 6053,
      name: 'InvalidAuthorityError',
      msg: 'Invalid authority account provided.',
    },
    {
      code: 6054,
      name: 'InvalidTokenAccountMintError',
      msg: 'A provided token wallet is associated with an incorrect mint.',
    },
    {
      code: 6055,
      name: 'ExcessiveLeaseWithdrawlError',
      msg:
        'You must leave enough funds to perform at least 1 update in the lease.',
    },
    {
      code: 6056,
      name: 'InvalideHistoryAccountError',
      msg: 'Invalid history account provided.',
    },
    {
      code: 6057,
      name: 'InvalidLeaseAccountEscrowError',
      msg: 'Invalid lease account escrow.',
    },
    {
      code: 6058,
      name: 'InvalidCrankAccountError',
      msg: 'Invalid crank provided.',
    },
    {
      code: 6059,
      name: 'CrankNoElementsReadyError',
      msg: 'No elements ready to be popped.',
    },
    {
      code: 6060,
      name: 'IndexOutOfBoundsError',
      msg: 'Index out of bounds',
    },
    {
      code: 6061,
      name: 'VrfInvalidRequestError',
      msg: 'Invalid vrf request params',
    },
    {
      code: 6062,
      name: 'VrfInvalidProofSubmissionError',
      msg: 'Vrf proof failed to verify',
    },
    {
      code: 6063,
      name: 'VrfVerifyError',
      msg: 'Error in verifying vrf proof.',
    },
    {
      code: 6064,
      name: 'VrfCallbackError',
      msg: 'Vrf callback function failed.',
    },
    {
      code: 6065,
      name: 'VrfCallbackParamsError',
      msg: 'Invalid vrf callback params provided.',
    },
    {
      code: 6066,
      name: 'VrfCallbackAlreadyCalledError',
      msg: 'Vrf callback has already been triggered.',
    },
    {
      code: 6067,
      name: 'VrfInvalidPubkeyError',
      msg: 'The provided pubkey is invalid to use in ecvrf proofs',
    },
    {
      code: 6068,
      name: 'VrfTooManyVerifyCallsError',
      msg: 'Number of required verify calls exceeded',
    },
    {
      code: 6069,
      name: 'VrfRequestAlreadyLaunchedError',
      msg: 'Vrf request is already pending',
    },
    {
      code: 6070,
      name: 'VrfInsufficientVerificationError',
      msg: 'Insufficient amount of proofs collected for VRF callback',
    },
    {
      code: 6071,
      name: 'InvalidVrfProducerError',
      msg: 'An incorrect oracle attempted to submit a proof',
    },
    {
      code: 6072,
      name: 'InvalidGovernancePidError',
      msg: 'Invalid SPLGovernance Account Supplied',
    },
    {
      code: 6073,
      name: 'InvalidGovernanceAccountError',
      msg: 'An Invalid Governance Account was supplied',
    },
    {
      code: 6074,
      name: 'MissingOptionalAccount',
      msg: 'Expected an optional account',
    },
    {
      code: 6075,
      name: 'InvalidSpawnRecordOwner',
      msg: 'Invalid Owner for Spawn Record',
    },
    {
      code: 6076,
      name: 'NoopError',
      msg: 'Noop error',
    },
    {
      code: 6077,
      name: 'MissingRequiredAccountsError',
      msg: 'A required instruction account was not included',
    },
    {
      code: 6078,
      name: 'InvalidMintError',
      msg: 'Invalid mint account passed for instruction',
    },
    {
      code: 6079,
      name: 'InvalidTokenAccountKeyError',
      msg: 'An invalid token account was passed into the instruction',
    },
    {
      code: 6080,
      name: 'InvalidJobAccountError',
      msg: '',
    },
  ],
}
