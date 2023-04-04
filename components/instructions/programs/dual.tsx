import { Connection } from '@solana/web3.js'
import {
  StakingOptions,
  STAKING_OPTIONS_PK,
} from '@dual-finance/staking-options'
import { BN, BorshInstructionCoder } from '@coral-xyz/anchor'
import { AccountMetaData } from '@solana/spl-governance'
import { tryGetMint } from '@utils/tokens'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'

interface configV2Instruction {
  lotSize: BN
  numTokens: BN
  optionExpiration: BN
  soName: string
  subscriptionPeriodEnd: BN
}

interface initStrikeInstruction {
  strike: BN
}

interface nameTokenInstruction {
  strike: BN
}

interface issueInstruction {
  amount: BN
  strike: BN
}

const INSTRUCTIONS = {
  225: {
    name: 'Staking Option ConfigV2',
    accounts: [
      { name: 'authority' },
      { name: 'soAuthority' },
      { name: 'issueAuthority' },
      { name: 'state' },
      { name: 'baseVault' },
      { name: 'baseAccount' },
      { name: 'quoteAccount' },
      { name: 'baseMint' },
      { name: 'quoteMint' },
      { name: 'tokenProgram' },
      { name: 'systemProgram' },
      { name: 'rent' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array,
      accounts: AccountMetaData[]
    ) => {
      const soHelper = new StakingOptions(connection.rpcEndpoint)

      const decodedInstructionData = new BorshInstructionCoder(
        soHelper.getIdl()
      ).decode(Buffer.from(data))?.data as configV2Instruction

      const baseMint = await tryGetMint(connection, accounts[7].pubkey)

      const rawAmount = decodedInstructionData.numTokens
      const tokenAmount = baseMint
        ? getMintDecimalAmountFromNatural(baseMint.account, rawAmount)
        : rawAmount

      return (
        <div className="space-y-3">
          <div>
            Expiration:{' '}
            {new Date(
              decodedInstructionData.optionExpiration.toNumber() * 1000
            ).toDateString()}
          </div>
          <div>
            Subscription Period End:{' '}
            {new Date(
              decodedInstructionData.subscriptionPeriodEnd.toNumber() * 1000
            ).toDateString()}
          </div>
          <div>Num Tokens: {tokenAmount.toNumber()}</div>
          <div>Lot size: {decodedInstructionData.lotSize.toNumber()}</div>
          <div>SoName: {decodedInstructionData.soName}</div>
        </div>
      )
    },
  },
  149: {
    name: 'Staking Option InitStrike',
    accounts: [
      { name: 'authority' },
      { name: 'state' },
      { name: 'optionMint' },
      { name: 'tokenProgram' },
      { name: 'systemProgram' },
      { name: 'rent' },
    ],
    getDataUI: async (connection: Connection, data: Uint8Array) => {
      const soHelper = new StakingOptions(connection.rpcEndpoint)
      const decodedInstructionData = new BorshInstructionCoder(
        soHelper.getIdl()
      ).decode(Buffer.from(data))?.data as initStrikeInstruction

      return (
        <div className="space-y-3">
          <div>Strike: {decodedInstructionData.strike.toNumber()}</div>
        </div>
      )
    },
  },
  245: {
    name: 'Staking Option Name Token',
    accounts: [
      { name: 'authority' },
      { name: 'payer' },
      { name: 'state' },
      { name: 'optionMint' },
      { name: 'optionMintMetadataAccount' },
      { name: 'tokenMetadataProgram' },
      { name: 'systemProgram' },
      { name: 'rent' },
    ],
    getDataUI: async (connection: Connection, data: Uint8Array) => {
      const soHelper = new StakingOptions(connection.rpcEndpoint)

      const decodedInstructionData = new BorshInstructionCoder(
        soHelper.getIdl()
      ).decode(Buffer.from(data))?.data as nameTokenInstruction

      return (
        <div className="space-y-3">
          <div>Strike: {decodedInstructionData.strike.toNumber()}</div>
        </div>
      )
    },
  },
  190: {
    name: 'Staking Option Issue',
    accounts: [
      { name: 'authority' },
      { name: 'state' },
      { name: 'optionMint' },
      { name: 'userSoAccount' },
      { name: 'tokenProgram' },
    ],
    getDataUI: async (connection: Connection, data: Uint8Array) => {
      const soHelper = new StakingOptions(connection.rpcEndpoint)

      const decodedInstructionData = new BorshInstructionCoder(
        soHelper.getIdl()
      ).decode(Buffer.from(data))?.data as issueInstruction

      return (
        <div className="space-y-3">
          <div>
            Amount atoms of base: {decodedInstructionData.amount.toNumber()}
          </div>
          <div>Strike: {decodedInstructionData.strike.toNumber()}</div>
        </div>
      )
    },
  },
}

export const DUAL_INSTRUCTIONS = {
  [STAKING_OPTIONS_PK.toBase58()]: INSTRUCTIONS,
}
