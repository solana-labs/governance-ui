import {
  AnchorProvider,
  BN,
  BorshInstructionCoder,
  IdlTypes,
  Wallet,
} from '@coral-xyz/anchor'
import { AccountMetaData } from '@solana/spl-governance'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { fmtMintAmount } from '@tools/sdk/units'
import tokenPriceService from '@utils/services/tokenPrice'
import { tryGetMint, getInverseScaledFactor } from '@utils/tokens'
import { tryGetRegistrar, tryGetVoter } from 'VoteStakeRegistry/sdk/api'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'
import {
  DAYS_PER_MONTH,
  getFormattedStringFromDays,
  secsToDays,
  SECS_PER_DAY,
} from '@utils/dateTools'
import { calcMultiplier } from 'VoteStakeRegistry/tools/deposits'
import { VoterStakeRegistry as HeliumVSR } from '@helium/idls/lib/types/voter_stake_registry'
import { PROGRAM_ID as HELIUM_VSR_PROGRAM_ID } from '@helium/voter-stake-registry-sdk'
import { fetchTokenAccountByPubkey } from '@hooks/queries/tokenAccount'
import { fetchMintInfoByPubkey } from '@hooks/queries/mintInfo'
import { toUiDecimals } from '@blockworks-foundation/mango-v4'

interface ClawbackInstruction {
  depositEntryIndex: number
}

interface VotingMintCfgInstruction {
  idx: number
  digitShift: number
  baselineVoteWeightScaledFactor: BN
  maxExtraLockupVoteWeightScaledFactor: BN
  lockupSaturationSecs: BN
  grantAuthority: PublicKey
}

type HeliumVotingMintCfgArgs = IdlTypes<HeliumVSR>['ConfigureVotingMintArgsV0']
interface HeliumVotingMintCfgInstruction {
  args: HeliumVotingMintCfgArgs
}

export interface GrantInstruction {
  periods: number
  kind: object
  amount: BN
  startTs: BN
  allowClawback: boolean
}

const clawbackIx = (programId: PublicKey) => ({
  111: {
    name: 'Clawback',
    accounts: [
      { name: 'Registrar' },
      { name: 'Realm authority' },
      { name: 'Voter' },
      { name: 'Vault' },
      { name: 'Destination' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array,
      accounts: AccountMetaData[]
    ) => {
      try {
        const options = AnchorProvider.defaultOptions()
        const provider = new AnchorProvider(
          connection,
          new Wallet(Keypair.generate()),
          options
        )
        const vsrClient = await VsrClient.connect(provider, programId)
        const decodedInstructionData = new BorshInstructionCoder(
          vsrClient.program.idl
        ).decode(Buffer.from(data))?.data as ClawbackInstruction | null
        const existingVoter = await tryGetVoter(accounts[2].pubkey, vsrClient)
        const deposit = decodedInstructionData
          ? existingVoter?.deposits[decodedInstructionData.depositEntryIndex]
          : null
        const existingRegistrar = await tryGetRegistrar(
          accounts[0].pubkey,
          vsrClient
        )
        const mintPk =
          existingRegistrar?.votingMints[deposit!.votingMintConfigIdx].mint
        const mint = await tryGetMint(connection, mintPk!)

        return (
          <div className="space-y-3">
            <div>Wallet: {existingVoter?.voterAuthority.toBase58()}</div>
            <div>
              Clawback amount:{' '}
              {fmtMintAmount(mint?.account, deposit!.amountDepositedNative)}
            </div>
          </div>
        )
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
})

const createRegistrarIx = (_programId: PublicKey) => ({
  132: {
    name: 'Create registrar',
    accounts: [
      { name: 'Registrar' },
      { name: 'Realm' },
      { name: 'Governance program id' },
      { name: 'Realm governing token mint' },
      { name: 'Realm authority' },
      { name: 'Payer' },
    ],
    getDataUI: async () => {
      return <div></div>
    },
  },
})

const UpdateVoterWeight = (_programId: PublicKey) => ({
  45: {
    name: 'Vote Stake Registry Update Voter Weight',
    accounts: [],
    getDataUI: async () => {
      return <div></div>
    },
  },
})

const deposit = (programId: PublicKey) => ({
  242: {
    name: 'Vote stake registry deposit',
    accounts: [
      { name: 'Registrar' },
      { name: 'Voter' },
      { name: 'Vault' },
      { name: 'Deposit Token' },
      { name: 'Deposit Authority' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array,
      accounts: AccountMetaData[]
    ) => {
      const tokenAccountPk = accounts[3].pubkey
      const tokenAccount = (
        await fetchTokenAccountByPubkey(connection, tokenAccountPk)
      ).result
      const mint = (await fetchMintInfoByPubkey(connection, tokenAccount!.mint))
        .result
      const options = AnchorProvider.defaultOptions()
      const provider = new AnchorProvider(
        connection,
        new Wallet(Keypair.generate()),
        options
      )
      const vsrClient = await VsrClient.connect(provider, programId)

      const decodedInstructionData = new BorshInstructionCoder(
        vsrClient.program.idl
      ).decode(Buffer.from(data))?.data as any
      const amount = toUiDecimals(decodedInstructionData.amount, mint!.decimals)
      return <div>Amount: {amount}</div>
    },
  },
})

const configVotingMintIx = (programId: PublicKey) => ({
  113: {
    name: 'Configure voting mint',
    accounts: [
      { name: 'Registrar' },
      { name: 'Realm authority' },
      { name: 'Mint' },
    ],
    getDataUI: async (connection: Connection, data: Uint8Array) => {
      try {
        const options = AnchorProvider.defaultOptions()
        const provider = new AnchorProvider(
          connection,
          new Wallet(Keypair.generate()),
          options
        )
        const vsrClient = await VsrClient.connect(provider, programId)

        const decodedInstructionData = new BorshInstructionCoder(
          vsrClient.program.idl
        ).decode(Buffer.from(data))?.data as VotingMintCfgInstruction
        const {
          maxExtraLockupVoteWeightScaledFactor,
          lockupSaturationSecs,
          baselineVoteWeightScaledFactor,
        } = decodedInstructionData
        return (
          <div className="space-y-3">
            <div>Index: {decodedInstructionData?.idx}</div>
            <div>Digit shifts: {decodedInstructionData?.digitShift}</div>
            <div>
              Unlocked factor: {baselineVoteWeightScaledFactor.toNumber() / 1e9}{' '}
              ({baselineVoteWeightScaledFactor.toNumber()})
            </div>
            <div>
              Lockup factor:{' '}
              {maxExtraLockupVoteWeightScaledFactor.toNumber() / 1e9} (
              {maxExtraLockupVoteWeightScaledFactor.toNumber()})
            </div>
            <div>
              Max lockup time:{' '}
              {decodedInstructionData &&
                getFormattedStringFromDays(
                  secsToDays(lockupSaturationSecs.toNumber())
                )}{' '}
              (secs: {lockupSaturationSecs.toNumber()})
            </div>
            <div>
              Max multiplier:{' '}
              {calcMultiplier({
                depositScaledFactor: baselineVoteWeightScaledFactor.toNumber(),
                maxExtraLockupVoteWeightScaledFactor: maxExtraLockupVoteWeightScaledFactor.toNumber(),
                lockupSaturationSecs: lockupSaturationSecs.toNumber(),
                lockupSecs: lockupSaturationSecs.toNumber(),
              })}
            </div>
            <div>
              Grant authority:{' '}
              {decodedInstructionData?.grantAuthority.toBase58()}
            </div>
          </div>
        )
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
})

const grantIx = (programId: PublicKey) => ({
  145: {
    name: 'Grant',
    accounts: [
      { name: 'Registrar' },
      { name: 'Voter' },
      { name: 'Voter Authority' },
      { name: 'Voter Weight Record' },
      { name: 'Vault' },
      { name: 'Deposit Token' },
      { name: 'Token Authority' },
      { name: 'Grant Authority' },
      { name: 'Payer' },
      { name: 'Deposit Mint' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array,
      accounts: AccountMetaData[]
    ) => {
      try {
        const options = AnchorProvider.defaultOptions()
        const provider = new AnchorProvider(
          connection,
          new Wallet(Keypair.generate()),
          options
        )
        const vsrClient = await VsrClient.connect(provider, programId)
        const decodedInstructionData = new BorshInstructionCoder(
          vsrClient.program.idl
        ).decode(Buffer.from(data))?.data as GrantInstruction | null
        const mintPk = accounts[9].pubkey
        const mint = await tryGetMint(connection, mintPk!)
        const lockupKind = decodedInstructionData
          ? Object.keys(decodedInstructionData?.kind)[0]
          : null
        const periods = decodedInstructionData?.periods
        const logoUrl = tokenPriceService.getTokenInfo(mintPk.toBase58())
          ?.logoURI
        return (
          <>
            {decodedInstructionData ? (
              <div className="space-y-3">
                <div>Grant to: {accounts[8].pubkey.toBase58()}</div>
                <div>Lock type: {lockupKind}</div>
                <div>
                  Amount:{' '}
                  {fmtMintAmount(mint!.account, decodedInstructionData.amount)}
                </div>
                {lockupKind === 'monthly' && periods && (
                  <div>
                    Vested:{' '}
                    {fmtMintAmount(
                      mint!.account,
                      decodedInstructionData.amount.div(new BN(periods))
                    )}{' '}
                    p/m
                  </div>
                )}
                {lockupKind === 'daily' && periods && (
                  <div>
                    Vested:{' '}
                    {fmtMintAmount(
                      mint!.account,
                      decodedInstructionData.amount.div(new BN(periods))
                    )}{' '}
                    p/d
                  </div>
                )}
                {logoUrl && (
                  <div>
                    <img className="w-5 h-5" src={logoUrl}></img>
                  </div>
                )}
                <div>
                  Start date:{' '}
                  {new Date(
                    decodedInstructionData.startTs.toNumber() * 1000
                  ).toDateString()}
                </div>
                {periods && (
                  <div>
                    End date:{' '}
                    {new Date(
                      decodedInstructionData.startTs.toNumber() * 1000 +
                        (lockupKind === 'monthly'
                          ? periods * DAYS_PER_MONTH * SECS_PER_DAY * 1000
                          : periods * SECS_PER_DAY * 1000)
                    ).toDateString()}
                  </div>
                )}
                <div>
                  Dao can clawback:
                  {decodedInstructionData.allowClawback ? 'Yes' : 'No'}
                </div>
                <div>Only grantee can execute instruction</div>
              </div>
            ) : (
              <div>{JSON.stringify(data)}</div>
            )}
          </>
        )
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
})

const heliumInitializeRegistrarIx = (_programId: PublicKey) => ({
  120: {
    name: 'Initialize registrar',
    accounts: [
      { name: 'Registrar' },
      { name: 'Collection' },
      { name: 'Collection Metadata' },
      { name: 'Master Edition' },
      { name: 'Token Account' },
      { name: 'Realm' },
      { name: 'Governance program id' },
      { name: 'Realm governing token mint' },
      { name: 'Realm authority' },
      { name: 'Payer' },
    ],
    getDataUI: async () => {
      return <div></div>
    },
  },
})

const heliumConfigVotingMintIx = (programId: PublicKey) => ({
  46: {
    name: 'Configure voting mint',
    accounts: [
      { name: 'Registrar' },
      { name: 'Realm authority' },
      { name: 'Mint' },
      { name: 'Payer' },
    ],
    getDataUI: async (connection: Connection, data: Uint8Array) => {
      try {
        const options = AnchorProvider.defaultOptions()
        const provider = new AnchorProvider(
          connection,
          new Wallet(Keypair.generate()),
          options
        )
        const vsrClient = await VsrClient.connect(provider, programId)

        const decodedInstructionData = new BorshInstructionCoder(
          vsrClient.program.idl
        ).decode(Buffer.from(data))?.data as HeliumVotingMintCfgInstruction

        const {
          args: {
            baselineVoteWeightScaledFactor,
            lockupSaturationSecs,
            maxExtraLockupVoteWeightScaledFactor,
            // genesisVotePowerMultiplier,
            // genesisVotePowerMultiplierExpirationTs,
          },
        } = decodedInstructionData

        return (
          <div className="space-y-3">
            <div>Index: {decodedInstructionData?.args.idx}</div>
            <div>Digit shifts: {decodedInstructionData?.args.digitShift}</div>
            <div>
              Unlocked factor: {baselineVoteWeightScaledFactor.toNumber() / 1e9}{' '}
              ({baselineVoteWeightScaledFactor.toNumber()})
            </div>
            <div>
              Max lockup time:{' '}
              {decodedInstructionData &&
                getFormattedStringFromDays(
                  secsToDays(lockupSaturationSecs.toNumber())
                )}{' '}
              (secs: {lockupSaturationSecs.toNumber()})
            </div>
            <div>
              Max multiplier:{' '}
              {getInverseScaledFactor(baselineVoteWeightScaledFactor) +
                getInverseScaledFactor(maxExtraLockupVoteWeightScaledFactor)}
            </div>
            {/* Additional Genesis Multiplier not configurable through UI */}
            {/* <div>
              Additional Genesis Multiplier: {genesisVotePowerMultiplier}
            </div>
            <div>
              Additional Genesis Duration:
              {decodedInstructionData &&
                getFormattedStringFromDays(
                  secsToDays(genesisVotePowerMultiplierExpirationTs.toNumber())
                )}{' '}
              (secs: {genesisVotePowerMultiplierExpirationTs.toNumber()})
            </div> */}
          </div>
        )
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
})

const common_instructions = (programId: PublicKey) =>
  [
    clawbackIx,
    createRegistrarIx,
    configVotingMintIx,
    grantIx,
    deposit,
    UpdateVoterWeight,
  ].reduce(
    (acc, ix) => ({
      ...acc,
      ...ix(programId),
    }),
    {}
  )

export const VOTE_STAKE_REGISTRY_INSTRUCTIONS = {
  '4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo': common_instructions(
    new PublicKey('4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo')
  ),
  vsr2nfGVNHmSY8uxoBGqq8AQbwz3JwaEaHqGbsTPXqQ: common_instructions(
    new PublicKey('vsr2nfGVNHmSY8uxoBGqq8AQbwz3JwaEaHqGbsTPXqQ')
  ),
  VotEn9AWwTFtJPJSMV5F9jsMY6QwWM5qn3XP9PATGW7: common_instructions(
    new PublicKey('VotEn9AWwTFtJPJSMV5F9jsMY6QwWM5qn3XP9PATGW7')
  ),
  // Helium vsr has no concept of clawback or grants
  // and has slightly different accounts for voting mint config
  [HELIUM_VSR_PROGRAM_ID.toBase58()]: [
    heliumInitializeRegistrarIx,
    heliumConfigVotingMintIx,
  ].reduce(
    (acc, ix) => ({
      ...acc,
      ...ix(HELIUM_VSR_PROGRAM_ID),
    }),
    {}
  ),
  VoteWPk9yyGmkX4U77nEWRJWpcc8kUfrPoghxENpstL: common_instructions(
    new PublicKey('VoteWPk9yyGmkX4U77nEWRJWpcc8kUfrPoghxENpstL')
  ),
  VoteMBhDCqGLRgYpp9o7DGyq81KNmwjXQRAHStjtJsS: common_instructions(
    new PublicKey('VoteMBhDCqGLRgYpp9o7DGyq81KNmwjXQRAHStjtJsS')
  ),
}
