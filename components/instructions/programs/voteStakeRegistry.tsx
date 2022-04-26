import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { Wallet } from '@marinade.finance/marinade-ts-sdk'
import {
  AnchorProvider,
  BN,
  BorshInstructionCoder,
} from '@project-serum/anchor'
import { AccountMetaData } from '@solana/spl-governance'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { fmtMintAmount } from '@tools/sdk/units'
import tokenService from '@utils/services/token'
import { tryGetMint } from '@utils/tokens'
import { tryGetRegistrar, tryGetVoter } from 'VoteStakeRegistry/sdk/api'
import {
  DAYS_PER_MONTH,
  getFormattedStringFromDays,
  secsToDays,
  SECS_PER_DAY,
} from 'VoteStakeRegistry/tools/dateTools'
import { calcMultiplier } from 'VoteStakeRegistry/tools/deposits'

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
export interface GrantInstruction {
  periods: number
  kind: object
  amount: BN
  startTs: BN
  allowClawback: boolean
}

export const VOTE_STAKE_REGISTRY_INSTRUCTIONS = {
  '4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo': {
    111: {
      name: 'Clawback',
      accounts: [
        { name: 'Registrar' },
        { name: 'Realm authority' },
        { name: 'Voter' },
        { name: 'Token owner record' },
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
          const vsrClient = await VsrClient.connect(provider)
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
          const vsrClient = await VsrClient.connect(provider)

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
                Unlocked factor:{' '}
                {baselineVoteWeightScaledFactor.toNumber() / 1e9} (
                {baselineVoteWeightScaledFactor.toNumber()})
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
                  depositScaledFactor:
                    baselineVoteWeightScaledFactor.toNumber(),
                  maxExtraLockupVoteWeightScaledFactor:
                    maxExtraLockupVoteWeightScaledFactor.toNumber(),
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
          const vsrClient = await VsrClient.connect(provider)
          const decodedInstructionData = new BorshInstructionCoder(
            vsrClient.program.idl
          ).decode(Buffer.from(data))?.data as GrantInstruction | null
          const mintPk = accounts[9].pubkey
          const mint = await tryGetMint(connection, mintPk!)
          const lockupKind = decodedInstructionData
            ? Object.keys(decodedInstructionData?.kind)[0]
            : null
          const periods = decodedInstructionData?.periods
          const logoUrl = tokenService.getTokenInfo(mintPk.toBase58())?.logoURI
          return (
            <>
              {decodedInstructionData ? (
                <div className="space-y-3">
                  <div>Grant to: {accounts[8].pubkey.toBase58()}</div>
                  <div>Lock type: {lockupKind}</div>
                  <div>
                    Amount:{' '}
                    {fmtMintAmount(
                      mint!.account,
                      decodedInstructionData.amount
                    )}
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
  },
}
