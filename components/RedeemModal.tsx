import { useEffect, useState } from 'react'
import useWalletStore from '../stores/useWalletStore'
import Button from './Button'
import Input from './Input'
import ConnectWalletButton from './ConnectWalletButton'
import Loading from './Loading'
import useLargestAccounts from '../hooks/useLargestAccounts'
import useVaults from '../hooks/useVaults'
import { calculateSupply } from '../utils/balance'

const RedeemModal = () => {
  const actions = useWalletStore((s) => s.actions)
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const redeemableMint = useWalletStore((s) => s.pool?.redeemableMint)
  const mints = useWalletStore((s) => s.mints)
  const largestAccounts = useLargestAccounts()
  const vaults = useVaults()

  const numberFormat = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  })
  const totalRaised = vaults.usdc?.balance
  const redeemableBalance = largestAccounts.redeemable?.balance || 0
  const redeemableSupply =
    redeemableMint && calculateSupply(mints, redeemableMint)
  const mangoAvailable =
    vaults.mango && redeemableSupply
      ? (redeemableBalance * vaults.mango.balance) / redeemableSupply
      : 0

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
    actions.fetchMints()
  }, [])

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
  const disableSubmit = disableFormInputs || redeemableBalance < 0

  return (
    <>
      <div className="flex flex-col bg-bkg-2 border border-bkg-3 p-7 rounded-lg shadow-lg">
        <div className="pb-4 text-center">
          {!submitting ? (
            <>
              <h2>Redeem your MNGO</h2>
              {/* <p>Welcome to the DAO, let&apos;s build together.</p> */}
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
            <div>
              <span className="text-fgd-4 text-xs">Total raised</span>
              <Input
                className="border-0"
                disabled
                type="text"
                value={numberFormat.format(totalRaised)}
                suffix={
                  <img
                    alt=""
                    width="16"
                    height="16"
                    src="/icons/usdc.svg"
                    className="inline"
                  />
                }
              />
            </div>
            <div
              className={`${
                connected ? 'opacity-100' : 'opacity-30'
              } pb-6 transiton-all duration-1000 w-full `}
            >
              <div className="py-1">
                <span className="text-fgd-4 text-xs">Your contribution</span>
                <Input
                  className="border-0"
                  disabled
                  type="text"
                  value={numberFormat.format(redeemableBalance)}
                  suffix={
                    <img
                      alt=""
                      width="16"
                      height="16"
                      src="/icons/usdc.svg"
                      className="inline"
                    />
                  }
                />
              </div>
              <div className="py-1">
                <span className="text-fgd-4 text-xs">Redeemable amount</span>
                <Input
                  className="border-0"
                  disabled
                  type="text"
                  value={numberFormat.format(mangoAvailable)}
                  suffix={
                    <img
                      alt=""
                      width="16"
                      height="16"
                      src="/logo.svg"
                      className="inline"
                    />
                  }
                />
              </div>
              <div className="py-6">
                <Button
                  onClick={() => handleRedeem()}
                  className="w-full py-2.5"
                  disabled={disableSubmit}
                >
                  <div className={`flex items-center justify-center`}>
                    Redeem {redeemableBalance} MNGO
                  </div>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <ConnectWalletButton onClick={handleConnectDisconnect} />
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default RedeemModal
