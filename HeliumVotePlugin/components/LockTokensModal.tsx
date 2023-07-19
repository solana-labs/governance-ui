import React, { useEffect, useState } from 'react'
import Modal from '@components/Modal'
import { useForm } from 'react-hook-form'
import Button, { LinkButton, SecondaryButton } from '@components/Button'
import ButtonGroup from '@components/ButtonGroup'
import Input from '@components/inputs/Input'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import { getFormattedStringFromDays, yearsToDays } from '@utils/dateTools'
import Tooltip from '@components/Tooltip'
import { QuestionMarkCircleIcon } from '@heroicons/react/solid'
import { notify } from '@utils/notifications'
import { useRealmCommunityMintInfoQuery } from '@hooks/queries/mintInfo'

const defaultLockupPeriods = [
  {
    value: 183,
    display: '6m',
  },
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
]

export enum LockupKind {
  none = 'none',
  cliff = 'cliff',
  constant = 'constant',
}

const lockupInfosByType = {
  [LockupKind.cliff]: [
    'Tokens are locked for a fixed duration and are released in full at the end of it.',
    'Vote weight declines linearly until release.',
    'Example: You lock 10.000 tokens for two years. They are then unavailable for the next two years. After this time, you can withdraw them again.',
  ],
  [LockupKind.constant]: [
    'Tokens are locked indefinitely. At any time you can start the unlock process which lasts for the initially chosen lockup duration.',
    'Vote weight stays constant until you start the unlock process, then it declines linearly until release.',
    'Example: You lock 10.000 tokens with a lockup duration of one year. After two years you decide to start the unlocking process. Another year after that, you can withdraw the tokens.',
  ],
}

export interface LockTokensModalFormValues {
  lockupKind: { value: LockupKind; display: string }
  amount: number
  lockupPeriod: { value: number; display: string }
  lockupPeriodInDays: number
}

export const LockTokensModal: React.FC<{
  isOpen: boolean
  mode?: 'lock' | 'extend' | 'split'
  minLockupTimeInDays?: number
  maxLockupTimeInDays?: number
  maxLockupAmount: number
  calcMultiplierFn: (lockupPeriodInDays: number) => number
  onClose: () => void
  onSubmit: (values: LockTokensModalFormValues) => Promise<void>
}> = ({
  isOpen = false,
  mode = 'lock',
  minLockupTimeInDays = 0,
  maxLockupTimeInDays = Infinity,
  maxLockupAmount,
  calcMultiplierFn,
  onClose,
  onSubmit,
}) => {
  const mint = useRealmCommunityMintInfoQuery().data?.result

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCustomDuration, setShowCustomDuration] = useState(false)
  const [showLockupKindInfo, setShowLockupKindInfo] = useState<boolean>(false)
  const mintMinAmount = mint ? getMintMinAmountAsDecimal(mint) : 1
  const currentPrecision = precision(mintMinAmount)
  const hasMinLockup = minLockupTimeInDays && minLockupTimeInDays > 0
  const hasMaxLockup = maxLockupTimeInDays && maxLockupTimeInDays !== Infinity
  const lockupKindOptions = [
    { value: LockupKind.cliff, display: 'Decaying' },
    { value: LockupKind.constant, display: 'Constant' },
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
      (lp) => lp.value > minLockupTimeInDays && lp.value <= maxLockupTimeInDays
    ),
  ]

  const { setValue, watch, handleSubmit } = useForm<LockTokensModalFormValues>({
    defaultValues: {
      lockupKind: lockupKindOptions[0],
      lockupPeriod: lockupPeriodOptions[0],
      lockupPeriodInDays: lockupPeriodOptions[0].value,
    },
  })

  const { lockupKind, amount, lockupPeriod, lockupPeriodInDays } = watch()

  useEffect(() => {
    if (lockupPeriod) {
      setValue('lockupPeriodInDays', lockupPeriod?.value)
    }
  }, [lockupPeriod, setValue])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!Number(e.target.value)) {
      return setValue('amount', Number(e.target.value))
    }

    setValue(
      'amount',
      parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(maxLockupAmount), Number(e.target.value))
        ).toFixed(currentPrecision)
      )
    )
  }

  const handleOnSubmit = handleSubmit(
    async (values: LockTokensModalFormValues) => {
      try {
        setIsSubmitting(true)
        await onSubmit(values)
        onClose()
      } catch (e) {
        setIsSubmitting(false)
        notify({
          type: 'error',
          message: e.message || 'Unable to lock tokens',
        })
      }
    }
  )

  const labelClasses = 'mb-2 text-fgd-2 text-sm'
  const lockupMultiplier = calcMultiplierFn(lockupPeriodInDays)
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <form onSubmit={handleOnSubmit}>
        <h2 className="mb-4 flex flex-row items-center">
          {
            {
              lock: 'Lock Tokens',
              extend: 'Extend Lockup',
            }[mode]
          }
        </h2>
        {hasMinLockup && !showLockupKindInfo ? (
          <div className="bg-bkg-3 rounded-md w-full p-4 mb-4 font-normal text-xs">
            <div>
              Select a new lockup period longer than the existing{' '}
              <span className="bkg-font-bold text-primary-light">
                {getFormattedStringFromDays(minLockupTimeInDays)}
              </span>
            </div>
            {mode === 'split' ? (
              <>
                <br />
                <div className="text-red">
                  Splitting a Landrush position after the Landrush period will
                  result in the split tokens losing the multiplier!
                </div>
              </>
            ) : null}
          </div>
        ) : null}
        {!showLockupKindInfo && (
          <>
            {['lock', 'split'].includes(mode) && (
              <>
                <div className="flex items-center justify-between">
                  <div className={labelClasses}>Lockup Type</div>
                  <LinkButton
                    className="mb-2"
                    onClick={() => setShowLockupKindInfo(true)}
                  >
                    About Lockup Types
                  </LinkButton>
                </div>
                <div className="mb-4">
                  <ButtonGroup
                    activeValue={lockupKind!.display}
                    className="h-10"
                    values={lockupKindOptions.map((lt) => lt.display)}
                    onChange={(kind) =>
                      setValue(
                        'lockupKind',
                        lockupKindOptions.find((lt) => lt.display === kind)!
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
                    onChange={handleAmountChange}
                    step={mintMinAmount}
                  />
                </div>
              </>
            )}
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
                    const val = Number(value)
                    setValue(
                      'lockupPeriodInDays',
                      val > minLockupTimeInDays
                        ? val > maxLockupTimeInDays
                          ? maxLockupTimeInDays
                          : val
                        : minLockupTimeInDays
                    )
                  }}
                />
              </>
            )}
            <div className={`${labelClasses} flex items-center`}>
              {lockupKind.value === LockupKind.constant
                ? 'Vote Weight Multiplier'
                : 'Initial Vote Weight Multiplier'}
              {lockupKind.value !== LockupKind.constant ? (
                <Tooltip content="The multiplier will decline linearly over time">
                  <QuestionMarkCircleIcon className="cursor-help h-4 ml-1 w-4" />
                </Tooltip>
              ) : null}
              <span className="font-bold ml-auto text-fgd-1">
                {lockupMultiplier}x
              </span>
            </div>
            <div className="w-full h-2 bg-bkg-1 rounded-lg mb-4">
              <div
                style={{
                  width: `${lockupMultiplier > 100 ? 100 : lockupMultiplier}%`,
                }}
                className="bg-primary-light h-2 rounded-lg"
              ></div>
            </div>
          </>
        )}
        {showLockupKindInfo ? (
          <>
            {lockupKindOptions.map((type) => (
              <div className="mb-6" key={type.value}>
                <h2 className="text-primary-light">{type.display}</h2>
                <p className="mb-2">
                  {lockupInfosByType[type.value].map((info) => (
                    <p className="mb-2" key={info}>
                      {info}
                    </p>
                  ))}
                </p>
              </div>
            ))}
            <Button
              className="mt-4 w-full"
              onClick={() => setShowLockupKindInfo(false)}
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
                isLoading={isSubmitting}
                disabled={
                  {
                    lock:
                      !amount ||
                      !maxLockupAmount ||
                      !lockupPeriodInDays ||
                      lockupPeriodInDays === 0 ||
                      isSubmitting,
                    extend:
                      !lockupPeriodInDays ||
                      lockupPeriodInDays === 0 ||
                      isSubmitting,
                    split:
                      !amount ||
                      !maxLockupAmount ||
                      !lockupPeriodInDays ||
                      lockupPeriodInDays === 0 ||
                      isSubmitting,
                  }[mode]
                }
              >
                {
                  {
                    lock: 'Lock Tokens',
                    extend: 'Extend Lockup',
                    split: 'Split Position',
                  }[mode]
                }
              </Button>
              <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            </div>
          </>
        )}
      </form>
    </Modal>
  )
}
