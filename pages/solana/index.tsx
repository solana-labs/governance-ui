// import { useInView } from 'react-intersection-observer'
// import ScrollWrapper from '../../components_2/ScrollWrapper'
import KickstartSolana from '../../components_2/KickstartSolana'
import SolanaPerks from '../../components_2/SolanaPerks'
import DaoTypes from '../../components_2/DaoTypes'
import RealmsOptions from '../../components_2/RealmsOptions'
import SplGov from '../../components_2/SplGov'
import DaoCommunity from '../../components_2/DaoCommunity'
import RealmsMetrics from '../../components_2/RealmsMetrics'
import SocialChannels from '../../components_2/SocialChannels'
import FreequentlyAskedQuestions from '../../components_2/FreequentlyAskedQuestions'
import Footer from '../../components_2/Footer'
import { AltNavbar } from '../../components_2/NavBar'

export const Section = ({ bgColor = '', showTopGlow = false, children }) => {
  return (
    <div className={`w-full ${bgColor} relative`}>
      {showTopGlow && (
        <img src="/1-Landing-v2/divider-glow.png" className="absolute w-full" />
      )}
      <div className="w-full px-8 mx-auto md:px-16 md:w-5/6 xl:px-20">
        {children}
      </div>
    </div>
  )
}

const Solana = () => {
  return (
    <div className="relative">
      <AltNavbar />
      <KickstartSolana />
      <SolanaPerks />
      <DaoTypes />
      <Section showTopGlow>
        <RealmsOptions />
      </Section>
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
