import { utils } from '@project-serum/anchor'
import { newProgramMap } from '@saberhq/anchor-contrib'
import { SolanaAugmentedProvider } from '@saberhq/solana-contrib'
import { PublicKey } from '@solana/web3.js'
import {
  GaugemeisterData,
  GaugeProgram,
  MineProgram,
  QuarryMineJSON,
  UgaugeJSON,
} from './programs'
import { GovernProgram, UgovernJSON } from './programs/govern'
import { LockedVoterProgram, UlockedUvoterJSON } from './programs/lockedVoter'

export type TribecaPrograms = {
  LockedVoter: LockedVoterProgram
  Govern: GovernProgram
  Gauge: GaugeProgram
  Mine: MineProgram
}

export type GaugeInfo = {
  publicKey: PublicKey
  mint: PublicKey
  logoURI?: string
}

export type GaugeInfos = {
  [name: string]: GaugeInfo
}

export default abstract class ATribecaConfiguration {
  protected encodeU32(num: number): Buffer {
    const buf = Buffer.alloc(4)
    buf.writeUInt32LE(num)
    return buf
  }

  public static readonly mintInfoEndpoint =
    'https://cdn.jsdelivr.net/gh/CLBExchange/certified-token-list/101'

  public static readonly lockedVoterProgramId = new PublicKey(
    'LocktDzaV1W2Bm9DeZeiyz4J9zs4fRqNiYqQyracRXw'
  )

  public static readonly governProgramId = new PublicKey(
    'Govz1VyoyLD5BL6CSCxUJLVLsQHRwjfFj1prNsdNg5Jw'
  )

  public static readonly gaugeProgramId = new PublicKey(
    'GaugesLJrnVjNNWLReiw3Q7xQhycSBRgeHGTMDUaX231'
  )

  public static readonly quarryMineProgramId = new PublicKey(
    'QMNeHCGYnLVDn1icRAfQZpjPLBNkfGbSKRB83G5d8KB'
  )

  public static readonly gaugemeister = new PublicKey(
    '28ZDtf6d2wsYhBvabTxUHTRT6MDxqjmqR7RMCp348tyU'
  )

  // ---------------- Abstract ----------------
  public abstract readonly name: string

  public abstract readonly locker: PublicKey

  public abstract readonly token: {
    name: string
    mint: PublicKey
    decimals: number
  }
  // ------------------------------------------

  public static readonly gaugeInstructions = {
    createGaugeVoter: 135,
    createGaugeVote: 109,
    setGaugeVote: 245,
    prepareEpochGaugeVoter: 15,
    gaugeCommitVote: 249,
    resetEpochGaugeVoter: 21,
    gaugeRevertVote: 185,
  }

  public static readonly lockedVoterInstructions = {
    newEscrow: 216,
    lock: 21,
  }

  public async findEscrowAddress(
    authority: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        utils.bytes.utf8.encode('Escrow'),
        this.locker.toBuffer(),
        authority.toBuffer(),
      ],

      ATribecaConfiguration.lockedVoterProgramId
    )
  }

  public async findGaugeVoterAddress(
    escrow: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        utils.bytes.utf8.encode('GaugeVoter'),
        ATribecaConfiguration.gaugemeister.toBuffer(),
        escrow.toBuffer(),
      ],
      ATribecaConfiguration.gaugeProgramId
    )
  }

  public async findGaugeVoteAddress(
    gaugeVoter: PublicKey,
    gauge: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        utils.bytes.utf8.encode('GaugeVote'),
        gaugeVoter.toBuffer(),
        gauge.toBuffer(),
      ],
      ATribecaConfiguration.gaugeProgramId
    )
  }

  public async findEpochGaugeVoterAddress(
    gaugeVoter: PublicKey,
    votingEpoch: number
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        utils.bytes.utf8.encode('EpochGaugeVoter'),
        gaugeVoter.toBuffer(),
        this.encodeU32(votingEpoch),
      ],
      ATribecaConfiguration.gaugeProgramId
    )
  }

  public async findEpochGaugeAddress(
    gauge: PublicKey,
    votingEpoch: number
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        utils.bytes.utf8.encode('EpochGauge'),
        gauge.toBuffer(),
        this.encodeU32(votingEpoch),
      ],
      ATribecaConfiguration.gaugeProgramId
    )
  }

  public async findEpochGaugeVoteAddress(
    gaugeVote: PublicKey,
    votingEpoch: number
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        utils.bytes.utf8.encode('EpochGaugeVote'),
        gaugeVote.toBuffer(),
        this.encodeU32(votingEpoch),
      ],
      ATribecaConfiguration.gaugeProgramId
    )
  }

  public async findWhitelistAddress(
    locker: PublicKey,
    programId: PublicKey,
    owner: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        utils.bytes.utf8.encode('LockerWhitelistEntry'),
        locker.toBuffer(),
        programId.toBuffer(),
        owner.toBuffer(),
      ],
      ATribecaConfiguration.lockedVoterProgramId
    )
  }

  public async fetchAllGauge(programs: TribecaPrograms): Promise<GaugeInfos> {
    const gauges = (await programs.Gauge.account.gauge.all()).filter(
      ({ account: { isDisabled, gaugemeister } }) =>
        !isDisabled ||
        gaugemeister.toString() !==
          ATribecaConfiguration.gaugemeister.toString()
    )

    // Fetch the info of the quarry behind the gauge to get name + logo behind the gauge
    const quarryInfos = await programs.Mine.account.quarry.fetchMultiple(
      gauges.map((x) => x.account.quarry)
    )

    if (!quarryInfos) {
      throw new Error('Cannot load quarry infos')
    }

    const mints = quarryInfos.map((x) => (x as any).tokenMintKey)

    const infosInArray = await Promise.all(
      mints.map((x, xi) =>
        (async () => {
          try {
            const response = await fetch(
              `${ATribecaConfiguration.mintInfoEndpoint}/${x.toString()}.json`,
              {
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                },
              }
            )

            const { name, logoURI } = await response.json()

            return {
              publicKey: gauges[xi].publicKey,
              mint: gauges[xi].publicKey,
              logoURI,
              name,
            }
          } catch {
            return {
              publicKey: gauges[xi].publicKey,
              name: x,
              mint: x,
            }
          }
        })()
      )
    )

    return infosInArray.reduce((gaugeInfos, { name, ...other }) => {
      return {
        ...gaugeInfos,

        [name]: {
          ...other,
        },
      }
    }, {})
  }

  public async fetchGaugemeister(
    gaugeProgram: GaugeProgram
  ): Promise<GaugemeisterData> {
    const data = await gaugeProgram.account.gaugemeister.fetchNullable(
      ATribecaConfiguration.gaugemeister
    )

    if (!data) {
      throw new Error(
        `Empty Gaugemeister data ${ATribecaConfiguration.gaugemeister}`
      )
    }

    return data
  }

  public loadPrograms(provider: SolanaAugmentedProvider): TribecaPrograms {
    return newProgramMap<TribecaPrograms>(
      provider,

      {
        // IDLs
        LockedVoter: UlockedUvoterJSON,
        Govern: UgovernJSON,
        Gauge: UgaugeJSON,
        Mine: QuarryMineJSON,
      },

      {
        // Addresses
        LockedVoter: ATribecaConfiguration.lockedVoterProgramId,
        Govern: ATribecaConfiguration.governProgramId,
        Gauge: ATribecaConfiguration.gaugeProgramId,
        Mine: ATribecaConfiguration.quarryMineProgramId,
      }
    )
  }
}
