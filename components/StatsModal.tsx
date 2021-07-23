import { useEffect, useState } from 'react'
import {
  ExclamationCircleIcon,
  LockClosedIcon,
  LockOpenIcon,
  RefreshIcon,
} from '@heroicons/react/outline'
import useWalletStore from '../stores/useWalletStore'
import Input from './Input'
import Button from './Button'
import ConnectWalletButton from './ConnectWalletButton'
import PoolCountdown from './PoolCountdown'
import Slider from './Slider'
import Loading from './Loading'
import WalletIcon from './WalletIcon'
import useLargestAccounts from '../hooks/useLargestAccounts'
import useVaults from '../hooks/useVaults'
import usePool from '../hooks/usePool'
import styled from '@emotion/styled'
import 'twin.macro'
import { notify } from '../utils/notifications'

const SmallButton = styled.button``

const StatsModal = () => {
  const actions = useWalletStore((s) => s.actions)
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  const largestAccounts = useLargestAccounts()
  const vaults = useVaults()
  const { endIdo, endDeposits } = usePool()

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
  const [refreshing, setRefreshing] = useState(false)

  const priceFormat = new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 4,
  })

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
    if (endDeposits?.isBefore() && amount > redeemableBalance) {
      setErrorMessage('Deposits ended, contribution can not increase')
      setTimeout(() => setErrorMessage(null), 4000)
    }
  }

  const onChangeSlider = (percentage) => {
    let newContribution = Math.round(percentage * totalBalance) / 100
    if (endDeposits?.isBefore() && newContribution > redeemableBalance) {
      newContribution = redeemableBalance
      setErrorMessage('Deposits ended, contribution can not increase')
      setTimeout(() => setErrorMessage(null), 4000)
    }

    setWalletAmount(totalBalance - newContribution)
    setContributionAmount(newContribution)
  }

  const handleMax = () => {
    if (endDeposits?.isAfter()) {
      setWalletAmount(0)
      setContributionAmount(totalBalance)
    } else {
      setWalletAmount(usdcBalance)
      setContributionAmount(redeemableBalance)
    }

    setMaxButtonTransition(true)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await actions.fetchWalletTokenAccounts()
    } finally {
      setTimeout(() => setRefreshing(false), 1000)
    }
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
        try {
          await actions.submitContribution(contributionAmount)
          setSubmitted(true)
          setSubmitting(false)
        } catch (e) {
          notify({ type: 'error', message: e.message })
          console.error(e.message)
          setSubmitted(false)
          setSubmitting(false)
        }
      }
      handleSubmit()
    }
  }, [submitting])

  const toLateToDeposit =
    endDeposits.isBefore() && endIdo.isAfter() && !largestAccounts.redeemable

  const disableFormInputs =
    submitted || !connected || loading || (connected && toLateToDeposit)

  const dontAddMore =
    endDeposits?.isBefore() && contributionAmount > redeemableBalance
  const disableSubmit = disableFormInputs || walletAmount < 0 || dontAddMore

  return (
    <>
        <div className="flex-1 m-3 bg-gradient-to-br from-secondary-4-dark to-secondary-4-light border border-bkg-3 p-7 rounded-lg shadow-md">
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
                {priceFormat.format(vaults.estimatedPrice)}
              </div>
            </div>
          </div>
          <div className="border-b border-bkg-4 py-4 text-center">
            <p className="text-fgd-3">Total USDC Deposited</p>
            <div className="flex items-center justify-center pt-0.5">
              <div className="font-bold text-fgd-1 text-base">
                {vaults.usdcBalance}
              </div>
            </div>
          </div>
          <div className="border-b border-bkg-4 py-4 text-center">
            <p className="text-fgd-3">Locked MNGO in Pool</p>
            <div className="flex items-center justify-center pt-0.5">
              <img className="h-5 mr-2 w-auto" src="/logo.svg" alt="mango" />
              <div className="font-bold text-fgd-1 text-base">
                {vaults.mangoBalance}
              </div>
            </div>
          </div>
          <div className="border-b border-bkg-4 py-4 text-center">
            <p className="text-fgd-3">Deposits Close</p>
            <PoolCountdown date={endDeposits} className="justify-center pt-1" />
          </div>
          <div className="pt-4 text-center">
            <p className="text-fgd-3">Withdrawals Close</p>
            <PoolCountdown date={endIdo} className="justify-center pt-1" />
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

export default StatsModal
