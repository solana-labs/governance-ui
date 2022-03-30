import type { AnchorTypes } from '@saberhq/anchor-contrib'

import type { UgaugeIDL } from '../idls/gauge'

export * from '../idls/gauge'

export type GaugeTypes = AnchorTypes<
  UgaugeIDL,
  {
    gaugemeister: GaugemeisterData
    gauge: GaugeData
    gaugeVoter: GaugeVoterData
    gaugeVote: GaugeVoteData
    epochGauge: EpochGaugeData
    epochGaugeVoter: EpochGaugeVoterData
    epochGaugeVote: EpochGaugeVoteData
  }
>

type Accounts = GaugeTypes['Accounts']

export type GaugemeisterData = Accounts['Gaugemeister']
export type GaugeData = Accounts['Gauge']
export type GaugeVoterData = Accounts['GaugeVoter']
export type GaugeVoteData = Accounts['GaugeVote']
export type EpochGaugeData = Accounts['EpochGauge']
export type EpochGaugeVoterData = Accounts['EpochGaugeVoter']
export type EpochGaugeVoteData = Accounts['EpochGaugeVote']

export type GaugeProgram = GaugeTypes['Program']
