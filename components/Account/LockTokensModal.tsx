import Button, { SecondaryButton } from '@components/Button'
import Input from '@components/inputs/Input'
import Modal from '@components/Modal'
import { Tab } from '@headlessui/react'
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
  multiplier: string
}
interface LockupType {
  value: string
  info: string
}
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
    value: 'Vested',
    info:
      'Tokens are locked for a given timeframe and released over time at a rate of (number of periods / locked amount) per release period. Tokens can be released weekly, monthly or yearly. Vote weight increase declines linearly over the period.',
  },
]
const lockPeriods: Period[] = [
  {
    value: 1,
    display: '1y',
    multiplier: '1.2',
  },
  {
    value: 2,
    display: '2y',
    multiplier: '1.6',
  },
  {
    value: 3,
    display: '3y',
    multiplier: '2.0',
  },
  {
    value: 4,
    display: '4y',
    multiplier: '2.5',
  },
  {
    value: 5,
    display: '5y',
    multiplier: '3',
  },
]
const YES = 'YES'
const NO = 'NO'

const LockTokensModal = ({ onClose, isOpen }) => {
  const { ownTokenRecord, mint } = useRealm()
  const depositedTokens =
    ownTokenRecord && mint
      ? fmtMintAmount(mint, ownTokenRecord.info.governingTokenDepositAmount)
      : '0'
  const mintMinAmount = mint ? getMintMinAmountAsDecimal(mint) : 1
  //TODO get tokens from wallet
  const hasMoreTokensInWallet = true
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
  const [lockupPeriod, setLockupPeriod] = useState<Period>(lockPeriods[0])
  const [amount, setAmount] = useState<number | undefined>(undefined)
  const [lockMoreThenDeposited, setLockMoreThenDeposited] = useState<string>('')
  const [lockupType, setLockupType] = useState<LockupType>(lockupTypes[0])
  const handleSetLockupPeriod = (idx) => {
    setLockupPeriod(lockPeriods[idx])
  }
  const handleSetLockupType = (idx) => {
    setLockupType(lockupTypes[idx])
  }
  const [currentStep, setCurrentStep] = useState(0)
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
        <Tab.List className="flex mb-4">
          <Tab
            className={`w-full default-transition font-bold px-4 py-2.5 text-sm focus:outline-none bg-bkg-4 hover:bg-primary-dark rounded-bl-lg rounded-tl-lg ${
              lockMoreThenDeposited === YES && 'bg-primary-light text-bkg-2'
            }`}
          >
            Yes
          </Tab>
          <Tab
            className={`w-full default-transition font-bold px-4 py-2.5 text-sm focus:outline-none bg-bkg-4 hover:bg-primary-dark rounded-br-lg rounded-tr-lg ${
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
            <div className="text-xs mb-2">Lockup Type</div>
            <Tab.Group onChange={handleSetLockupType}>
              <Tab.List className="flex mb-4">
                {lockupTypes.map((type, index) => (
                  <Tab
                    key={type.value}
                    className={classNames(
                      'w-full default-transition font-bold px-4 py-2.5 text-sm focus:outline-none bg-bkg-4 hover:bg-primary-dark',
                      lockupType.value === type.value
                        ? 'bg-primary-light text-bkg-2'
                        : '',
                      index === 0 && 'rounded-bl-lg rounded-tl-lg',
                      index === lockupTypes.length - 1 &&
                        'rounded-br-lg rounded-tr-lg'
                    )}
                  >
                    {type.value}
                  </Tab>
                ))}
              </Tab.List>
            </Tab.Group>
            <div className="mb-2 text-xs font-bold">
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
          <>
            {hasMoreTokensInWallet && (
              <DoYouWantToDepositMoreComponent></DoYouWantToDepositMoreComponent>
            )}
            <div className="mb-4">
              <div className="text-xs flex mb-2">
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
            <Tab.Group onChange={handleSetLockupPeriod}>
              <Tab.List className="flex mb-4">
                {lockPeriods.map((period, index) => (
                  <Tab
                    key={period.value}
                    className={classNames(
                      'w-full default-transition font-bold px-4 py-2.5 text-sm focus:outline-none bg-bkg-4 hover:bg-primary-dark',
                      lockupPeriod.value === period.value
                        ? 'bg-primary-light text-bkg-2'
                        : '',
                      index === 0 && 'rounded-bl-lg rounded-tl-lg',
                      index === lockPeriods.length - 1 &&
                        'rounded-br-lg rounded-tr-lg'
                    )}
                  >
                    {period.display}
                  </Tab>
                ))}
              </Tab.List>
            </Tab.Group>
          </>
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
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2 className="mb-4">Lock Tokens</h2>
      {getCurrentStep()}
      <div className="flex flex-col py-4">
        {isMainBtnVisible && (
          <Button className="mb-4" onClick={handleNextStep}>
            {currentStep === 0 ? 'Next' : 'Lock Tokens'}
          </Button>
        )}
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
      </div>
    </Modal>
  )
}

export default LockTokensModal
