import RuleDraft from '@carbon/icons-react/lib/RuleDraft'

import { SectionBlock } from '@components/core/SectionBlock'
import { SectionHeader } from '@components/core/SectionHeader'
import { ValueBlock } from '@components/core/ValueBlock'
import Tooltip from '@components/Tooltip'
import { ClockIcon, HandIcon, ScaleIcon } from '@heroicons/react/outline'
import { cloneElement, useState } from 'react'
import cx from 'classnames'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { AssetAccount } from '@utils/uiTypes/assets'

interface Props {
  className?: string
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
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const [value] = useState<AssetAccount>()
  const [error] = useState('')
  const [form, setForm] = useState({
    governedTokenAccount: undefined,
  })
  const [formErrors, setFormErrors] = useState({})
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  // const shouldBeGoverned = !!(index !== 0 && governance)
  console.log(value, formErrors)
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
        <GovernedAccountSelect
          label="Wallet"
          governedAccounts={governedTokenAccountsWithoutNfts}
          onChange={(value) => {
            handleSetForm({ value, propertyName: 'governedTokenAccount' })
            console.log('Value of govern is: ', value)
            // handleSetForm({ value, propertyName: 'governedTokenAccount' })
          }}
          value={form.governedTokenAccount}
          // error={formErrors['governedTokenAccount']}
          error={error}
          shouldBeGoverned={true}
          governance={null}
        ></GovernedAccountSelect>
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
