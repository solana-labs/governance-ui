import BN from 'bn.js'
import { Connection, PublicKey } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'
import BigNumber from 'bignumber.js'

export const SOLANA_VALIDATOR_DAO_PROGRAM_ID = new PublicKey(
  'AwyKDr1Z5BfdvK3jX1UWopyjsJSV5cq4cuJpoYLofyEn'
)

export const VALIDATORDAO_INSTRUCTIONS = {
  AwyKDr1Z5BfdvK3jX1UWopyjsJSV5cq4cuJpoYLofyEn: {
    206: {
      name: 'Stake',
      accounts: [
        { name: 'Governance Id', important: true },
        { name: 'Governance Treasury wallet', important: true },
        { name: 'New DAO Stake account' },
        { name: 'Payer' },
        { name: 'Validator vote key' },
        { name: 'Stake config' },
        { name: 'Governance program' },
        { name: 'Stake program' },
        { name: 'System program' },
        { name: 'Rent Sysvar' },
        { name: 'Clock Sysvar' },
        { name: 'Stake History Sysvar' },
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        try {
          const seed = data[8]
          const amountArray = data.slice(9)
          const amount = new BigNumber(
            new BN(amountArray, 'le').toString()
          ).shiftedBy(9)
          return (
            <>
              <div>
                <div>
                  <span>Seed:</span>
                  <span>{seed}</span>
                </div>

                <div>
                  <span>Amount:</span>
                  <span>{amount.toString()} SOL</span>
                </div>
              </div>
            </>
          )
        } catch (error) {
          console.log(error)
          return <></>
        }
      },
    },
  },
}
