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
      <div className="w-full px-8 mx-auto md:px-16 lg:w-5/6 lg:px-0 xl:px-20 max-w-[1440px]">
        {children}
      </div>
    </div>
  )
}

const Solana = () => {
  return (
    <div className="relative landing-page">
      <AltNavbar />
      <KickstartSolana />
      <Section bgColor="bg-[#201f27]">
        <SolanaPerks />
      </Section>
      <Section bgColor="bg-[#292833]">
        <DaoTypes />
      </Section>
      <Section bgColor="bg-[#292833]" showTopGlow>
        <RealmsOptions />
      </Section>
      <Section>
        <SplGov />
      </Section>
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
