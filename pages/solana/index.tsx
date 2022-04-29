import DaoTypes from '../../components_2/DaoTypes'
import RealmsOptions from '../../components_2/RealmsOptions'
import SplGov from '../../components_2/SplGov'
import DaoCommunity from '../../components_2/DaoCommunity'
import RealmsMetrics from '../../components_2/RealmsMetrics'
import SocialChannels from '../../components_2/SocialChannels'
import FreequentlyAskedQuestions from '../../components_2/FreequentlyAskedQuestions'
import Footer from '../../components_2/Footer'
import { AltNavbar } from '../../components_2/NavBar'
import Button from 'components_2/Button'

import KickstartSolana from './components/KickstartSolana'
import PerfectForDAOs from './components/PerfectForDAOs'

export const Section = ({ bgColor = '', showTopGlow = false, children }) => {
  return (
    <div className={`w-full ${bgColor} relative`}>
      {showTopGlow && (
        <img src="/1-Landing-v2/divider-glow.png" className="absolute w-full" />
      )}
      <div className="w-full px-5 mx-auto md:px-16 lg:w-5/6 lg:px-0 xl:px-20 max-w-[1440px]">
        {children}
      </div>
    </div>
  )
}

export const ExploreButton = () => {
  return (
    <Button secondary>
      <div className="relative flex items-center justify-center">
        <div className="bg-[#292833] rounded-full ml-2 mr-2 p-2 absolute left-[-0.5rem]">
          <div className="bg-[url(/1-Landing-v2/icon-binoculars-blue.png)]  w-5 h-5 bg-cover overflow-hidden text-transparent">
            Binoculars
          </div>
        </div>
        <div className="relative px-8 left-[0.5rem]">
          <div className="md:hidden">Explore</div>
          <div className="hidden md:block">Explore DAOs</div>
        </div>
      </div>
    </Button>
  )
}

export const ReadTheDocsButton = () => {
  return (
    <Button tertiary>
      <div className="relative flex items-center justify-center">
        <div className="py-1 pl-4 pr-2">Read the Docs</div>
        <img
          src="/1-Landing-v2/icon-external-link-white.png"
          className="w-3 h-3 mr-4"
          alt="External link icon"
        />
      </div>
    </Button>
  )
}

const Solana = () => {
  return (
    <div className="relative landing-page">
      <AltNavbar />
      <KickstartSolana />
      <PerfectForDAOs />
      <Section bgColor="bg-[#292833]">
        <DaoTypes />
      </Section>
      <Section bgColor="bg-[#292833]" showTopGlow>
        <RealmsOptions />
      </Section>
      <Section bgColor="bg-[#292833]">
        <SplGov />
      </Section>
      <Section bgColor="bg-[#292833]">
        <DaoCommunity />
      </Section>
      <Section bgColor="bg-[#292833]" showTopGlow>
        <RealmsMetrics />
      </Section>
      <Section bgColor="bg-[#201f27] md:bg-[#292833]">
        <SocialChannels />
      </Section>
      <Section bgColor="bg-[#292833]">
        <FreequentlyAskedQuestions />
      </Section>
      <Footer />
    </div>
  )
}

export default Solana
