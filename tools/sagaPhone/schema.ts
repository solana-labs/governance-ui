export type Mortar = {
  version: '0.1.0'
  name: 'mortar'
  instructions: [
    {
      name: 'initialize'
      accounts: [
        {
          name: 'initializer'
          isMut: true
          isSigner: true
        },
        {
          name: 'paymentMint'
          isMut: false
          isSigner: false
        },
        {
          name: 'issuer'
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
          name: 'nonce'
          type: 'u64'
        },
        {
          name: 'deposit'
          type: 'u64'
        },
        {
          name: 'closingTime'
          type: {
            option: 'i64'
          }
        }
      ]
    },
    {
      name: 'purchase'
      accounts: [
        {
          name: 'issuer'
          isMut: true
          isSigner: false
        },
        {
          name: 'purchaser'
          isMut: true
          isSigner: true
        },
        {
          name: 'receipt'
          isMut: true
          isSigner: false
        },
        {
          name: 'receiptTokens'
          isMut: true
          isSigner: false
        },
        {
          name: 'purchaserTokens'
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
        }
      ]
      args: []
    },
    {
      name: 'refund'
      accounts: [
        {
          name: 'issuer'
          isMut: false
          isSigner: false
        },
        {
          name: 'purchaser'
          isMut: false
          isSigner: true
        },
        {
          name: 'receipt'
          isMut: true
          isSigner: false
        },
        {
          name: 'receiptTokens'
          isMut: true
          isSigner: false
        },
        {
          name: 'purchaserTokens'
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
      name: 'purchaseWithPayer'
      accounts: [
        {
          name: 'issuer'
          isMut: true
          isSigner: false
        },
        {
          name: 'purchaser'
          isMut: false
          isSigner: true
        },
        {
          name: 'payer'
          isMut: true
          isSigner: true
        },
        {
          name: 'receipt'
          isMut: true
          isSigner: false
        },
        {
          name: 'receiptTokens'
          isMut: true
          isSigner: false
        },
        {
          name: 'purchaserTokens'
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
        }
      ]
      args: []
    },
    {
      name: 'updateQuantity'
      accounts: [
        {
          name: 'issuer'
          isMut: false
          isSigner: false
        },
        {
          name: 'purchaser'
          isMut: false
          isSigner: true
        },
        {
          name: 'receipt'
          isMut: false
          isSigner: false
        },
        {
          name: 'receiptTokens'
          isMut: true
          isSigner: false
        },
        {
          name: 'purchaserTokens'
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
          name: 'newQuantity'
          type: 'u64'
        }
      ]
    },
    {
      name: 'refundWithPayer'
      accounts: [
        {
          name: 'issuer'
          isMut: false
          isSigner: false
        },
        {
          name: 'purchaser'
          isMut: false
          isSigner: true
        },
        {
          name: 'payer'
          isMut: true
          isSigner: false
        },
        {
          name: 'receipt'
          isMut: true
          isSigner: false
        },
        {
          name: 'receiptTokens'
          isMut: true
          isSigner: false
        },
        {
          name: 'purchaserTokens'
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
    }
  ]
  accounts: [
    {
      name: 'issuer'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'initializer'
            type: 'publicKey'
          },
          {
            name: 'nonce'
            type: 'u64'
          },
          {
            name: 'bump'
            type: 'u8'
          },
          {
            name: 'paymentMint'
            type: 'publicKey'
          },
          {
            name: 'deposit'
            type: 'u64'
          },
          {
            name: 'ticketsIssued'
            type: 'u64'
          },
          {
            name: 'closingTime'
            type: {
              option: 'i64'
            }
          }
        ]
      }
    },
    {
      name: 'receipt'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'purchaser'
            type: 'publicKey'
          },
          {
            name: 'issuer'
            type: 'publicKey'
          },
          {
            name: 'bump'
            type: 'u8'
          },
          {
            name: 'ticketNumber'
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'receiptWithPayer'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'purchaser'
            type: 'publicKey'
          },
          {
            name: 'issuer'
            type: 'publicKey'
          },
          {
            name: 'bump'
            type: 'u8'
          },
          {
            name: 'ticketNumber'
            type: 'u64'
          },
          {
            name: 'payer'
            type: 'publicKey'
          }
        ]
      }
    }
  ]
  errors: [
    {
      code: 6000
      name: 'MissingBumpSeed'
      msg: 'Missing anchor bump seed'
    },
    {
      code: 6001
      name: 'ArithmeticOverflow'
      msg: 'Arithmetic overflow'
    },
    {
      code: 6002
      name: 'IssuerClosed'
      msg: 'Issuer closed'
    },
    {
      code: 6003
      name: 'InvalidQuantity'
      msg: 'Invalid quantity'
    }
  ]
}

export const IDL: Mortar = {
  version: '0.1.0',
  name: 'mortar',
  instructions: [
    {
      name: 'initialize',
      accounts: [
        {
          name: 'initializer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'paymentMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'issuer',
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
          name: 'nonce',
          type: 'u64',
        },
        {
          name: 'deposit',
          type: 'u64',
        },
        {
          name: 'closingTime',
          type: {
            option: 'i64',
          },
        },
      ],
    },
    {
      name: 'purchase',
      accounts: [
        {
          name: 'issuer',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'purchaser',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'receipt',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'receiptTokens',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'purchaserTokens',
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
      ],
      args: [],
    },
    {
      name: 'refund',
      accounts: [
        {
          name: 'issuer',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'purchaser',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'receipt',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'receiptTokens',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'purchaserTokens',
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
      name: 'purchaseWithPayer',
      accounts: [
        {
          name: 'issuer',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'purchaser',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'receipt',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'receiptTokens',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'purchaserTokens',
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
      ],
      args: [],
    },
    {
      name: 'updateQuantity',
      accounts: [
        {
          name: 'issuer',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'purchaser',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'receipt',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'receiptTokens',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'purchaserTokens',
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
          name: 'newQuantity',
          type: 'u64',
        },
      ],
    },
    {
      name: 'refundWithPayer',
      accounts: [
        {
          name: 'issuer',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'purchaser',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'receipt',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'receiptTokens',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'purchaserTokens',
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
  ],
  accounts: [
    {
      name: 'issuer',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'initializer',
            type: 'publicKey',
          },
          {
            name: 'nonce',
            type: 'u64',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'paymentMint',
            type: 'publicKey',
          },
          {
            name: 'deposit',
            type: 'u64',
          },
          {
            name: 'ticketsIssued',
            type: 'u64',
          },
          {
            name: 'closingTime',
            type: {
              option: 'i64',
            },
          },
        ],
      },
    },
    {
      name: 'receipt',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'purchaser',
            type: 'publicKey',
          },
          {
            name: 'issuer',
            type: 'publicKey',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'ticketNumber',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'receiptWithPayer',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'purchaser',
            type: 'publicKey',
          },
          {
            name: 'issuer',
            type: 'publicKey',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'ticketNumber',
            type: 'u64',
          },
          {
            name: 'payer',
            type: 'publicKey',
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'MissingBumpSeed',
      msg: 'Missing anchor bump seed',
    },
    {
      code: 6001,
      name: 'ArithmeticOverflow',
      msg: 'Arithmetic overflow',
    },
    {
      code: 6002,
      name: 'IssuerClosed',
      msg: 'Issuer closed',
    },
    {
      code: 6003,
      name: 'InvalidQuantity',
      msg: 'Invalid quantity',
    },
  ],
}
