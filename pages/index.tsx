import Notifications from '../components/Notification'
import TopBar from '../components/TopBar'

const Index = () => {
  return (
    <div className={`bg-th-bkg-1 text-th-fgd-1 transition-all `}>
      <TopBar />
      <Notifications />
    </div>
  )
}

export default Index
