import Notifications from '../components/Notification'
import TopBar from '../components/TopBar'
import ContributionModal from '../components/ContributionModal'
import PoolInfoCards from '../components/PoolInfoCards'

const Index = () => {
  return (
    <div className={`bg-bkg-1 text-fgd-1 transition-all`}>
      <TopBar />
      <Notifications />

      <PoolInfoCards />
      <div className="flex justify-center">
        <div className="max-w-screen-md grid grid-cols-12 gap-4 w-full">
          <ContributionModal />
        </div>
      </div>
    </div>
  )
}

export default Index
