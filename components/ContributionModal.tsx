import { useEffect, useState } from 'react'
import {
  ExclamationCircleIcon,
  LockClosedIcon,
  LockOpenIcon,
} from '@heroicons/react/outline'
import { LinkIcon } from '@heroicons/react/solid'
import useWalletStore from '../stores/useWalletStore'
import Input from './Input'
import Button from './Button'
import { ConnectWalletButtonSmall } from './ConnectWalletButton'
import Slider from './Slider'
import Loading from './Loading'
import WalletIcon from './WalletIcon'
import useLargestAccounts from '../hooks/useLargestAccounts'
import useVaults from '../hooks/useVaults'
import moment from 'moment'
import Countdown from 'react-countdown'

const ContributionModal = () => {
  const actions = useWalletStore((s) => s.actions)
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  const largestAccounts = useLargestAccounts()
  const vaults = useVaults()

  const pool = useWalletStore((s) => s.pool)
  // const startIdo = pool ? moment.unix(pool.startIdoTs.toNumber()) : undefined
  const endIdo = pool ? moment.unix(pool.endIdoTs.toNumber()) : undefined
  const endDeposits = pool
    ? moment.unix(pool.endDepositsTs.toNumber())
    : undefined

  const usdcBalance = largestAccounts.usdc?.balance || 0
  const redeemableBalance = largestAccounts.redeemable?.balance || 0
  const totalBalance = usdcBalance + redeemableBalance
  // const mangoRedeemable = vaults.usdc
  //   ? (redeemableBalance * vaults.mango.balance) / vaults.usdc.balance
  //   : 0

  const [walletAmount, setWalletAmount] = useState(0)
  const [contributionAmount, setContributionAmount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [editContribution, setEditContribution] = useState(false)
  const [loading, setLoading] = useState(true)
  const [maxButtonTransition, setMaxButtonTransition] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    console.log('refresh modal on balance change')
    setWalletAmount(usdcBalance)
    setContributionAmount(redeemableBalance)
    if (redeemableBalance > 0) {
      setSubmitted(true)
    }
  }, [totalBalance])

  const handleConnectDisconnect = () => {
    if (connected) {
      setSubmitted(false)
      setEditContribution(false)
      wallet.disconnect()
    } else {
      wallet.connect()
    }
  }

  const handleSetContribution = () => {
    setSubmitting(true)
    setEditContribution(false)
  }

  const handleEditContribution = () => {
    setEditContribution(true)
    setSubmitted(false)
  }

  const onChangeAmountInput = (amount) => {
    setWalletAmount(totalBalance - amount)
    setContributionAmount(amount)
    if (endDeposits.isBefore() && amount > redeemableBalance) {
      setErrorMessage('Deposits ended, contribution can not increase')
      setTimeout(() => setErrorMessage(null), 4000)
    }
  }

  const onChangeSlider = (percentage) => {
    let newContribution = Math.round(percentage * totalBalance) / 100
    if (endDeposits.isBefore() && newContribution > redeemableBalance) {
      newContribution = redeemableBalance
      setErrorMessage('Deposits ended, contribution can not increase')
      setTimeout(() => setErrorMessage(null), 4000)
    }

    setWalletAmount(totalBalance - newContribution)
    setContributionAmount(newContribution)
  }

  const handleMax = () => {
    if (endDeposits.isAfter()) {
      setWalletAmount(0)
      setContributionAmount(totalBalance)
    } else {
      setWalletAmount(usdcBalance)
      setContributionAmount(redeemableBalance)
    }

    setMaxButtonTransition(true)
  }

  useEffect(() => {
    if (maxButtonTransition) {
      setMaxButtonTransition(false)
    }
  }, [maxButtonTransition])

  useEffect(() => {
    setLoading(true)
    if (largestAccounts.usdc) {
      setLoading(false)
    }
  }, [largestAccounts])

  useEffect(() => {
    if (submitting) {
      const handleSubmit = async () => {
        await actions.submitContribution(contributionAmount)
        setSubmitted(true)
        setSubmitting(false)
      }
      handleSubmit()
    }
  }, [submitting])

  const disableFormInputs = submitted || !connected || loading

  const dontAddMore =
    endDeposits.isBefore() && contributionAmount > redeemableBalance
  const disableSubmit = disableFormInputs || walletAmount < 0 || dontAddMore

  const renderCountdown = ({ hours, minutes, seconds, completed }) => {
    const now = new Date().getTime() / 1000
    const message =
      now > pool.endDepositsTs.toNumber() && now < pool.endIdoTs.toNumber()
        ? 'Deposits are closed'
        : 'The IDO has ended'
    if (completed) {
      return <p className="text-secondary-2-light">{message}</p>
    } else {
      return (
        <div className="font-bold pt-2 text-fgd-1 text-base">
          <span className="bg-bkg-1 border border-bkg-4 mx-0.5 px-1.5 py-1 rounded">
            {hours < 10 ? `0${hours}` : hours}
          </span>
          :
          <span className="bg-bkg-1 border border-bkg-4 mx-0.5 px-1.5 py-1 rounded">
            {minutes < 10 ? `0${minutes}` : minutes}
          </span>
          :
          <span className="bg-bkg-1 border border-bkg-4 mx-0.5 px-1.5 py-1 rounded">
            {seconds < 10 ? `0${seconds}` : seconds}
          </span>
        </div>
      )
    }
  }

  return (
    <>
      <div className="bg-bkg-2 border border-bkg-3 col-span-7 p-7 rounded-lg shadow-lg">
        <div className="pb-4 text-center">
          {!submitted && !submitting && !editContribution ? (
            <>
              <h2>Plant Your Seed</h2>
              <p>This is the start of something big.</p>
            </>
          ) : null}

          {!submitted && submitting ? (
            <>
              <h2>Approve the transaction</h2>
              <p>Almost there...</p>
            </>
          ) : null}

          {submitted && !submitting ? (
            <>
              <h2>Your contribution amount</h2>
              <p>A new seed planted...</p>
            </>
          ) : null}

          {editContribution && !submitting ? (
            <>
              <h2>Funds unlocked</h2>
              <p>Increase or reduce your contribution...</p>
            </>
          ) : null}
        </div>
        {submitting ? (
          <div className="flex h-64 items-center justify-center">
            <Loading className="h-6 w-6 mb-3 text-primary-light" />
          </div>
        ) : (
          <>
            <div
              className={`${
                connected ? 'opacity-100' : 'opacity-30'
              } pb-6 transiton-all duration-1000 w-full`}
            >
              <div className="flex justify-between pb-2">
                <div className="flex items-center text-xs text-fgd-4">
                  <WalletIcon className="w-4 h-4 mr-1 text-fgd-3 fill-current" />
                  {connected ? (
                    loading ? (
                      <div className="bg-bkg-4 rounded w-10 h-4 animate-pulse" />
                    ) : (
                      <span className="font-display text-fgd-1 ml-1">
                        {walletAmount}
                      </span>
                    )
                  ) : (
                    '----'
                  )}
                  <img
                    alt=""
                    width="16"
                    height="16"
                    src="/icons/usdc.svg"
                    className={`ml-1`}
                  />
                </div>
                <div className="flex">
                  {submitted ? (
                    <Button
                      className="ring-1 ring-secondary-1-light ring-inset hover:ring-secondary-1-dark hover:bg-transparent hover:text-secondary-1-dark font-normal rounded text-secondary-1-light text-xs py-0.5 px-1.5 mr-2"
                      disabled={!connected}
                      onClick={() => handleEditContribution()}
                      secondary
                    >
                      Unlock
                    </Button>
                  ) : null}
                  <Button
                    className={`${
                      disableFormInputs && 'opacity-30'
                    } bg-bkg-4 font-normal rounded text-fgd-3 text-xs py-0.5 px-1.5`}
                    disabled={disableFormInputs}
                    onClick={() => handleMax()}
                    secondary
                  >
                    Max
                  </Button>
                </div>
              </div>
              <div className="flex items-center pb-4 relative">
                {submitted ? (
                  <LockClosedIcon className="absolute text-secondary-2-light h-4 w-4 mb-0.5 left-2 z-10" />
                ) : null}
                {editContribution ? (
                  <LockOpenIcon className="absolute text-secondary-1-light h-4 w-4 mb-0.5 left-2 z-10" />
                ) : null}
                <Input
                  className={(submitted || editContribution) && 'pl-7'}
                  disabled={disableFormInputs}
                  type="text"
                  onChange={(e) => onChangeAmountInput(e.target.value)}
                  value={loading ? '' : contributionAmount}
                  suffix="USDC"
                />
              </div>
              <div
                className={`${
                  !submitted ? 'opacity-100' : 'opacity-30'
                } transiton-all duration-1000`}
              >
                <div className="pb-12">
                  <Slider
                    disabled={disableFormInputs}
                    value={(100 * contributionAmount) / totalBalance}
                    onChange={(v) => onChangeSlider(v)}
                    step={1}
                    maxButtonTransition={maxButtonTransition}
                  />
                </div>
                <div className="h-12 pb-4">
                  {errorMessage && (
                    <div className="flex items-center pt-1.5 text-secondary-2-light">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1.5" />
                      {errorMessage}
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleSetContribution()}
                  className="w-full py-2.5"
                  disabled={disableSubmit}
                >
                  <div className={`flex items-center justify-center`}>
                    {dontAddMore
                      ? 'Sorry you can’t add anymore 🥲'
                      : 'Set Contribution'}
                  </div>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              {connected ? (
                <Button
                  className="rounded-full bg-bkg-4 text-fgd-3 font-normal"
                  onClick={() => handleConnectDisconnect()}
                  secondary
                >
                  <div className="flex items-center text-sm">
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Disconnect
                  </div>
                </Button>
              ) : (
                <ConnectWalletButtonSmall onClick={handleConnectDisconnect}>
                  <div className="flex items-center justify-center text-sm">
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Connect Wallet
                  </div>
                </ConnectWalletButtonSmall>
              )}
            </div>
          </>
        )}
      </div>
      <div className="bg-gradient-to-br from-secondary-4-dark to-secondary-4-light border border-bkg-3 col-span-5 p-7 rounded-lg shadow-lg">
        <div className="border-b border-bkg-4 pb-4 text-center">
          <p className="text-fgd-3">Estimated Token Price</p>
          <div className="flex items-center justify-center pt-0.5">
            <img
              alt=""
              width="20"
              height="20"
              src="/icons/usdc.svg"
              className={`mr-2`}
            />
            <div className="font-bold text-fgd-1 text-xl">
              {vaults.usdc && vaults.mango
                ? `$${vaults.usdc.balance / vaults.mango.balance}`
                : 'N/A'}
            </div>
          </div>
        </div>
        <div className="border-b border-bkg-4 py-4 text-center">
          <p className="text-fgd-3">Total USDC Deposited</p>
          <div className="flex items-center justify-center pt-0.5">
            <div className="font-bold text-fgd-1 text-base">
              {`$${vaults.usdc?.balance.toLocaleString()}` || 'N/A'}
            </div>
          </div>
        </div>
        <div className="border-b border-bkg-4 py-4 text-center">
          <p className="text-fgd-3">Locked MNGO in Pool</p>
          <div className="flex items-center justify-center pt-0.5">
            <img className="h-5 mr-2 w-auto" src="/logo.svg" alt="mango" />
            <div className="font-bold text-fgd-1 text-base">
              {vaults.mango?.balance.toLocaleString() || 'N/A'}
            </div>
          </div>
        </div>
        <div className="border-b border-bkg-4 py-4 text-center">
          <p className="text-fgd-3">Deposits Close</p>
          {pool ? (
            <Countdown
              date={endDeposits?.format()}
              renderer={renderCountdown}
            />
          ) : null}
        </div>
        <div className="pt-4 text-center">
          <p className="text-fgd-3">Withdrawals Close</p>
          {pool ? (
            <Countdown date={endIdo?.format()} renderer={renderCountdown} />
          ) : null}
        </div>
        {/* <p>
          Start: {startIdo?.fromNow()} ({startIdo?.format()})
        </p>
        <p>
          End Deposits: {endDeposits?.fromNow()} ({endDeposits?.format()})
        </p>
        <p>
          End Withdraws: {endIdo?.fromNow()} ({endIdo?.format()})
        </p>
        <p>Current USDC in Pool: {vaults.usdc?.balance || 'N/A'}</p>
        <p>Locked MNGO in Pool: {vaults.mango?.balance || 'N/A'}</p> */}
      </div>
    </>
  )
}

export default ContributionModal
