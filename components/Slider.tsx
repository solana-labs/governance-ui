import { FunctionComponent, useState } from 'react'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

type StyledSliderProps = {
  enableTransition?: boolean
  disabled?: boolean
}

const StyledSlider = styled(Slider)<StyledSliderProps>`
  .rc-slider-rail {
    ${tw`bg-gradient-to-r from-secondary-1-light via-primary-light to-secondary-2-light h-2.5 rounded-full`}
  }

  .rc-slider-track {
    ${tw`bg-gradient-to-r from-secondary-1-dark via-primary-light to-secondary-2-light h-2.5 rounded-full ring-1 ring-primary-light ring-inset`}

    ${({ enableTransition }) =>
      enableTransition && tw`transition-all duration-500`}
  }

  .rc-slider-step {
    ${tw`hidden`}
  }

  .rc-slider-handle {
    ${tw`bg-fgd-1 border-4 border-primary-dark h-4 w-4`}

    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.3);
    margin-top: -3px;

    ${({ enableTransition }) =>
      enableTransition && tw`transition-all duration-500`}
  }

  .rc-slider-mark-text {
    ${tw`font-display transition-all duration-300 text-fgd-2 hover:text-primary-light`}
    font-size: 10px;
  }

  .rc-slider-mark-text-active {
    ${tw`opacity-60 hover:opacity-100`}
  }

  .rc-slider-mark-text:first-of-type {
    padding-left: 12px;
  }

  .rc-slider-mark-text:last-of-type {
    padding-right: 24px;
  }

  ${({ disabled }) => disabled && 'background-color: transparent'}
`

type SliderProps = {
  onChange: (...args: any[]) => any
  step: number
  value: number
  disabled: boolean
  max?: number
}

const marks = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%',
}

const AmountSlider: FunctionComponent<SliderProps> = ({
  onChange,
  step,
  value,
  disabled,
  max,
}) => {
  const [enableTransition, setEnableTransition] = useState(true)

  return (
    <StyledSlider
      min={0}
      max={max}
      value={value || 0}
      onChange={onChange}
      step={step}
      marks={marks}
      enableTransition={enableTransition}
      onBeforeChange={() => setEnableTransition(false)}
      onAfterChange={() => setEnableTransition(true)}
      disabled={disabled}
    />
  )
}

export default AmountSlider
