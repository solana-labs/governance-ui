import Notifications from '../components/Notification'
import TopBar from '../components/TopBar'
import ContributionModal from '../components/ContributionModal'

const Index = () => {
  return (
    <div className={`bg-bkg-1 text-fgd-1 transition-all`}>
      <TopBar />
      <Notifications />
      <div className="grid grid-cols-1 place-items-center">
        <ContributionModal />
      </div>
    </div>
  )
}

export default Index
