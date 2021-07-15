import ContributionPage from './ContributionPage'
import RedeemPage from './RedeemPage'
import Notifications from '../components/Notification'
import TopBar from '../components/TopBar'

import usePool from '../hooks/usePool'

const Index = () => {
  const { endIdo } = usePool()

  return (
    <div className={`bg-bkg-1 text-fgd-1 transition-all`}>
      <TopBar />
      <Notifications />
      {endIdo?.isAfter() && <ContributionPage />}
      {endIdo?.isBefore() && <RedeemPage />}
    </div>
  )
}

export default Index
