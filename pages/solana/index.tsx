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

const Section = ({ bgColor = '', showTopGlow = false, children }) => {
  return (
    <>
      <div className={`w-full ${bgColor}`}>
        {showTopGlow && <div>GLOW</div>}
        <div className="max-w-[1440px] mx-auto col-span-12 px-4 lg:px-0 md:col-span-10">
          {/* <div className="col-span-12 px-10 md:px-8 xl:px-4 xl:col-start-2 xl:col-span-10"> */}
          {children}
          {/* </div> */}
        </div>
      </div>
    </>
  )
}

const Solana = () => {
  return (
    <div>
      <img
        src="/1-Landing-v2/landing-hero-desktop.png"
        className="absolute top-0 left-0 z-[-10] bg-[#201F27] pb-[50px]"
      />
      {/* <div className="grid min-h-screen grid-cols-12 gap-4 pt-4 pb-44"> */}

      <AltNavbar />
      <Section>
        <KickstartSolana />
      </Section>

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
