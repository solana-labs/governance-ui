import Notifications from '../components/Notification'
import ConnectWalletButton from '../components/ConnectWalletButton'

const Index = () => {
  return (
    <div className={`bg-th-bkg-1 text-th-fgd-1 transition-all `}>
      <ConnectWalletButton />
      <Notifications />
    </div>
  )
}

export default Index
