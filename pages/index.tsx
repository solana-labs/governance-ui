import ContributionPage from './ContributionPage'
import RedeemPage from './RedeemPage'
import Notifications from '../components/Notification'
import NavBarBeta from '../components/NavBarBeta'

import usePool from '../hooks/usePool'
import FooterSection from '../components/FooterSection'

const Index = () => {
  const { endIdo } = usePool()

  return (
    <div className={`bg-bkg-1 text-fgd-1 transition-all`}>
      <NavBarBeta />
      <Notifications />
      {endIdo?.isAfter() && <ContributionPage />}
      {endIdo?.isBefore() && <RedeemPage />}
      <FooterSection />
    </div>
  )
}

export default Index
