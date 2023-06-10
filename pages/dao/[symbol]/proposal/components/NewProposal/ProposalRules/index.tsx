import RuleDraft from '@carbon/icons-react/lib/RuleDraft'

import { SectionBlock } from '../SectionBlock'
import { SectionHeader } from '../SectionHeader'
import { ValueBlock } from '../ValueBlock'
import { FormProps } from '@hub/types/FormProps'
import { WalletSelector } from '../../WalletSelector'
import Tooltip from '@components/Tooltip'
import { ClockIcon, HandIcon, ScaleIcon } from '@heroicons/react/outline'
import { cloneElement } from 'react'
import cx from 'classnames'
// import { durationStr } from '@components/treasuryV2/Details/WalletDetails/Info/Rules'
// import * as RE from '@utils/uiTypes/Result'
// import useTreasuryInfo from '@hooks/useTreasuryInfo'

interface Props
  extends FormProps<{
    coolOffHours: number
    maxVoteDays: number
  }> {
  className?: string
  programVersion: number
}

function RulesPill(props: { icon: JSX.Element; value: string; label: string }) {
  return (
    <Tooltip content={props.label}>
      <div className="flex items-center space-x-1 bg-bkg-3 px-2 py-1 rounded text-xs">
        {cloneElement(props.icon, {
          className: cx(props.icon.props.className, 'h-4 w-4'),
        })}
        <div>{props.value}</div>
      </div>
    </Tooltip>
  )
}

export function ProposalRules(props: Props) {
  // const treasuryInfo = useTreasuryInfo(false)

  //   const walletInfo = RE.isOk(treasuryInfo)
  //     ? treasuryInfo.data.wallets.find(
  //         (wallet) =>
  //           wallet.governanceAddress === value?.governance.pubkey.toBase58()
  //       )
  //     : null

  return (
    <SectionBlock className={props.className}>
      <SectionHeader
        className="mb-8"
        icon={<RuleDraft />}
        text="Proposal Rules"
      />
      <ValueBlock
        description="These rules determine voting duration, voting threshold, and vote tipping."
        title="Which wallet's rules should this proposal follow"
      >
        {/* <Select /> */}
        <WalletSelector />
        <div className="text-white/50 mt-2">
          <div className="flex items-center space-x-1 justify-end">
            <RulesPill
              icon={<ClockIcon className="stroke-current fill-none" />}
              label="Max Voting Time"
              //   value={durationStr(walletInfo.rules.common.maxVotingTime, true)}
              value={'Hola'}
            />
            <RulesPill
              icon={<ScaleIcon className="stroke-current fill-none" />}
              label="Council Vote Threshold"
              value="Efgh"
            />
            <RulesPill
              icon={<HandIcon className="stroke-current fill-none" />}
              label="Council Vote Tipping"
              value="Ijkl"
            />
          </div>
        </div>
        {/* <div className="grid grid-cols-[100px,1fr] gap-x-2 items-center">
          <SliderValue
            min={1}
            max={7}
            value={props.maxVoteDays}
            units={ntext(props.maxVoteDays, 'Day')}
            onChange={props.onMaxVoteDaysChange}
          />
          <Slider
            min={1}
            max={7}
            value={props.maxVoteDays}
            onChange={props.onMaxVoteDaysChange}
          />
        </div> */}
      </ValueBlock>
    </SectionBlock>
  )
}
