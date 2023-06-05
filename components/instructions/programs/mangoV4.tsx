import { MangoClient, toUiDecimals } from '@blockworks-foundation/mango-v4'
import { AnchorProvider, BN, BorshInstructionCoder } from '@coral-xyz/anchor'
import { Wallet } from '@marinade.finance/marinade-ts-sdk'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { secondsToHours } from 'date-fns'
// import { snakeCase } from 'snake-case'
// import { sha256 } from 'js-sha256'

//in case of mango discriminator is string sum of two first numbers in data array e.g `${data[0]}${data[1]}`
const instructions = () => ({
  12451: {
    name: 'Alt Extend',
    accounts: [
      { name: 'Group' },
      { name: 'Admin' },
      { name: 'Payer' },
      { name: 'Address Lookup Table' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  23568: {
    name: 'Alt Set',
    accounts: [
      { name: 'Group' },
      { name: 'Admin' },
      { name: 'Address Lookup Table' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  201177: {
    name: 'Ix Gate Set',
    accounts: [{ name: 'Group' }, { name: 'Admin' }],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  124114: {
    name: 'Perp edit',
    accounts: [
      { name: 'Group' },
      { name: 'Admin' },
      { name: 'Perp Market' },
      { name: 'Oracle' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  109198: {
    name: 'Stub oracle set',
    accounts: [{ name: 'Group' }, { name: 'Admin' }, { name: 'Oracle' }],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  16388: {
    name: 'Token add bank',
    accounts: [
      { name: 'Group' },
      { name: 'Admin' },
      { name: 'Mint' },
      { name: 'Existing Bank' },
      { name: 'Bank' },
      { name: 'Vault' },
      { name: 'Mint Info' },
      { name: 'Payer' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  888: {
    name: 'Edit Group',
    accounts: [{ name: 'Group' }, { name: 'Admin' }],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  17263: {
    name: 'Create Stub Oracle',
    accounts: [
      { name: 'Group' },
      { name: 'Oracle' },
      { name: 'Admin' },
      { name: 'Mint' },
      { name: 'Payer' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  10928: {
    name: 'Register Token',
    accounts: [
      { name: 'Group' },
      { name: 'Admin' },
      { name: 'Mint' },
      { name: 'Bank' },
      { name: 'Vault' },
      { name: 'Mint Info' },
      { name: 'Oracle' },
      { name: 'Payer' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      const args = (await getArgs(connection, data)) as any

      const parsedArgs = {
        tokenIndex: args.tokenIndex,
        tokenName: args.name,
        oracleConfidenceFilter: (args['oracleConfig.confFilter'] * 100).toFixed(
          2
        ),
        oracleMaxStalenessSlots: args['oracleConfig.maxStalenessSlots'],
        interestRateUtilizationPoint0: (
          args['interestRateParams.util0'] * 100
        ).toFixed(2),
        interestRatePoint0: (args['interestRateParams.rate0'] * 100).toFixed(2),
        interestRateUtilizationPoint1: (
          args['interestRateParams.util1'] * 100
        ).toFixed(2),
        interestRatePoint1: (args['interestRateParams.rate1'] * 100).toFixed(2),
        maxRate: (args['interestRateParams.maxRate'] * 100).toFixed(2),
        adjustmentFactor: (
          args['interestRateParams.adjustmentFactor'] * 100
        ).toFixed(2),
        loanFeeRate: (args.loanFeeRate * 10000).toFixed(2),
        loanOriginationFeeRate: (args.loanOriginationFeeRate * 10000).toFixed(
          2
        ),
        maintAssetWeight: args.maintAssetWeight.toFixed(2),
        initAssetWeight: args.initAssetWeight.toFixed(2),
        maintLiabWeight: args.maintLiabWeight.toFixed(2),
        initLiabWeight: args.initLiabWeight.toFixed(2),
        liquidationFee: (args['liquidationFee'] * 100).toFixed(2),
        minVaultToDepositsRatio: (
          args['minVaultToDepositsRatio'] * 100
        ).toFixed(2),
        netBorrowLimitPerWindowQuote: toUiDecimals(
          args['netBorrowLimitPerWindowQuote'],
          6
        ),
        netBorrowLimitWindowSizeTs: secondsToHours(
          args.netBorrowLimitWindowSizeTs
        ),
      }

      try {
        return (
          <div>
            <div className="border-b mb-4 pb-4 space-y-3">
              <div className="flex space-x-3">
                <div>Token index:</div>
                <div>{parsedArgs.tokenIndex}</div>
              </div>
              <div className="flex space-x-3">
                <div>Token name:</div>
                <div>{parsedArgs.tokenName}</div>
              </div>
              <div className="flex space-x-3">
                <div>Oracle Confidence Filter:</div>
                <div>{parsedArgs.oracleConfidenceFilter}%</div>
              </div>
              <div className="flex space-x-3">
                <div>Oracle Max Staleness Slots:</div>
                <div>{parsedArgs.oracleMaxStalenessSlots}</div>
              </div>
              <div className="flex space-x-3">
                <div>Interest rate adjustment factor:</div>
                <div>{parsedArgs.adjustmentFactor}%</div>
              </div>
              <div className="flex space-x-3">
                <div>Interest rate utilization point 0:</div>
                <div>{parsedArgs.interestRateUtilizationPoint0}%</div>
              </div>
              <div className="flex space-x-3">
                <div>Interest rate point 0:</div>
                <div>{parsedArgs.interestRatePoint0}%</div>
              </div>
              <div className="flex space-x-3">
                <div>Interest rate utilization point 1:</div>
                <div>{parsedArgs.interestRateUtilizationPoint1}%</div>
              </div>
              <div className="flex space-x-3">
                <div>Interest rate point 1:</div>
                <div>{parsedArgs.interestRatePoint1}%</div>
              </div>
              <div className="flex space-x-3">
                <div>Interest rate max rate:</div>
                <div>{parsedArgs.maxRate}%</div>
              </div>
              <div className="flex space-x-3">
                <div>Loan Fee Rate:</div>
                <div>{parsedArgs.loanFeeRate} bps</div>
              </div>
              <div className="flex space-x-3">
                <div>Loan Origination Fee Rate:</div>
                <div>{parsedArgs.loanOriginationFeeRate} bps</div>
              </div>
              <div className="flex space-x-3">
                <div>Maintenance Asset Weight:</div>
                <div>{parsedArgs.maintAssetWeight}</div>
              </div>
              <div className="flex space-x-3">
                <div>Init Asset Weight:</div>
                <div>{parsedArgs.initAssetWeight}</div>
              </div>
              <div className="flex space-x-3">
                <div>Maintenance Liab Weight:</div>
                <div>{parsedArgs.maintLiabWeight}</div>
              </div>
              <div className="flex space-x-3">
                <div>Init Liab Weight:</div>
                <div>{parsedArgs.initLiabWeight}</div>
              </div>
              <div className="flex space-x-3">
                <div>Liquidation Fee:</div>
                <div>{parsedArgs.liquidationFee}%</div>
              </div>
              <div className="flex space-x-3">
                <div>Min Vault To Deposits Ratio:</div>
                <div>{parsedArgs.minVaultToDepositsRatio}%</div>
              </div>
              <div className="flex space-x-3">
                <div>Net Borrow Limit Window Size:</div>
                <div>{parsedArgs.netBorrowLimitWindowSizeTs}H</div>
              </div>
              <div className="flex space-x-3">
                <div>Net Borrow Limit Per Window Quote:</div>
                <div>${parsedArgs.netBorrowLimitPerWindowQuote}</div>
              </div>
            </div>
            <h3>Raw values</h3>
            <div>{info}</div>
          </div>
        )
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  4014: {
    name: 'Register Openbook Market',
    accounts: [
      { name: 'Group' },
      { name: 'Admin' },
      { name: 'Openbook Program' },
      { name: 'Openbook External Market' },
      { name: 'Openbook Market' },
      { name: 'Index Reservation' },
      { name: 'Quote Bank' },
      { name: 'Base Bank' },
      { name: 'Payer' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  5645: {
    name: 'Register Trustless Token',
    accounts: [
      { name: 'Group' },
      { name: 'Fast Listing Admin' },
      { name: 'Mint' },
      { name: 'Bank' },
      { name: 'Vault' },
      { name: 'Mint Info' },
      { name: 'Oracle' },
      { name: 'Payer' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  49115: {
    name: 'Edit Market',
    accounts: [{ name: 'Group' }, { name: 'Admin' }, { name: 'Market' }],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  145204: {
    name: 'Edit Token',
    accounts: [
      { name: 'Group' },
      { name: 'Admin' },
      { name: 'Mint Info' },
      { name: 'Oracle' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  9347: {
    name: 'Create Perp Market',
    accounts: [
      { name: 'Group' },
      { name: 'Admin' },
      { name: 'Oracle' },
      { name: 'Perp Market' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  19895: {
    name: 'Create Mango Account',
    accounts: [
      { name: 'Group' },
      { name: 'Account' },
      { name: 'Owner' },
      { name: 'Payer' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
})

export const MANGO_V4_INSTRUCTIONS = {
  '4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg': instructions(),
}

const getClient = async (connection: Connection) => {
  const options = AnchorProvider.defaultOptions()
  const adminProvider = new AnchorProvider(
    connection,
    new Wallet(Keypair.generate()),
    options
  )
  const client = await MangoClient.connect(
    adminProvider,
    'mainnet-beta',
    new PublicKey('78b8f4cGCwmZ9ysPFMWLaLTkkaYnUjwMJYStWe5RTSSX')
  )

  return client
}

const getArgs = async (connection: Connection, data: Uint8Array) => {
  const client = await getClient(connection)
  const decodedInstructionData = new BorshInstructionCoder(
    client.program.idl
  ).decode(Buffer.from(data))?.data as any

  //   console.log(
  //     client.program.idl.instructions.map((ix) => {
  //       const sh = sighash('global', ix.name)
  //       return {
  //         name: ix.name,
  //         sh: `${sh[0]}${sh[1]}`,
  //       }
  //     })
  //   )

  const args = {}
  for (const key of Object.keys(decodedInstructionData)) {
    const val = decodedInstructionData[key]
    if (val !== null) {
      if (
        typeof val === 'object' &&
        !Array.isArray(val) &&
        !(val instanceof BN) &&
        !(val instanceof PublicKey)
      ) {
        for (const innerKey of Object.keys(val)) {
          const innerVal = val[innerKey]
          args[`${key}.${innerKey}`] = innerVal
        }
      } else {
        args[key] = val
      }
    }
  }
  return args
}

const displayArgs = async (connection: Connection, data: Uint8Array) => {
  const args = await getArgs(connection, data)
  return (
    <div className="space-y-3">
      {Object.keys(args)
        .filter((key) => {
          if (key === 'resetStablePrice' && args[key] === false) {
            return false
          }
          if (key === 'resetNetBorrowLimit' && args[key] === false) {
            return false
          }

          return true
        })
        .map((key) => (
          <div key={key} className="flex">
            <div className="mr-3">{key}:</div>
            <div>{`${commify(args[key])}`}</div>
          </div>
        ))}
    </div>
  )
}

function commify(n) {
  if (n?.toString) {
    const parts = n.toString().split('.')
    const numberPart = parts[0]
    const decimalPart = parts[1]
    const thousands = /\B(?=(\d{3})+(?!\d))/g
    return (
      numberPart.replace(thousands, ',') +
      (decimalPart ? '.' + decimalPart : '')
    )
  }
  return n
}

//need yarn add js-sha256 snakeCase
// function sighash(nameSpace: string, ixName: string): Buffer {
//   const name = snakeCase(ixName)
//   const preimage = `${nameSpace}:${name}`
//   return Buffer.from(sha256.digest(preimage)).slice(0, 8)
// }
