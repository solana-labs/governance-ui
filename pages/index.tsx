import ContributionPage from './ContributionPage'
import LeadPage from './LeadPage'
import RedeemPage from './RedeemPage'
import Notifications from '../components/Notification'
import NavBarBeta from '../components/NavBarBeta'

import usePool from '../hooks/usePool'

const Index = () => {
  const { startIdo, endIdo } = usePool()

  return (
    <div className={`bg-bkg-1 text-white transition-all overflow-hidden`}>
      <div className="w-screen h-2 bg-gradient-to-r from-mango-red via-mango-yellow to-mango-green"></div>
      <NavBarBeta />
      <Notifications />
      {startIdo?.isAfter() && <LeadPage />}
      {startIdo?.isBefore() && endIdo?.isAfter() && <ContributionPage />}
      {endIdo?.isBefore() && <RedeemPage />}
      <div className="w-screen h-2 bg-gradient-to-r from-mango-red via-mango-yellow to-mango-green"></div>
    </div>
  )
}

export default Index
