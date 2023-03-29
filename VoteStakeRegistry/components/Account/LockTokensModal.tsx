/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import Button, { LinkButton, SecondaryButton } from '@components/Button'
import Input from '@components/inputs/Input'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import Modal from '@components/Modal'
import { QuestionMarkCircleIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'
import { BN } from '@coral-xyz/anchor'
import { RpcContext } from '@solana/spl-governance'
import {
  fmtMintAmount,
  getMintDecimalAmount,
  getMintMinAmountAsDecimal,
  getMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { voteRegistryLockDeposit } from 'VoteStakeRegistry/actions/voteRegistryLockDeposit'
import { DepositWithMintAccount } from 'VoteStakeRegistry/sdk/accounts'
import {
  yearsToDays,
  daysToMonths,
  getMinDurationInDays,
  SECS_PER_DAY,
  getFormattedStringFromDays,
  secsToDays,
  yearsToSecs,
} from '@utils/dateTools'
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
  DAILY,
} from 'VoteStakeRegistry/tools/types'
import BigNumber from 'bignumber.js'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { calcMintMultiplier } from 'VoteStakeRegistry/tools/deposits'
import ButtonGroup from '@components/ButtonGroup'
import InlineNotification from '@components/InlineNotification'
import Tooltip from '@components/Tooltip'
import { notify } from '@utils/notifications'
import useWalletGay from '@hooks/useWallet'

const YES = 'Yes'
const NO = 'No'

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
  const client = useVotePluginsClientStore((s) => s.state.vsrClient)
  const voteStakeRegistryRegistrar = useVotePluginsClientStore(
    (s) => s.state.voteStakeRegistryRegistrar
  )
  const connection = useWalletStore((s) => s.connection.current)
  const endpoint = useWalletStore((s) => s.connection.endpoint)
  const wallet = useWalletGay()
  const deposits = useDepositStore((s) => s.state.deposits)
  const { fetchRealm, fetchWalletTokenAccounts } = useWalletStore(
    (s) => s.actions
  )
  const fiveYearsSecs = yearsToSecs(5)
  const maxLockupSecs =
    (realm &&
      voteStakeRegistryRegistrar?.votingMints
        .find((x) => x.mint.equals(realm.account.communityMint))
        ?.lockupSaturationSecs.toNumber()) ||
    fiveYearsSecs

  const lockupPeriods: Period[] = [
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
    {
      defaultValue: 1,
      display: 'Custom',
    },
  ]
    .filter((x) =>
      depositToUnlock
        ? getMinDurationInDays(
            depositToUnlock.lockup.startTs,
            depositToUnlock.lockup.endTs
          ) <= x.defaultValue || x.display === 'Custom'
        : true
    )
    .filter((x) => x.defaultValue <= secsToDays(maxLockupSecs))

  const maxNonCustomDaysLockup = lockupPeriods
    .map((x) => x.defaultValue)
    .reduce((prev, current) => {
      return prev > current ? prev : current
    })
  const maxMultiplier = calcMintMultiplier(
    maxNonCustomDaysLockup * SECS_PER_DAY,
    voteStakeRegistryRegistrar,
    realm
  )

  const depositRecord = deposits.find(
    (x) =>
      x.mint.publicKey.toBase58() === realm!.account.communityMint.toBase58() &&
      x.lockup.kind.none
  )
  const [lockupPeriodDays, setLockupPeriodDays] = useState<number>(0)
  const allowClawback = false
  const [lockupPeriod, setLockupPeriod] = useState<Period>(lockupPeriods[0])
  const [amount, setAmount] = useState<number | undefined>()
  const [lockMoreThenDeposited, setLockMoreThenDeposited] = useState<string>(
    YES
  )
  const [lockupType, setLockupType] = useState<LockupKind>(lockupTypes[0])
  const [
    vestingPeriod,
    // setVestingPeriod
  ] = useState<VestingPeriod>(vestingPeriods[0])
  const [currentStep, setCurrentStep] = useState(0)
  const [showLockupTypeInfo, setShowLockupTypeInfo] = useState<boolean>(false)

  const depositedTokens = depositRecord
    ? fmtMintAmount(mint, depositRecord.amountDepositedNative)
    : '0'
  const mintMinAmount = mint ? getMintMinAmountAsDecimal(mint) : 1
  const hasMoreTokensInWallet = !realmTokenAccount?.account.amount.isZero()
  const wantToLockMoreThenDeposited = lockMoreThenDeposited === 'Yes'
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
  const currentMultiplier = calcMintMultiplier(
    lockupPeriodDays * SECS_PER_DAY,
    voteStakeRegistryRegistrar,
    realm
  )
  const currentPercentOfMaxMultiplier =
    (100 * currentMultiplier) / maxMultiplier

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
    if (!amountFromDeposit.isZero() && allowClawback) {
      notify({
        type: 'warn',
        message: `Please withdraw your tokens to the wallet`,
        description: `To lock tokens with clawback option you must first withdraw them to wallet`,
      })
      throw 'To lock tokens with clawback option you must first withdraw them to wallet'
    }
    await voteRegistryLockDeposit({
      rpcContext,
      mintPk: realm!.account.communityMint!,
      communityMintPk: realm!.account.communityMint!,
      realmPk: realm!.pubkey!,
      programId: realm!.owner,
      programVersion: realmInfo?.programVersion!,
      amountFromVoteRegistryDeposit: amountFromDeposit,
      totalTransferAmount: totalAmountToLock,
      lockUpPeriodInDays: lockupPeriodDays,
      lockupKind: lockupType.value,
      sourceDepositIdx: depositRecord!.index,
      sourceTokenAccount: realmTokenAccount!.publicKey,
      allowClawback: allowClawback,
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
      programVersion: realmInfo?.programVersion!,
      transferAmount: totalAmountToUnlock,
      amountAfterOperation: whatWillBeLeftInsideDeposit,
      lockUpPeriodInDays: lockupPeriodDays,
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
  const labelClasses = 'mb-2 text-fgd-2 text-sm'
  const DoYouWantToDepositMoreComponent = () => (
    <div className="pb-4">
      <div className={labelClasses}>
        Lock more than the {depositedTokens} {realmInfo?.symbol} you have
        deposited?
      </div>
      <ButtonGroup
        activeValue={lockMoreThenDeposited}
        className="h-10"
        onChange={(v) => setLockMoreThenDeposited(v)}
        values={[YES, NO]}
      />
    </div>
  )
  const getCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            {!depositToUnlock ? (
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
                    activeValue={lockupType.displayName}
                    className="h-10"
                    onChange={(type) =>
                      setLockupType(
                        //@ts-ignore
                        lockupTypes
                          .filter(
                            (x) => x.value !== MONTHLY && x.value !== DAILY
                          )
                          .find((t) => t.displayName === type)
                      )
                    }
                    values={lockupTypes
                      .filter((x) => x.value !== MONTHLY && x.value !== DAILY)
                      .map((type) => type.displayName)}
                  />
                </div>
              </>
            ) : null}
            <div className="mb-4">
              {depositToUnlock && (
                <div className="mb-4">
                  <InlineNotification
                    desc="To initiate the unlock process you need to convert all, or part of your constant lockup to a cliff lockup with a duration greater than or equal to the constant lockup duration."
                    type="info"
                  />
                </div>
              )}
              {hasMoreTokensInWallet && !depositToUnlock && (
                <DoYouWantToDepositMoreComponent />
              )}
              <div className="mb-4">
                <div className={`${labelClasses} flex justify-between`}>
                  {depositToUnlock ? 'Amount to Unlock' : 'Amount to Lock'}
                  <LinkButton
                    className="text-primary-light"
                    onClick={() => setAmount(Number(maxAmount))}
                  >
                    Max: {maxAmountFmt}
                  </LinkButton>
                </div>
                <Input
                  // @ts-expect-error this probably doesn't work right, maxAmount is a BigNumber
                  max={maxAmount}
                  min={mintMinAmount}
                  value={amount}
                  type="number"
                  onChange={(e) => setAmount(e.target.value as any)}
                  step={mintMinAmount}
                  onBlur={validateAmountOnBlur}
                />
              </div>
              <div className="mb-4">
                <div className={labelClasses}>Duration</div>
                <ButtonGroup
                  activeValue={lockupPeriod.display}
                  className="h-10"
                  onChange={(period) =>
                    setLockupPeriod(
                      //@ts-ignore
                      lockupPeriods.find((p) => p.display === period)
                    )
                  }
                  values={lockupPeriods.map((p) => p.display)}
                />
              </div>
              {lockupPeriod.defaultValue === 1 && (
                <>
                  <div className={`${labelClasses} flex justify-between`}>
                    Number of days
                  </div>
                  <Input
                    className="mb-4"
                    min={1}
                    value={lockupPeriodDays}
                    type="number"
                    onChange={(e) =>
                      setLockupPeriodDays(Number(e.target.value))
                    }
                    step={1}
                  />
                </>
              )}

              {lockupType.value === MONTHLY && (
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <p>Vesting Period</p>
                    <p className="font-bold mb-0 text-fgd-1">Monthly</p>
                  </div>
                  {/* <Tab.Group onChange={handleSetVestingPeriod}>
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
                  </Tab.Group> */}
                  <div className="flex items-center justify-between">
                    <p>Vesting Rate</p>
                    {amount ? (
                      <p className="font-bold mb-0 text-fgd-1">
                        {(amount / daysToMonths(lockupPeriodDays)).toFixed(2)}{' '}
                        {vestingPeriod.info}
                      </p>
                    ) : (
                      <p className="mb-0 text-orange text-xs">
                        Enter an amount to lock
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className={`${labelClasses} flex items-center`}>
                {lockupType.value === CONSTANT
                  ? 'Vote Weight Multiplier'
                  : 'Initial Vote Weight Multiplier'}
                {lockupType.value !== CONSTANT ? (
                  <Tooltip content="The multiplier will decline linearly over time">
                    <QuestionMarkCircleIcon className="cursor-help h-4 ml-1 w-4" />
                  </Tooltip>
                ) : null}
                <span className="font-bold ml-auto text-fgd-1">
                  {currentMultiplier}x
                </span>
              </div>
              <div className="w-full h-2 bg-bkg-1 rounded-lg mb-4">
                <div
                  style={{
                    width: `${
                      currentPercentOfMaxMultiplier > 100
                        ? 100
                        : currentPercentOfMaxMultiplier
                    }%`,
                  }}
                  className="bg-primary-light h-2 rounded-lg"
                ></div>
              </div>
              {/* {!depositToUnlock && (
                <div className="flex text-sm text-fgd-2">
                  <div className="pr-5">
                    Allow dao to clawback -{' '}
                    <small>
                      It will give ability to propose clawback of your locked
                      tokens to any given address If you use constant lockup
                      type with this option turn on only way to retrieve tokens
                      from that deposit will be dao vote
                    </small>
                  </div>
                  <Switch
                    checked={allowClawback}
                    onChange={(checked) => setAllowClawback(checked)}
                  />
                </div>
              )} */}
            </div>
          </>
        )
      case 1:
        return (
          <div className="flex flex-col text-center mb-4">
            {depositToUnlock ? (
              <h2>
                This will convert {new BigNumber(amount!).toFormat()}{' '}
                {tokenName} into a cliff type lockup that unlocks in{' '}
                {getFormattedStringFromDays(lockupPeriodDays, true)}
              </h2>
            ) : (
              <h2>
                Lock {new BigNumber(amount!).toFormat()} {tokenName} for{' '}
                {lockupType.value === CONSTANT && ' at least '}
                {getFormattedStringFromDays(lockupPeriodDays, true)}
              </h2>
            )}
            {!depositToUnlock && (
              <p className="mb-0">Locking tokens can’t be undone.</p>
            )}
          </div>
        )
      default:
        return 'Unknown step'
    }
  }
  useEffect(() => {
    if (amount) {
      validateAmountOnBlur()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [lockMoreThenDeposited])
  useEffect(() => {
    setLockupPeriod(lockupPeriods[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [voteStakeRegistryRegistrar])
  useEffect(() => {
    if (depositToUnlock) {
      goToStep(0)
    }
  }, [depositToUnlock])
  useEffect(() => {
    setLockupPeriodDays(lockupPeriod.defaultValue)
  }, [lockupPeriod.defaultValue])
  // const isMainBtnVisible = !hasMoreTokensInWallet || currentStep !== 0
  const isTitleVisible = currentStep !== 3
  const getCurrentBtnForStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Button
            className="mb-4"
            onClick={handleNextStep}
            disabled={
              !amount ||
              !maxAmount ||
              !lockupPeriodDays ||
              Number(lockupPeriodDays) === 0
            }
          >
            {depositToUnlock ? 'Start unlock' : 'Lock Tokens'}
          </Button>
        )
      case 1:
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
          <Button
            className="mb-4"
            onClick={handleNextStep}
            disabled={!amount || !maxAmount}
          >
            {depositToUnlock ? 'Start unlock' : 'Lock Tokens'}
          </Button>
        )
    }
  }
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      {currentStep !== 1 ? (
        <h2 className="mb-4 flex flex-row items-center">
          {isTitleVisible && (depositToUnlock ? 'Start Unlock' : 'Lock Tokens')}
        </h2>
      ) : null}
      {showLockupTypeInfo ? (
        <>
          {lockupTypes.map((type) => (
            <>
              <h2 className="text-base" key={type.displayName}>
                {type.displayName}
              </h2>
              {type.info.map((info) => (
                <p className="mb-2" key={info}>
                  {info}
                </p>
              ))}
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
          {getCurrentStep()}
          <div className="flex flex-col pt-4">
            {
              // isMainBtnVisible &&
              getCurrentBtnForStep()
            }
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          </div>
        </>
      )}
    </Modal>
  )
}

export default LockTokensModal
