import React, { useEffect, useState } from 'react'
import Modal from '@components/Modal'
import useRealm from '@hooks/useRealm'
import { useForm } from 'react-hook-form'
import Button, { LinkButton, SecondaryButton } from '@components/Button'
import ButtonGroup from '@components/ButtonGroup'
import Input from '@components/inputs/Input'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import {
  getFormattedStringFromDays,
  yearsToDays,
} from 'VoteStakeRegistry/tools/dateTools'
import Tooltip from '@components/Tooltip'
import { QuestionMarkCircleIcon } from '@heroicons/react/solid'

const defaultLockupPeriods = [
  {
    value: yearsToDays(1),
    display: '1y',
  },
  {
    value: yearsToDays(2),
    display: '2y',
  },
  {
    value: yearsToDays(3),
    display: '3y',
  },
  {
    value: yearsToDays(4),
    display: '4y',
  },
  {
    value: yearsToDays(5),
    display: '5y',
  },
]

export enum LockupType {
  cliff = 'cliff',
  constant = 'constant',
}

const lockupInfosByType = {
  [LockupType.cliff]: [
    'Tokens are locked for a fixed duration and are released in full at the end of it.',
    'Vote weight declines linearly until release.',
    'Example: You lock 10.000 tokens for two years. They are then unavailable for the next two years. After this time, you can withdraw them again.',
  ],
  [LockupType.constant]: [
    'Tokens are locked indefinitely. At any time you can start the unlock process which lasts for the initially chosen lockup duration.',
    'Vote weight stays constant until you start the unlock process, then it declines linearly until release.',
    'Example: You lock 10.000 tokens with a lockup duration of one year. After two years you decide to start the unlocking process. Another year after that, you can withdraw the tokens.',
  ],
}

export interface LockTokensModalFormValues {
  lockupType: { value: LockupType; display: string }
  amount: number
  lockupPeriod: { value: number; display: string }
  lockupPeriodInDays: number
  lockupMoreThenDeposited: { value: boolean; display: string }
}

export const LockTokensModal: React.FC<{
  isOpen: boolean
  minLockupTimeInDays?: number
  maxLockupTimeInDays?: number
  maxLockupAmount: number
  calcMultiplierFn: (lockupPeriodInDays: number) => number
  onClose: () => void
  onSubmit: (values: LockTokensModalFormValues) => Promise<void>
}> = ({
  isOpen = false,
  minLockupTimeInDays = 0,
  maxLockupTimeInDays = Infinity,
  maxLockupAmount,
  calcMultiplierFn,
  onClose,
  onSubmit,
}) => {
  const { mint } = useRealm()
  const [showCustomDuration, setShowCustomDuration] = useState(false)
  const [showLockupTypeInfo, setShowLockupTypeInfo] = useState<boolean>(false)
  const mintMinAmount = mint ? getMintMinAmountAsDecimal(mint) : 1
  const currentPrecision = precision(mintMinAmount)
  const hasMinLockup = minLockupTimeInDays && minLockupTimeInDays > 0
  const hasMaxLockup = maxLockupTimeInDays && maxLockupTimeInDays !== Infinity
  const lockupMoreThenDepositedOptions = [
    { value: false, display: 'No' },
    { value: true, display: 'Yes' },
  ]
  const lockupTypeOptions = [
    { value: LockupType.cliff, display: 'Cliff' },
    { value: LockupType.constant, display: 'Constant' },
  ]

  const lockupPeriodOptions = [
    ...(hasMinLockup
      ? [
          {
            value: minLockupTimeInDays,
            display: 'min',
          },
        ]
      : []),
    ...defaultLockupPeriods.filter(
      (lp) => lp.value >= minLockupTimeInDays && lp.value <= maxLockupTimeInDays
    ),
  ]

  const { setValue, watch, handleSubmit } = useForm<LockTokensModalFormValues>({
    defaultValues: {
      lockupType: lockupTypeOptions[0],
      lockupPeriod: lockupPeriodOptions[0],
      lockupPeriodInDays: lockupPeriodOptions[0].value,
      lockupMoreThenDeposited: lockupMoreThenDepositedOptions[0],
    },
  })

  const {
    lockupType,
    amount,
    lockupPeriod,
    lockupPeriodInDays,
    lockupMoreThenDeposited,
  } = watch()

  // validateAmountOnChange
  useEffect(() => {
    if (amount) {
      setValue(
        'amount',
        parseFloat(
          Math.max(
            Number(mintMinAmount),
            Math.min(Number(maxLockupAmount), Number(amount))
          ).toFixed(currentPrecision)
        )
      )
    }
  }, [amount, setValue, mintMinAmount, maxLockupAmount, currentPrecision])

  useEffect(() => {
    if (lockupPeriod) {
      setValue('lockupPeriodInDays', lockupPeriod?.value)
    }
  }, [lockupPeriod, setValue])

  const handleOnSubmit = handleSubmit(
    async (values: LockTokensModalFormValues) => {
      try {
        await onSubmit(values)
        onClose()
      } catch (e) {
        console.error(e)
      }
    }
  )

  const labelClasses = 'mb-2 text-fgd-2 text-sm'
  // TODO (BRY): Add lockupMoreThenDeposited logic
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <form onSubmit={handleOnSubmit}>
        <h2 className="mb-4 flex flex-row items-center">Lock Tokens</h2>
        {hasMinLockup && !showLockupTypeInfo && (
          <div className="bg-bkg-3 rounded-md w-full p-4 mb-4 font-normal text-xs">
            <div>
              There is a minimum required lockup time of{' '}
              <span className="bont-bold text-sm text-primary-light">
                {getFormattedStringFromDays(minLockupTimeInDays)}
              </span>
            </div>
          </div>
        )}
        {!showLockupTypeInfo && (
          <>
            <div className="flex items-center justify-between">
              <div className={labelClasses}>Lockup Type</div>
              <LinkButton
                className="mb-2"
                onClick={() => setShowLockupTypeInfo(true)}
              >
                About Lockup Types
              </LinkButton>
            </div>
            <div className="mb-4">
              <ButtonGroup
                activeValue={lockupType!.display}
                className="h-10"
                values={lockupTypeOptions.map((lt) => lt.display)}
                onChange={(type) =>
                  setValue(
                    'lockupType',
                    lockupTypeOptions.find((lt) => lt.display === type)!
                  )
                }
              />
            </div>
            <div className="mb-4">
              <div className={`${labelClasses} flex justify-between`}>
                Amount to Lock
                <LinkButton
                  className="text-primary-light"
                  onClick={() => setValue('amount', maxLockupAmount)}
                >
                  Max: {maxLockupAmount}
                </LinkButton>
              </div>
              <Input
                max={maxLockupAmount}
                min={mintMinAmount}
                value={amount}
                type="number"
                onChange={(e) => setValue('amount', +e.target.value)}
                step={mintMinAmount}
              />
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div className={labelClasses}>Duration</div>
                <LinkButton
                  className="mb-2"
                  onClick={() => setShowCustomDuration((oldValue) => !oldValue)}
                >
                  Custom Duration
                </LinkButton>
              </div>
              <ButtonGroup
                className="h-10"
                activeValue={showCustomDuration ? '' : lockupPeriod!.display}
                values={lockupPeriodOptions.map((p) => p.display)}
                onChange={(period) => {
                  setValue(
                    'lockupPeriod',
                    lockupPeriodOptions.find((p) => p.display === period)!
                  )
                  setShowCustomDuration(false)
                }}
              />
            </div>
            {showCustomDuration && (
              <>
                <div className={`${labelClasses} flex justify-between`}>
                  Number of days
                </div>
                <Input
                  className="mb-4"
                  type="number"
                  min={hasMinLockup ? minLockupTimeInDays : 1}
                  max={hasMaxLockup ? maxLockupTimeInDays : Infinity}
                  value={lockupPeriodInDays}
                  step={1}
                  onChange={({ target: { value } }) => {
                    setValue('lockupPeriodInDays', Number(value))
                  }}
                  onBlur={({ target: { value } }) => {
                    setValue(
                      'lockupPeriodInDays',
                      value > minLockupTimeInDays
                        ? value > maxLockupTimeInDays
                          ? maxLockupTimeInDays
                          : value
                        : minLockupTimeInDays
                    )
                  }}
                />
              </>
            )}
            <div className={`${labelClasses} flex items-center`}>
              {lockupType.value === LockupType.constant
                ? 'Vote Weight Multiplier'
                : 'Initial Vote Weight Multiplier'}
              {lockupType.value !== LockupType.constant ? (
                <Tooltip content="The multiplier will decline linearly over time">
                  <QuestionMarkCircleIcon className="cursor-help h-4 ml-1 w-4" />
                </Tooltip>
              ) : null}
              <span className="font-bold ml-auto text-fgd-1">
                {calcMultiplierFn(lockupPeriodInDays)}x
              </span>
            </div>
            <div className="w-full h-2 bg-bkg-1 rounded-lg mb-4">
              <div
                style={{
                  width: `${
                    calcMultiplierFn(lockupPeriodInDays) > 100
                      ? 100
                      : calcMultiplierFn(lockupPeriodInDays)
                  }%`,
                }}
                className="bg-primary-light h-2 rounded-lg"
              ></div>
            </div>
          </>
        )}
        {showLockupTypeInfo ? (
          <>
            {lockupTypeOptions.map((type) => (
              <>
                <h2 className="text-base" key={type.value}>
                  {type.display}
                </h2>
                <p className="mb-2">
                  {lockupInfosByType[type.value].map((info) => (
                    <p className="mb-2" key={info}>
                      {info}
                    </p>
                  ))}
                </p>
              </>
            ))}

            <Button
              className="mt-4 w-full"
              onClick={() => setShowLockupTypeInfo(false)}
            >
              Back
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-col pt-4">
              <Button
                className="mb-4"
                type="submit"
                disabled={
                  !amount ||
                  !maxLockupAmount ||
                  !lockupPeriodInDays ||
                  lockupPeriodInDays === 0
                }
              >
                Lock Tokens
              </Button>
              <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            </div>
          </>
        )}
      </form>
    </Modal>
  )
}
