import { useEffect, useState } from 'react'
import useWalletStore from '../stores/useWalletStore'
import Input from './Input'
import Button from './Button'
import Loading from './Loading'
import WalletIcon from './WalletIcon'

const ContributionModal = () => {
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)

  const [contributionAmount, setContributionAmount] = useState(null)
  const [submitting, setSubmitting] = useState(false)

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
    const submitTimer = setTimeout(() => {
      setSubmitting(false)
    }, 1000)
    return () => clearTimeout(submitTimer)
  }, [submitting])

  return (
    <div className="bg-th-bkg-3 rounded-lg p-4 w-2/4 max-w-md">
      <h2>Plant your seed</h2>
      <p>Something...</p>
      <Input
        disabled={!connected}
        type="number"
        step={100}
        onChange={(e) => setContributionAmount(e.target.value)}
        value={contributionAmount}
        className=""
      />
      <Button onClick={() => handleSetContribution()} className="w-full">
        <div className={`flex items-center justify-center text-lg`}>
          {submitting && <Loading />}
          Set Contribution
        </div>
      </Button>
      {connected ? (
        <Button onClick={() => handleConnectDisconnect()}>Disconnect</Button>
      ) : (
        <Button onClick={() => handleConnectDisconnect()}>
          Connect Wallet
        </Button>
      )}
    </div>
  )
}

export default ContributionModal
