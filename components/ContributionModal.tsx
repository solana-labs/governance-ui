import { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import tw from 'twin.macro'
import {
  LinkIcon,
  LockClosedIcon,
  LockOpenIcon,
} from '@heroicons/react/outline'
import useWalletStore from '../stores/useWalletStore'
import { getUsdcBalance } from '../utils'
import Input from './Input'
import Button from './Button'
import { ConnectWalletButtonSmall } from './ConnectWalletButton'
import Slider from './Slider'
import Loading from './Loading'
import WalletIcon from './WalletIcon'

const StyledModalWrapper = styled.div`
    height: 414px;
    ${tw`bg-bkg-2 border border-bkg-3 flex flex-col items-center rounded-lg shadow-lg p-7 w-96`}
  }
`

const ContributionModal = () => {
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  const usdcBalance = getUsdcBalance()

  const [contributionAmount, setContributionAmount] = useState(null)
  const [sliderPercentage, setSliderPercentage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [editContribution, setEditContribution] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleConnectDisconnect = () => {
    if (connected) {
      setContributionAmount(null)
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
    setContributionAmount(amount)
    setSliderPercentage((amount / usdcBalance) * 100)
  }

  const onChangeSlider = (percentage) => {
    setContributionAmount((percentage / 100) * usdcBalance)
    setSliderPercentage(percentage)
  }

  const handleMax = () => {
    setContributionAmount(usdcBalance)
    setSliderPercentage(100)
  }

  useEffect(() => {
    setLoading(true)
    if (usdcBalance) {
      setLoading(false)
    }
  }, [usdcBalance])

  useEffect(() => {
    if (submitting) {
      const submitTimer = setTimeout(() => {
        setSubmitted(true)
        setSubmitting(false)
      }, 2000)
      return () => clearTimeout(submitTimer)
    }
  }, [submitting])

  return (
    <StyledModalWrapper>
      <div className="pb-4 text-center">
        {!submitted && !submitting && !editContribution ? (
          <>
            <h2>Plant your seed</h2>
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
        <div className="flex items-center h-full">
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
                      {usdcBalance}
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
                    className="bg-secondary-2-light hover:bg-secondary-2-dark font-normal rounded text-fgd-1 text-xs py-0.5 px-1.5 mr-2"
                    disabled={!connected}
                    onClick={() => handleEditContribution()}
                    secondary
                  >
                    Unlock
                  </Button>
                ) : null}
                <Button
                  className={`${
                    submitted && 'opacity-30'
                  } bg-bkg-4 font-normal rounded text-fgd-3 text-xs py-0.5 px-1.5`}
                  disabled={!connected || submitted}
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
                disabled={!connected || submitted || loading}
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
              <div className="pb-20">
                <Slider
                  disabled={submitted || !connected || loading}
                  value={sliderPercentage}
                  onChange={(v) => onChangeSlider(v)}
                  step={1}
                />
              </div>
              <Button
                onClick={() => handleSetContribution()}
                className="w-full py-2.5"
                disabled={!connected || submitted}
              >
                <div className={`flex items-center justify-center`}>
                  Set Contribution
                </div>
              </Button>
            </div>
          </div>
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
        </>
      )}
    </StyledModalWrapper>
  )
}

export default ContributionModal
