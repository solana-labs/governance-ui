import React from 'react'
import Input from '@components/inputs/Input'
import { StyledLabel } from '@components/inputs/styles'
import AmountSlider from '@components/Slider'

const ApprovalQuorumInput: React.FC<{
  onChange: (amount: number) => void
  onBlur?: () => void
  value?: number
  slider?: boolean
}> = ({ onChange, onBlur, value, slider = true }) => {
  return (
    <>
      <StyledLabel>Approval quorum (%)</StyledLabel>
      <Input
        required
        type="number"
        value={value}
        min={1}
        max={100}
        onBlur={onBlur}
        onChange={($e) => {
          let yesThreshold = $e.target.value
          if (yesThreshold.length) {
            yesThreshold =
              +yesThreshold < 1 ? 1 : +yesThreshold > 100 ? 100 : yesThreshold
          }
          onChange(+yesThreshold)
        }}
      />

      <div className="pb-5" />
      {slider && (
        <AmountSlider
          step={1}
          value={value ?? 60}
          disabled={false}
          onChange={onChange}
        />
      )}
    </>
  )
}

export default ApprovalQuorumInput
