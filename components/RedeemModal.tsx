import { useEffect, useState } from 'react'
import { LinkIcon } from '@heroicons/react/solid'
import useWalletStore from '../stores/useWalletStore'
import Button from './Button'
import { ConnectWalletButtonSmall } from './ConnectWalletButton'
import Loading from './Loading'
import useLargestAccounts from '../hooks/useLargestAccounts'
import useVaults from '../hooks/useVaults'

const RedeemModal = () => {
  const actions = useWalletStore((s) => s.actions)
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  const largestAccounts = useLargestAccounts()
  const vaults = useVaults()

  const redeemableBalance = largestAccounts.redeemable?.balance || 0
  const mangoAvailable = vaults.usdc
    ? (redeemableBalance * vaults.mango.balance) / vaults.usdc.balance
    : 0

  console.log('balance', redeemableBalance, mangoAvailable)

  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleConnectDisconnect = () => {
    if (connected) {
      wallet.disconnect()
    } else {
      wallet.connect()
    }
  }

  const handleRedeem = () => {
    setSubmitting(true)
  }

  useEffect(() => {
    setLoading(true)
    if (largestAccounts.redeemable) {
      setLoading(false)
    }
  }, [largestAccounts])

  useEffect(() => {
    if (submitting) {
      const handleSubmit = async () => {
        await actions.redeem()
        setSubmitting(false)
      }
      handleSubmit()
    }
  }, [submitting])

  const disableFormInputs = !connected || loading
  const disableSubmit = disableFormInputs || redeemableBalance <= 0

  return (
    <>
      <div className="bg-bkg-2 border border-bkg-3 col-span-7 p-7 rounded-lg shadow-lg">
        <div className="pb-4 text-center">
          {!submitting ? (
            <>
              <h2>Redeem your MNGO</h2>
              <p>Welcome to the DAO, let&apos;s build together.</p>
            </>
          ) : null}

          {submitting ? (
            <>
              <h2>Approve the transaction</h2>
              <p>Almost there...</p>
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
              <div>
                <Button
                  onClick={() => handleRedeem()}
                  className="w-full py-2.5"
                  disabled={disableSubmit}
                >
                  <div className={`flex items-center justify-center`}>
                    Redeem 🥭
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
    </>
  )
}

export default RedeemModal
