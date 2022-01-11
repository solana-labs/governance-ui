import Button, { SecondaryButton } from '@components/Button'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import Modal from '@components/Modal'
import Tooltip from '@components/Tooltip'
import { Tab } from '@headlessui/react'
import { QuestionMarkCircleIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import {
  fmtMintAmount,
  getMintDecimalAmount,
  getMintMinAmountAsDecimal,
} from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
interface Period {
  value: number
  display: string
  multiplier: number
}
interface LockupType {
  value: string
  info: string
}
interface VestingPeriod {
  value: number
  display: string
  info: string
}
const VESTED = 'Vested'
const lockupTypes: LockupType[] = [
  {
    value: 'Cliff',
    info:
      'Tokens are locked for a set timeframe and are released in full at the end of the period. Vote weight increase declines linearly over the period.',
  },
  {
    value: 'Constant',
    info:
      'Tokens are locked permanently for a timeframe. At any time a constant lockup can be converted to a cliff lockup with a timeframe greater than or equal to the constant lockup period. Vote weight increase stays constant until the lockup is converted to a cliff type lockup.',
  },
  {
    value: VESTED,
    info:
      'Tokens are locked for a given timeframe and released over time at a rate of (number of periods / locked amount) per release period. Tokens can be released weekly, monthly or yearly. Vote weight increase declines linearly over the period.',
  },
]
//TODO read multiplier from program
const lockupPeriods: Period[] = [
  {
    value: 1,
    display: '1y',
    multiplier: 1.2,
  },
  {
    value: 2,
    display: '2y',
    multiplier: 1.4,
  },
  {
    value: 3,
    display: '3y',
    multiplier: 1.6,
  },
  {
    value: 4,
    display: '4y',
    multiplier: 1.8,
  },
  {
    value: 5,
    display: '5y',
    multiplier: 2,
  },
]
const maxMultiplier = 2
const vestingPeriods: VestingPeriod[] = [
  {
    value: 7,
    display: 'Weekly',
    info: 'per week',
  },
  {
    value: 30,
    display: 'Monthly',
    info: 'per month',
  },
  {
    value: 365,
    display: 'Yearly',
    info: 'per year',
  },
]
const YES = 'YES'
const NO = 'NO'

const LockTokensModal = ({ onClose, isOpen }) => {
  const { ownTokenRecord, mint, realm } = useRealm()
  const depositedTokens =
    ownTokenRecord && mint
      ? fmtMintAmount(mint, ownTokenRecord.info.governingTokenDepositAmount)
      : '0'
  const mintMinAmount = mint ? getMintMinAmountAsDecimal(mint) : 1
  //TODO get tokens from wallet
  const hasMoreTokensInWallet = false
  const currentPrecision = precision(mintMinAmount)
  //TODO if tokens in wallet add wallet amout to this
  const maxAmountToLock =
    ownTokenRecord && mint
      ? getMintDecimalAmount(
          mint,
          ownTokenRecord.info.governingTokenDepositAmount
        )
      : 0
  const maxAmountFtm =
    ownTokenRecord && mint
      ? fmtMintAmount(mint, ownTokenRecord.info.governingTokenDepositAmount)
      : '0'
  //
  const tokenName = mint ? getMintMetadata(realm?.info.communityMint)?.name : ''
  const [lockupPeriod, setLockupPeriod] = useState<Period>(lockupPeriods[0])
  const [amount, setAmount] = useState<number | undefined>(undefined)
  const [lockMoreThenDeposited, setLockMoreThenDeposited] = useState<string>('')
  const [lockupType, setLockupType] = useState<LockupType>(lockupTypes[0])
  const [vestingPeriod, setVestingPeriod] = useState<VestingPeriod>(
    vestingPeriods[0]
  )
  const [currentStep, setCurrentStep] = useState(0)
  const currentPercentOfMaxMultiplier =
    (100 * lockupPeriod.multiplier) / maxMultiplier

  const handleSetVestingPeriod = (idx) => {
    setVestingPeriod(vestingPeriods[idx])
  }
  const handleSetLockupPeriod = (idx) => {
    setLockupPeriod(lockupPeriods[idx])
  }
  const handleSetLockupType = (idx) => {
    setLockupType(lockupTypes[idx])
  }
  const handleNextStep = () => {
    setCurrentStep(currentStep + 1)
  }
  const validateAmountOnBlur = () => {
    const val = parseFloat(
      Math.max(
        Number(mintMinAmount),
        Math.min(Number(maxAmountToLock), Number(amount))
      ).toFixed(currentPrecision)
    )
    setAmount(val)
  }
  const handleSaveLock = () => {
    //TODO integrate
    onClose()
  }

  const baseTabClasses =
    'w-full default-transition font-bold px-4 py-2.5 text-sm focus:outline-none bg-bkg-4 hover:bg-primary-dark'
  const tabClasses = ({ val, index, currentValue, lastItemIdx }) =>
    classNames(
      baseTabClasses,
      val === currentValue ? 'bg-primary-light text-bkg-2' : '',
      index === 0 && 'rounded-bl-lg rounded-tl-lg',
      index === lastItemIdx + 1 && 'rounded-br-lg rounded-tr-lg'
    )
  const labelClasses = 'text-xs mb-2'
  const DoYouWantToDepositMoreComponent = () => (
    <>
      <div className="text-xs mb-2">
        Do you want to lock more then the {depositedTokens} you have deposited?
      </div>
      <Tab.Group
        onChange={(index) => {
          index === 0
            ? setLockMoreThenDeposited(YES)
            : setLockMoreThenDeposited(NO)
        }}
      >
        <Tab.List className="flex mb-6">
          <Tab
            className={`${baseTabClasses} rounded-bl-lg rounded-tl-lg ${
              lockMoreThenDeposited === YES && 'bg-primary-light text-bkg-2'
            }`}
          >
            Yes
          </Tab>
          <Tab
            className={`${baseTabClasses} rounded-br-lg rounded-tr-lg ${
              lockMoreThenDeposited === NO && 'bg-primary-light text-bkg-2'
            }`}
          >
            No
          </Tab>
        </Tab.List>
      </Tab.Group>
    </>
  )
  const getCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className={labelClasses}>Lockup Type</div>
            <Tab.Group onChange={handleSetLockupType}>
              <Tab.List className="flex mb-6">
                {lockupTypes.map((type, index) => (
                  <Tab
                    key={type.value}
                    className={tabClasses({
                      val: lockupType.value,
                      index: index,
                      currentValue: type.value,
                      lastItemIdx: lockupTypes.length,
                    })}
                  >
                    {type.value}
                  </Tab>
                ))}
              </Tab.List>
            </Tab.Group>
            <div className={`${labelClasses} font-bold`}>
              {lockupType.value} Lockup
            </div>
            <div className="text-xs">{lockupType.info}</div>
          </>
        )
      case 1:
        return (
          <DoYouWantToDepositMoreComponent></DoYouWantToDepositMoreComponent>
        )
      case 2:
        return (
          <div className="mb-6">
            {hasMoreTokensInWallet && (
              <DoYouWantToDepositMoreComponent></DoYouWantToDepositMoreComponent>
            )}
            <div className="mb-6">
              <div className={`${labelClasses} flex`}>
                Amount to lock{' '}
                <div
                  className="ml-auto underline cursor-pointer"
                  onClick={() => setAmount(Number(maxAmountToLock))}
                >
                  Max: {maxAmountFtm}
                </div>
              </div>
              <Input
                max={maxAmountToLock}
                min={mintMinAmount}
                value={amount}
                type="number"
                onChange={(e) => setAmount(e.target.value)}
                step={mintMinAmount}
                onBlur={validateAmountOnBlur}
              />
            </div>
            <div className={labelClasses}>Duration</div>
            <Tab.Group onChange={handleSetLockupPeriod}>
              <Tab.List className="flex mb-6">
                {lockupPeriods.map((period, index) => (
                  <Tab
                    key={period.value}
                    className={tabClasses({
                      val: lockupPeriod.value,
                      index: index,
                      currentValue: period.value,
                      lastItemIdx: lockupPeriods.length,
                    })}
                  >
                    {period.display}
                  </Tab>
                ))}
              </Tab.List>
            </Tab.Group>
            {lockupType.value === 'Vested' && (
              <div className="mb-6">
                <div className={labelClasses}>Vesting Period</div>
                <Tab.Group onChange={handleSetVestingPeriod}>
                  <Tab.List className="flex mb-6">
                    {vestingPeriods.map((period, index) => (
                      <Tab
                        key={period.value}
                        className={tabClasses({
                          val: vestingPeriod.value,
                          index: index,
                          currentValue: period.value,
                          lastItemIdx: vestingPeriods.length,
                        })}
                      >
                        {period.display}
                      </Tab>
                    ))}
                  </Tab.List>
                </Tab.Group>
                <div className={labelClasses}>Vesting rate</div>
                {/* TODO tokens */}
                <div className="text-xs">xxx {vestingPeriod.info}</div>
              </div>
            )}
            {/* TODO tooltip */}
            <div className={`${labelClasses} flex`}>
              Initial Vote Weight Multiplier
              <Tooltip content="Lorem ipsum">
                <QuestionMarkCircleIcon className="w-4 h-4 ml-1"></QuestionMarkCircleIcon>
              </Tooltip>
              <span className="ml-auto">{lockupPeriod.multiplier}x</span>
            </div>
            <div className="w-full h-2 bg-bkg-1 rounded-lg">
              <div
                style={{ width: `${currentPercentOfMaxMultiplier}%` }}
                className="bg-primary-light h-2 rounded-lg"
              ></div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="flex flex-col text-center mb-6">
            <h2>
              Lock {amount} for {lockupPeriod.value} {tokenName}
              {lockupPeriod.value > 1 ? 'years' : 'year'}?
            </h2>
            <div className="text-xs">Locking tokens can’t be undone.</div>
          </div>
        )
      default:
        return 'Unknown step'
    }
  }

  useEffect(() => {
    if (currentStep === 1) {
      handleNextStep()
    }
  }, [lockMoreThenDeposited])
  useEffect(() => {
    if (currentStep === 1 && !hasMoreTokensInWallet) {
      handleNextStep()
    }
  }, [currentStep])

  const isMainBtnVisible = !hasMoreTokensInWallet || currentStep !== 1
  const isTitleVisible = currentStep !== 3
  const getCurrentBtnForStep = () => {
    switch (currentStep) {
      case 2:
        return (
          <Button className="mb-4" onClick={handleNextStep}>
            Lock Tokens
          </Button>
        )
      case 3:
        return (
          <Button className="mb-4" onClick={handleSaveLock}>
            Confirm
          </Button>
        )
      default:
        return (
          <Button className="mb-4" onClick={handleNextStep}>
            Next
          </Button>
        )
    }
  }
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2 className="mb-6 flex flex-row items-center">
        {isTitleVisible && 'Lock Tokens'}
        {currentStep === 2 && (
          <div className="ml-auto">
            <Select
              className="text-xs w-28"
              onChange={handleSetLockupType}
              value={lockupType.value}
            >
              {lockupTypes.map((x, idx) => (
                <Select.Option key={x.value} value={idx}>
                  <div>{x.value}</div>
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
      </h2>
      {getCurrentStep()}
      <div className="flex flex-col py-4">
        {isMainBtnVisible && getCurrentBtnForStep()}
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
      </div>
    </Modal>
  )
}

export default LockTokensModal
