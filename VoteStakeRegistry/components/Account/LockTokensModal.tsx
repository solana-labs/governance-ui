import Button, { SecondaryButton } from '@components/Button'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import Modal from '@components/Modal'
import { Tab } from '@headlessui/react'
import { QuestionMarkCircleIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'
import { BN } from '@project-serum/anchor'
import { RpcContext } from '@solana/spl-governance'
import {
  fmtMintAmount,
  getMintDecimalAmount,
  getMintMinAmountAsDecimal,
  getMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { voteRegistryLockDeposit } from 'VoteStakeRegistry/actions/voteRegistryLockDeposit'
import { DepositWithMintAccount } from 'VoteStakeRegistry/sdk/accounts'
import {
  yearsToDays,
  yearsToSecs,
  daysToYear,
  daysToMonths,
  getMinDurationInDays,
} from 'VoteStakeRegistry/tools/dateTools'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import { voteRegistryStartUnlock } from 'VoteStakeRegistry/actions/voteRegistryStartUnlock'
import {
  LockupKind,
  lockupTypes,
  MONTHLY,
  CONSTANT,
  Period,
  VestingPeriod,
  vestingPeriods,
} from 'VoteStakeRegistry/tools/types'
import BigNumber from 'bignumber.js'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'
import { calcMintMultiplier } from 'VoteStakeRegistry/tools/deposits'

const YES = 'YES'
const NO = 'NO'

const LockTokensModal = ({
  onClose,
  isOpen,
  depositToUnlock,
}: {
  onClose: () => void
  isOpen: boolean
  depositToUnlock?: DepositWithMintAccount | null
}) => {
  const { getOwnedDeposits } = useDepositStore()
  const { mint, realm, realmTokenAccount, realmInfo, tokenRecords } = useRealm()
  const client = useVoteStakeRegistryClientStore((s) => s.state.client)
  const communityMintRegistrar = useVoteStakeRegistryClientStore(
    (s) => s.state.communityMintRegistrar
  )
  const connection = useWalletStore((s) => s.connection.current)
  const endpoint = useWalletStore((s) => s.connection.endpoint)
  const wallet = useWalletStore((s) => s.current)
  const deposits = useDepositStore((s) => s.state.deposits)
  const { fetchRealm, fetchWalletTokenAccounts } = useWalletStore(
    (s) => s.actions
  )

  const lockupPeriods: Period[] = [
    {
      value: yearsToDays(1),
      display: '1y',
      multiplier: calcMintMultiplier(
        yearsToSecs(1),
        communityMintRegistrar,
        realm
      ),
    },
    {
      value: yearsToDays(2),
      display: '2y',
      multiplier: calcMintMultiplier(
        yearsToSecs(2),
        communityMintRegistrar,
        realm
      ),
    },
    {
      value: yearsToDays(3),
      display: '3y',
      multiplier: calcMintMultiplier(
        yearsToSecs(3),
        communityMintRegistrar,
        realm
      ),
    },
    {
      value: yearsToDays(4),
      display: '4y',
      multiplier: calcMintMultiplier(
        yearsToSecs(4),
        communityMintRegistrar,
        realm
      ),
    },
    {
      value: yearsToDays(5),
      display: '5y',
      multiplier: calcMintMultiplier(
        yearsToSecs(5),
        communityMintRegistrar,
        realm
      ),
    },
  ].filter((x) =>
    depositToUnlock ? getMinDurationInDays(depositToUnlock) <= x.value : true
  )

  const maxMultiplier = lockupPeriods
    .map((x) => x.multiplier)
    .reduce((prev, current) => {
      return prev > current ? prev : current
    })
  const depositRecord = deposits.find(
    (x) =>
      x.mint.publicKey.toBase58() === realm!.account.communityMint.toBase58() &&
      x.lockup.kind.none
  )
  const [lockupPeriod, setLockupPeriod] = useState<Period>(lockupPeriods[0])
  const [amount, setAmount] = useState<number | undefined>()
  const [lockMoreThenDeposited, setLockMoreThenDeposited] = useState<string>('')
  const [lockupType, setLockupType] = useState<LockupKind>(lockupTypes[0])
  const [vestingPeriod, setVestingPeriod] = useState<VestingPeriod>(
    vestingPeriods[0]
  )
  const [currentStep, setCurrentStep] = useState(0)

  const depositedTokens = depositRecord
    ? fmtMintAmount(mint, depositRecord.amountDepositedNative)
    : '0'
  const mintMinAmount = mint ? getMintMinAmountAsDecimal(mint) : 1
  const hasMoreTokensInWallet = !realmTokenAccount?.account.amount.isZero()
  const wantToLockMoreThenDeposited = lockMoreThenDeposited === 'YES'
  const currentPrecision = precision(mintMinAmount)
  const maxAmountToUnlock = depositToUnlock
    ? getMintDecimalAmount(
        depositToUnlock.mint.account,
        depositToUnlock?.amountInitiallyLockedNative
      )
    : 0
  const maxAmountToLock =
    depositRecord && mint
      ? wantToLockMoreThenDeposited
        ? getMintDecimalAmount(
            mint,
            depositRecord?.amountDepositedNative.add(
              new BN(realmTokenAccount!.account.amount)
            )
          )
        : getMintDecimalAmount(mint, depositRecord?.amountDepositedNative)
      : 0
  const maxAmount = depositToUnlock ? maxAmountToUnlock : maxAmountToLock
  const maxAmountToLockFmt =
    depositRecord && mint
      ? wantToLockMoreThenDeposited
        ? fmtMintAmount(
            mint,
            depositRecord?.amountDepositedNative.add(
              new BN(realmTokenAccount!.account.amount)
            )
          )
        : fmtMintAmount(mint, depositRecord?.amountDepositedNative)
      : 0
  const maxAmountToUnlockFmt = depositToUnlock
    ? fmtMintAmount(
        depositToUnlock.mint.account,
        depositToUnlock?.amountInitiallyLockedNative
      )
    : 0
  const maxAmountFmt = depositToUnlock
    ? maxAmountToUnlockFmt
    : maxAmountToLockFmt

  const tokenName = mint
    ? getMintMetadata(realm?.account.communityMint)?.name || 'tokens'
    : ''
  const currentPercentOfMaxMultiplier =
    (100 * lockupPeriod.multiplier) / maxMultiplier

  const handleSetVestingPeriod = (idx: number) => {
    setVestingPeriod(vestingPeriods[idx])
  }
  const handleSetLockupPeriod = (idx: number) => {
    setLockupPeriod(lockupPeriods[idx])
  }
  const handleSetLockupType = (idx: number) => {
    setLockupType(lockupTypes[idx])
  }
  const handleNextStep = () => {
    setCurrentStep(currentStep + 1)
  }
  const goToStep = (val: number) => {
    setCurrentStep(val)
  }
  const validateAmountOnBlur = () => {
    const val = parseFloat(
      Math.max(
        Number(mintMinAmount),
        Math.min(Number(maxAmount), Number(amount))
      ).toFixed(currentPrecision)
    )
    setAmount(val)
  }
  const handleSaveLock = async () => {
    const rpcContext = new RpcContext(
      realm!.owner,
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection,
      endpoint
    )
    const totalAmountToLock = getMintNaturalAmountFromDecimalAsBN(
      amount!,
      mint!.decimals
    )
    const totalAmountInDeposit =
      depositRecord?.amountDepositedNative || new BN(0)
    const whatWillBeLeftInsideDeposit = totalAmountInDeposit.sub(
      totalAmountToLock
    )
    const amountFromDeposit = whatWillBeLeftInsideDeposit.isNeg()
      ? totalAmountInDeposit
      : totalAmountToLock
    await voteRegistryLockDeposit({
      rpcContext,
      mintPk: realm!.account.communityMint!,
      communityMintPk: realm!.account.communityMint!,
      realmPk: realm!.pubkey!,
      programId: realm!.owner,
      amountFromVoteRegistryDeposit: amountFromDeposit,
      totalTransferAmount: totalAmountToLock,
      lockUpPeriodInDays: lockupPeriod.value,
      lockupKind: lockupType.value,
      sourceDepositIdx: depositRecord!.index,
      sourceTokenAccount: realmTokenAccount!.publicKey,
      tokenOwnerRecordPk:
        tokenRecords[wallet!.publicKey!.toBase58()]?.pubkey || null,
      client: client,
    })
    await getOwnedDeposits({
      realmPk: realm!.pubkey,
      communityMintPk: realm!.account.communityMint,
      walletPk: wallet!.publicKey!,
      client: client!,
      connection,
    })
    fetchWalletTokenAccounts()
    fetchRealm(realmInfo!.programId, realmInfo!.realmId)
    onClose()
  }

  const handleSaveUnlock = async () => {
    if (!depositToUnlock) {
      throw 'No deposit to unlock selected'
    }
    const rpcContext = new RpcContext(
      realm!.owner,
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection,
      endpoint
    )
    const totalAmountToUnlock = getMintNaturalAmountFromDecimalAsBN(
      amount!,
      depositToUnlock!.mint.account.decimals
    )

    const totalAmountInDeposit = depositToUnlock.currentlyLocked

    const whatWillBeLeftInsideDeposit = totalAmountInDeposit.sub(
      totalAmountToUnlock
    )

    await voteRegistryStartUnlock({
      rpcContext,
      mintPk: depositToUnlock!.mint.publicKey,
      realmPk: realm!.pubkey!,
      programId: realm!.owner,
      transferAmount: totalAmountToUnlock,
      amountAfterOperation: whatWillBeLeftInsideDeposit,
      lockUpPeriodInDays: lockupPeriod.value,
      sourceDepositIdx: depositToUnlock!.index,
      communityMintPk: realm!.account.communityMint,
      tokenOwnerRecordPk:
        tokenRecords[wallet!.publicKey!.toBase58()]?.pubkey || null,
      client: client,
    })
    await getOwnedDeposits({
      realmPk: realm!.pubkey,
      communityMintPk: realm!.account.communityMint,
      walletPk: wallet!.publicKey!,
      client: client!,
      connection,
    })

    onClose()
  }
  const baseTabClasses =
    'w-full default-transition font-bold px-4 py-2.5 text-sm focus:outline-none bg-bkg-4 hover:bg-primary-dark'
  const tabClasses = ({ val, index, currentValue, lastItemIdx }) => {
    return classNames(
      baseTabClasses,
      val === currentValue ? 'bg-primary-light text-bkg-2' : '',
      index === 0 ? 'rounded-l-lg' : '',
      index === lastItemIdx + 1 ? 'rounded-r-lg' : ''
    )
  }
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
            className={`${baseTabClasses} rounded-l-lg ${
              lockMoreThenDeposited === YES && 'bg-primary-light text-bkg-2'
            }`}
          >
            Yes
          </Tab>
          <Tab
            className={`${baseTabClasses} rounded-r-lg ${
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
                    {type.displayName}
                  </Tab>
                ))}
              </Tab.List>
            </Tab.Group>
            <div className={`${labelClasses} font-bold`}>
              {lockupType.displayName} Lockup
            </div>
            {lockupType.info.map((text, index) => (
              <div key={index} className="text-xs mb-2">
                {text}
              </div>
            ))}
          </>
        )
      case 1:
        return (
          <DoYouWantToDepositMoreComponent></DoYouWantToDepositMoreComponent>
        )
      case 2:
        return (
          <div className="mb-6">
            {lockupType.value == CONSTANT && (
              <div className="text-xs mb-6">
                To initiate the unlock process you need to convert all, or part
                of your constant lockup to a cliff lockup with a duration
                greater than or equal to the constant lockup duration.
              </div>
            )}
            {hasMoreTokensInWallet && !depositToUnlock && (
              <DoYouWantToDepositMoreComponent></DoYouWantToDepositMoreComponent>
            )}
            <div className="mb-6">
              <div className={`${labelClasses} flex`}>
                Amount to lock{' '}
                <div
                  className="ml-auto underline cursor-pointer"
                  onClick={() => setAmount(Number(maxAmount))}
                >
                  Max: {maxAmountFmt}
                </div>
              </div>
              <Input
                max={maxAmount}
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
            {lockupType.value === MONTHLY && (
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
                {amount && (
                  <div className="text-xs">
                    {(amount / daysToMonths(lockupPeriod.value)).toFixed(2)}{' '}
                    {vestingPeriod.info}
                  </div>
                )}
              </div>
            )}
            {/* TODO tooltip */}
            <div className={`${labelClasses} flex`}>
              Initial Vote Weight Multiplier
              <QuestionMarkCircleIcon className="w-4 h-4 ml-1"></QuestionMarkCircleIcon>
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
            {depositToUnlock ? (
              <h2>
                This will convert {new BigNumber(amount!).toFormat()}{' '}
                {tokenName} into a cliff type lockup that unlocks in{' '}
                {daysToYear(lockupPeriod.value)} years.
              </h2>
            ) : (
              <h2>
                Lock {new BigNumber(amount!).toFormat()} {tokenName} for{' '}
                {lockupType.value == CONSTANT && ' at least '}
                {daysToYear(lockupPeriod.value)}{' '}
                {lockupPeriod.value > yearsToDays(1) ? 'years' : 'year'}?
              </h2>
            )}
            {!depositToUnlock && (
              <div className="text-xs">Locking tokens can’t be undone.</div>
            )}
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
  useEffect(() => {
    if (amount) {
      validateAmountOnBlur()
    }
  }, [lockMoreThenDeposited])
  useEffect(() => {
    setLockupPeriod(lockupPeriods[0])
  }, [communityMintRegistrar])
  useEffect(() => {
    if (depositToUnlock) {
      goToStep(2)
    }
  }, [depositToUnlock])
  const isMainBtnVisible = !hasMoreTokensInWallet || currentStep !== 1
  const isTitleVisible = currentStep !== 3
  const getCurrentBtnForStep = () => {
    switch (currentStep) {
      case 2:
        return (
          <Button className="mb-4" onClick={handleNextStep} disabled={!amount}>
            {depositToUnlock ? 'Start unlock' : 'Lock Tokens'}
          </Button>
        )
      case 3:
        return (
          <Button
            className="mb-4"
            onClick={depositToUnlock ? handleSaveUnlock : handleSaveLock}
          >
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
        {isTitleVisible && (depositToUnlock ? 'Start unlock' : 'Lock Tokens')}
        {currentStep === 2 && !depositToUnlock && (
          <div className="ml-auto">
            <Select
              className="text-xs w-24"
              onChange={handleSetLockupType}
              value={lockupType.displayName}
            >
              {lockupTypes.map((x, idx) => (
                <Select.Option key={x.value} value={idx}>
                  <div>{x.displayName}</div>
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
