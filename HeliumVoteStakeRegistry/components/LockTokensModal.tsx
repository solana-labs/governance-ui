import React, { useEffect, useState } from 'react'
import Modal from '@components/Modal'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'
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

const defaultLockupPeriods: Period[] = [
  {
    defaultValue: yearsToDays(1),
    display: '1y',
  },
  {
    defaultValue: yearsToDays(2),
    display: '2y',
  },
  {
    defaultValue: yearsToDays(3),
    display: '3y',
  },
  {
    defaultValue: yearsToDays(4),
    display: '4y',
  },
  {
    defaultValue: yearsToDays(5),
    display: '5y',
  },
]

export enum LockupType {
  cliff = 'cliff',
  constant = 'constant',
}

export interface Period {
  defaultValue: number
  display: string
}

export interface LockTokensModalFormValues {
  lockupType: LockupType
  amount: number
  lockupPeriod: Period | undefined
}

export const LockTokensModal: React.FC<{
  isOpen: boolean
  minimumLockupTimeInDays?: number
  onClose: () => void
  onSubmit: (values: LockTokensModalFormValues) => void
}> = ({
  isOpen = false,
  minimumLockupTimeInDays = undefined,
  onClose,
  onSubmit,
}) => {
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<LockTokensModalFormValues>({
    defaultValues: {
      lockupType: LockupType.cliff,
      lockupPeriod: undefined,
    },
  })
  const { mint, realm, realmTokenAccount, realmInfo, tokenRecords } = useRealm()
  const [showCustomDuration, setShowCustomDuration] = useState(false)
  const [showLockupTypeInfo, setShowLockupTypeInfo] = useState<boolean>(false)
  const [wallet, connection, endpoint] = useWalletStore((s) => [
    s.current,
    s.connection.current,
    s.connection.endpoint,
  ])

  const [
    vsrClient,
    vsrRegistrar,
    vsrRegistrarPk,
  ] = useVotePluginsClientStore((s) => [
    s.state.vsrClient,
    s.state.voteStakeRegistryRegistrar,
    s.state.voteStakeRegistryRegistrarPk,
  ])

  const mintMinAmount = mint ? getMintMinAmountAsDecimal(mint) : 1
  const currentPrecision = precision(mintMinAmount)
  const hasMinimumLockup =
    minimumLockupTimeInDays && minimumLockupTimeInDays > 0
  const lockupPeriods = hasMinimumLockup
    ? [
        {
          defaultValue: minimumLockupTimeInDays,
          display: 'min',
        },
        ...defaultLockupPeriods.filter(
          (period) =>
            period.defaultValue == 1 ||
            period.defaultValue > minimumLockupTimeInDays
        ),
      ]
    : defaultLockupPeriods
  const { lockupType, amount, lockupPeriod } = watch()

  // validateAmountOnChange
  useEffect(() => {
    if (amount) {
      setValue(
        'amount',
        parseFloat(
          Math.max(
            Number(mintMinAmount),
            Math.min(Number(100), Number(amount))
          ).toFixed(currentPrecision)
        )
      )
    }
  }, [amount, setValue, mintMinAmount, currentPrecision])

  const handleOnSubmit = handleSubmit((values: LockTokensModalFormValues) => {
    onSubmit(values)
    onClose()
  })

  const labelClasses = 'mb-2 text-fgd-2 text-sm'
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <form onSubmit={handleOnSubmit}>
        <h2 className="mb-4 flex flex-row items-center">Lock Tokens</h2>
        {hasMinimumLockup && !showLockupTypeInfo && (
          <div className="bg-bkg-3 rounded-md w-full p-4 mb-4 font-normal text-xs">
            <div>
              There is a minimum required lockup time of{' '}
              <span className="bont-bold text-sm text-primary-light">
                {getFormattedStringFromDays(minimumLockupTimeInDays)}
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
                activeValue={lockupType}
                className="h-10"
                onChange={(type) => setValue('lockupType', LockupType[type])}
                values={[LockupType.cliff, LockupType.constant]}
              />
            </div>
            <div className="mb-4">
              <div className={`${labelClasses} flex justify-between`}>
                Amount to Lock
                <LinkButton
                  className="text-primary-light"
                  onClick={() => setValue('amount', 100)}
                >
                  Max: {100}
                </LinkButton>
              </div>
              <Input
                max={100}
                min={mintMinAmount}
                value={amount}
                type="number"
                onChange={(e) => setValue('amount', +e.target.value)}
                step={mintMinAmount}
              />
            </div>
            <div className="mb-4">
              <div className={labelClasses}>Duration</div>
              <ButtonGroup
                className="h-10"
                activeValue={lockupPeriod?.display || lockupPeriods[0].display}
                values={lockupPeriods.map((p) => p.display)}
                onChange={(period) =>
                  setValue(
                    'lockupPeriod',
                    lockupPeriods.find((p) => p.display === period)
                  )
                }
              />
            </div>
          </>
        )}
        {showLockupTypeInfo ? (
          <>
            {(Object.keys(LockupType) as Array<keyof typeof LockupType>).map(
              (key) => (
                <>
                  <h2 className="text-base" key={key}>
                    {key}
                  </h2>
                  <p className="mb-2">herp drp erer</p>
                </>
              )
            )}

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
              <Button className="mb-4" type="submit">
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
