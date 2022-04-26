import KickstartSolana from '../../components_2/KickstartSolana'
import NavBar from '../../components_2/NavBar'
import SolanaPerks from '../../components_2/SolanaPerks'
import DaoTypes from '../../components_2/DaoTypes'
import RealmsOptions from '../../components_2/RealmsOptions'
import SplGov from '../../components_2/SplGov'
import DaoCommunity from '../../components_2/DaoCommunity'
import RealmsMetrics from '../../components_2/RealmsMetrics'
import SocialChannels from '../../components_2/SocialChannels'
import FreequentlyAskedQuestions from '../../components_2/FreequentlyAskedQuestions'
import Footer from '../../components_2/Footer'

const Solana = () => {
  return (
    <div>
      <KickstartSolana />
      <NavBar />
      <SolanaPerks />
      <DaoTypes />
      <RealmsOptions />
      <div className="px-56">
        <SplGov />
      </div>
      <DaoCommunity />
      <RealmsMetrics />
      <div className="px-32">
        <SocialChannels />
      </div>
      <FreequentlyAskedQuestions />
      <Footer />
    </div>
  )
}

export default Solana
