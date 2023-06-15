export type NftVoter = {
  "version": "0.0.0",
  "name": "nft_voter",
  "instructions": [
    {
      "name": "createRegistrar",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governanceProgramId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
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
          "name": "maxCollections",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createVoterWeightRecord",
      "accounts": [
        {
          "name": "voterWeightRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governanceProgramId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmGoverningTokenMint",
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
          "name": "governingTokenOwner",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "createMaxVoterWeightRecord",
      "accounts": [
        {
          "name": "maxVoterWeightRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governanceProgramId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmGoverningTokenMint",
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
      "args": []
    },
    {
      "name": "updateVoterWeightRecord",
      "accounts": [
        {
          "name": "registrar",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voterWeightRecord",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "voterWeightAction",
          "type": {
            "defined": "VoterWeightAction"
          }
        }
      ]
    },
    {
      "name": "relinquishNftVote",
      "accounts": [
        {
          "name": "registrar",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voterWeightRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governance",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voterTokenOwnerRecord",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "voteRecord",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "beneficiary",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "configureCollection",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "collection",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "maxVoterWeightRecord",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "weight",
          "type": "u64"
        },
        {
          "name": "size",
          "type": "u32"
        }
      ]
    },
    {
      "name": "castNftVote",
      "accounts": [
        {
          "name": "registrar",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voterWeightRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterTokenOwnerRecord",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": true
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
          "name": "proposal",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "nftVoteRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposal",
            "type": "publicKey"
          },
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "governingTokenOwner",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "maxVoterWeightRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "realm",
            "type": "publicKey"
          },
          {
            "name": "governingTokenMint",
            "type": "publicKey"
          },
          {
            "name": "maxVoterWeight",
            "type": "u64"
          },
          {
            "name": "maxVoterWeightExpiry",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "registrar",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "governanceProgramId",
            "type": "publicKey"
          },
          {
            "name": "realm",
            "type": "publicKey"
          },
          {
            "name": "governingTokenMint",
            "type": "publicKey"
          },
          {
            "name": "collectionConfigs",
            "type": {
              "vec": {
                "defined": "CollectionConfig"
              }
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    },
    {
      "name": "voterWeightRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "realm",
            "type": "publicKey"
          },
          {
            "name": "governingTokenMint",
            "type": "publicKey"
          },
          {
            "name": "governingTokenOwner",
            "type": "publicKey"
          },
          {
            "name": "voterWeight",
            "type": "u64"
          },
          {
            "name": "voterWeightExpiry",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "weightAction",
            "type": {
              "option": {
                "defined": "VoterWeightAction"
              }
            }
          },
          {
            "name": "weightActionTarget",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CollectionConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "collection",
            "type": "publicKey"
          },
          {
            "name": "size",
            "type": "u32"
          },
          {
            "name": "weight",
            "type": "u64"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "NftVoterError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidRealmAuthority"
          },
          {
            "name": "InvalidRealmForRegistrar"
          },
          {
            "name": "InvalidCollectionSize"
          },
          {
            "name": "InvalidMaxVoterWeightRecordRealm"
          },
          {
            "name": "InvalidMaxVoterWeightRecordMint"
          },
          {
            "name": "CastVoteIsNotAllowed"
          },
          {
            "name": "InvalidVoterWeightRecordRealm"
          },
          {
            "name": "InvalidVoterWeightRecordMint"
          },
          {
            "name": "InvalidTokenOwnerForVoterWeightRecord"
          },
          {
            "name": "CollectionMustBeVerified"
          },
          {
            "name": "VoterDoesNotOwnNft"
          },
          {
            "name": "CollectionNotFound"
          },
          {
            "name": "MissingMetadataCollection"
          },
          {
            "name": "TokenMetadataDoesNotMatch"
          },
          {
            "name": "InvalidAccountOwner"
          },
          {
            "name": "InvalidTokenMetadataAccount"
          },
          {
            "name": "DuplicatedNftDetected"
          },
          {
            "name": "InvalidNftAmount"
          },
          {
            "name": "NftAlreadyVoted"
          },
          {
            "name": "InvalidProposalForNftVoteRecord"
          },
          {
            "name": "InvalidTokenOwnerForNftVoteRecord"
          },
          {
            "name": "VoteRecordMustBeWithdrawn"
          },
          {
            "name": "InvalidVoteRecordForNftVoteRecord"
          },
          {
            "name": "VoterWeightRecordMustBeExpired"
          },
          {
            "name": "CannotConfigureCollectionWithVotingProposals"
          }
        ]
      }
    },
    {
      "name": "VoterWeightAction",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "CastVote"
          },
          {
            "name": "CommentProposal"
          },
          {
            "name": "CreateGovernance"
          },
          {
            "name": "CreateProposal"
          },
          {
            "name": "SignOffProposal"
          }
        ]
      }
    }
  ]
};

export const IDL: NftVoter = {
  "version": "0.0.0",
  "name": "nft_voter",
  "instructions": [
    {
      "name": "createRegistrar",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governanceProgramId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
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
          "name": "maxCollections",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createVoterWeightRecord",
      "accounts": [
        {
          "name": "voterWeightRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governanceProgramId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmGoverningTokenMint",
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
          "name": "governingTokenOwner",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "createMaxVoterWeightRecord",
      "accounts": [
        {
          "name": "maxVoterWeightRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governanceProgramId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmGoverningTokenMint",
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
      "args": []
    },
    {
      "name": "updateVoterWeightRecord",
      "accounts": [
        {
          "name": "registrar",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voterWeightRecord",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "voterWeightAction",
          "type": {
            "defined": "VoterWeightAction"
          }
        }
      ]
    },
    {
      "name": "relinquishNftVote",
      "accounts": [
        {
          "name": "registrar",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voterWeightRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governance",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voterTokenOwnerRecord",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "voteRecord",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "beneficiary",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "configureCollection",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "collection",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "maxVoterWeightRecord",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "weight",
          "type": "u64"
        },
        {
          "name": "size",
          "type": "u32"
        }
      ]
    },
    {
      "name": "castNftVote",
      "accounts": [
        {
          "name": "registrar",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voterWeightRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterTokenOwnerRecord",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": true
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
          "name": "proposal",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "nftVoteRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposal",
            "type": "publicKey"
          },
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "governingTokenOwner",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "maxVoterWeightRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "realm",
            "type": "publicKey"
          },
          {
            "name": "governingTokenMint",
            "type": "publicKey"
          },
          {
            "name": "maxVoterWeight",
            "type": "u64"
          },
          {
            "name": "maxVoterWeightExpiry",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "registrar",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "governanceProgramId",
            "type": "publicKey"
          },
          {
            "name": "realm",
            "type": "publicKey"
          },
          {
            "name": "governingTokenMint",
            "type": "publicKey"
          },
          {
            "name": "collectionConfigs",
            "type": {
              "vec": {
                "defined": "CollectionConfig"
              }
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    },
    {
      "name": "voterWeightRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "realm",
            "type": "publicKey"
          },
          {
            "name": "governingTokenMint",
            "type": "publicKey"
          },
          {
            "name": "governingTokenOwner",
            "type": "publicKey"
          },
          {
            "name": "voterWeight",
            "type": "u64"
          },
          {
            "name": "voterWeightExpiry",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "weightAction",
            "type": {
              "option": {
                "defined": "VoterWeightAction"
              }
            }
          },
          {
            "name": "weightActionTarget",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CollectionConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "collection",
            "type": "publicKey"
          },
          {
            "name": "size",
            "type": "u32"
          },
          {
            "name": "weight",
            "type": "u64"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "NftVoterError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidRealmAuthority"
          },
          {
            "name": "InvalidRealmForRegistrar"
          },
          {
            "name": "InvalidCollectionSize"
          },
          {
            "name": "InvalidMaxVoterWeightRecordRealm"
          },
          {
            "name": "InvalidMaxVoterWeightRecordMint"
          },
          {
            "name": "CastVoteIsNotAllowed"
          },
          {
            "name": "InvalidVoterWeightRecordRealm"
          },
          {
            "name": "InvalidVoterWeightRecordMint"
          },
          {
            "name": "InvalidTokenOwnerForVoterWeightRecord"
          },
          {
            "name": "CollectionMustBeVerified"
          },
          {
            "name": "VoterDoesNotOwnNft"
          },
          {
            "name": "CollectionNotFound"
          },
          {
            "name": "MissingMetadataCollection"
          },
          {
            "name": "TokenMetadataDoesNotMatch"
          },
          {
            "name": "InvalidAccountOwner"
          },
          {
            "name": "InvalidTokenMetadataAccount"
          },
          {
            "name": "DuplicatedNftDetected"
          },
          {
            "name": "InvalidNftAmount"
          },
          {
            "name": "NftAlreadyVoted"
          },
          {
            "name": "InvalidProposalForNftVoteRecord"
          },
          {
            "name": "InvalidTokenOwnerForNftVoteRecord"
          },
          {
            "name": "VoteRecordMustBeWithdrawn"
          },
          {
            "name": "InvalidVoteRecordForNftVoteRecord"
          },
          {
            "name": "VoterWeightRecordMustBeExpired"
          },
          {
            "name": "CannotConfigureCollectionWithVotingProposals"
          }
        ]
      }
    },
    {
      "name": "VoterWeightAction",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "CastVote"
          },
          {
            "name": "CommentProposal"
          },
          {
            "name": "CreateGovernance"
          },
          {
            "name": "CreateProposal"
          },
          {
            "name": "SignOffProposal"
          }
        ]
      }
    }
  ]
};
