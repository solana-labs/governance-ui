import { useEffect, useState } from 'react'
import { LinkIcon } from '@heroicons/react/solid'
import useWalletStore from '../stores/useWalletStore'
import { getUsdcBalance } from '../utils'
import Input from './Input'
import Button from './Button'
import Slider from './Slider'
import Loading from './Loading'
import WalletIcon from './WalletIcon'

const ContributionModal = () => {
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  const usdcBalance = getUsdcBalance()

  const [contributionAmount, setContributionAmount] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleConnectDisconnect = () => {
    if (connected) {
      wallet.disconnect()
    } else {
      wallet.connect()
    }
  }

  const handleSetContribution = () => {
    setSubmitting(true)
  }

  useEffect(() => {
    setLoading(true)
    if (usdcBalance) {
      setLoading(false)
    }
  }, [usdcBalance])

  useEffect(() => {
    const submitTimer = setTimeout(() => {
      setSubmitting(false)
    }, 1000)
    return () => clearTimeout(submitTimer)
  }, [submitting])

  return (
    <div className="bg-bkg-2 border border-bkg-3 flex flex-col items-center rounded-lg shadow-lg p-7  w-96">
      <div className="pb-4 text-center">
        <h2>Plant your seed</h2>
        <p>This is the start of something big.</p>
      </div>
      <div
        className={`${
          connected ? 'opacity-100' : 'opacity-30'
        } pb-6 transiton-all duration-1000 w-full`}
      >
        <div className="pb-20">
          <div className="flex justify-between pb-2">
            <div className="flex items-center text-xs text-fgd-4">
              <WalletIcon className="w-4 h-4 mr-1 text-secondary-1-dark fill-current" />
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
            <Button
              className="bg-bkg-4 font-normal rounded text-fgd-3 text-xs py-0.5 px-2"
              disabled={!connected}
              onClick={() => setContributionAmount(100)}
              secondary
            >
              Max
            </Button>
          </div>
          <div className="pb-4">
            <Input
              disabled={!connected}
              type="text"
              onChange={(e) => setContributionAmount(e.target.value)}
              value={loading ? '' : usdcBalance * (contributionAmount / 100)}
              suffix="USDC"
            />
          </div>
          <Slider
            value={contributionAmount}
            onChange={(v) => setContributionAmount(v)}
            step={usdcBalance / 100}
          />
        </div>
        <Button
          onClick={() => handleSetContribution()}
          className="w-full py-2.5"
          disabled={!connected}
        >
          <div className={`flex items-center justify-center`}>
            {submitting && <Loading />}
            Set Contribution
          </div>
        </Button>
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
        <div className="relative">
          <Button
            className="rounded-full h-9 w-44 z-20 relative"
            onClick={() => handleConnectDisconnect()}
          >
            <div className="flex items-center justify-center text-sm">
              <LinkIcon className="h-4 w-4 mr-1" />
              Connect Wallet
            </div>
          </Button>
          <div className="absolute animate-ping-small bg-secondary-2-light top-0 rounded-full h-9 w-44 z-10" />
        </div>
      )}
    </div>
  )
}

export default ContributionModal
