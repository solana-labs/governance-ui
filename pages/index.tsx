import Notifications from '../components/Notification'
import Balances from '../components/Balances'
import TopBar from '../components/TopBar'
import ContributionModal from '../components/ContributionModal'

const Index = () => {
  return (
    <div
      className={`grid grid-cols-1 bg-th-bkg-1 text-th-fgd-1 transition-all`}
    >
      <TopBar />
      {/* <Balances />
      <Notifications /> */}
      <ContributionModal />
    </div>
  )
}

export default Index
