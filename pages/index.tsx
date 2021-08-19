import ProposalPage from './ProposalPage'
import Notifications from '../components/Notification'
import NavBarBeta from '../components/NavBarBeta'

const Index = () => {
  return (
    <div className={`bg-bkg-1 text-white transition-all overflow-hidden`}>
      <NavBarBeta />
      <Notifications />
      <ProposalPage />
      <div className="w-screen h-2 bg-gradient-to-r from-mango-red via-mango-yellow to-mango-green"></div>
    </div>
  )
}

export default Index
