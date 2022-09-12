import { FunctionComponent, useEffect, useState } from 'react'
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

const StyledSliderButtonWrapper = styled.div`
  ${tw`absolute left-0 top-4 w-full`}
`

type StyledSliderButtonProps = {
  styleValue: number
  sliderValue: number
}

const StyledSliderButton = styled.button<StyledSliderButtonProps>`
  ${tw`bg-none font-display transition-all duration-300 hover:text-primary-light focus:outline-none`}
  font-size: 0.6rem;
  position: absolute;
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  left: 0%;

  :nth-of-type(2) {
    left: 23%;
    transform: translateX(-23%);
  }

  :nth-of-type(3) {
    left: 50%;
    transform: translateX(-50%);
  }

  :nth-of-type(4) {
    left: 76%;
    transform: translateX(-76%);
  }

  :nth-of-type(5) {
    left: 100%;
    transform: translateX(-100%);
  }

  ${({ styleValue, sliderValue }) => styleValue < sliderValue && tw`opacity-40`}
  ${({ styleValue, sliderValue }) =>
    styleValue === sliderValue && tw`animate-pulse text-primary-light`}
  ${({ disabled }) => disabled && 'cursor: default'}
`

type SliderProps = {
  onChange: (...args: any[]) => any
  step: number
  value: number
  disabled: boolean
  max?: number
  min?: number
  maxButtonTransition?: boolean
}

const AmountSlider: FunctionComponent<SliderProps> = ({
  onChange,
  step,
  value,
  disabled,
  max,
  min = 0,
  maxButtonTransition,
}) => {
  const [enableTransition, setEnableTransition] = useState(false)

  useEffect(() => {
    if (maxButtonTransition) {
      setEnableTransition(true)
    }
  }, [maxButtonTransition])

  useEffect(() => {
    if (enableTransition) {
      const transitionTimer = setTimeout(() => {
        setEnableTransition(false)
      }, 500)
      return () => clearTimeout(transitionTimer)
    }
  }, [enableTransition])

  const handleSliderButtonClick = (value) => {
    onChange(value)
    setEnableTransition(true)
  }

  return (
    <div className="relative">
      <StyledSlider
        min={min}
        max={max}
        value={value || 0}
        onChange={onChange}
        step={step}
        enableTransition={enableTransition}
        disabled={disabled}
      />
      <StyledSliderButtonWrapper>
        <StyledSliderButton
          onClick={() => handleSliderButtonClick(0)}
          styleValue={0}
          sliderValue={value}
          disabled={disabled}
        >
          0%
        </StyledSliderButton>
        <StyledSliderButton
          onClick={() => handleSliderButtonClick(25)}
          styleValue={25}
          sliderValue={value}
          disabled={disabled}
        >
          25%
        </StyledSliderButton>
        <StyledSliderButton
          onClick={() => handleSliderButtonClick(50)}
          styleValue={50}
          sliderValue={value}
          disabled={disabled}
        >
          50%
        </StyledSliderButton>
        <StyledSliderButton
          onClick={() => handleSliderButtonClick(75)}
          styleValue={75}
          sliderValue={value}
          disabled={disabled}
        >
          75%
        </StyledSliderButton>
        <StyledSliderButton
          onClick={() => handleSliderButtonClick(100)}
          styleValue={100}
          sliderValue={value}
          disabled={disabled}
        >
          100%
        </StyledSliderButton>
      </StyledSliderButtonWrapper>
    </div>
  )
}

export default AmountSlider
