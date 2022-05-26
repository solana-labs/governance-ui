import Footer from '../../components_2/Footer'
import Navbar from '../../components_2/NavBar'
import Button from '../../components_2/Button'

import KickstartSolana from './components/KickstartSolana'
import PerfectForDAOs from './components/PerfectForDAOs'
import SelectDAOToCreate from './components/SelectDAOToCreate'
import WhatRealmsCanDo from './components/WhatRealmsCanDo'
import WhatIsSPL from './components/WhatIsSpl'
import WhatIsADAO from './components/WhatIsADAO'
import RealmsMetrics from './components/RealmsMetrics'
import SocialChannels from './components/HMUSocials'
import FAQs from './components/FAQs'

export const Section = ({
  bgColor = '',
  showTopGlow = false,
  children,
  form = false,
}) => {
  return (
    <div className={`w-full ${bgColor} relative`}>
      {showTopGlow && (
        <img src="/1-Landing-v2/divider-glow.png" className="absolute w-full" />
      )}
      <div
        className={`w-full mx-auto lg:w-5/6  ${
          form
            ? 'max-w-[770px] px-4 md:px-0'
            : 'max-w-[1440px] px-5 md:px-16 lg:px-0 xl:px-20'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export const ExploreButton = () => {
  return (
    <Button secondary>
      <div className="relative flex items-center justify-center">
        <div className="bg-bkg-grey rounded-full ml-2 mr-2 p-2 absolute left-[-0.5rem]">
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
      <Navbar />
      <KickstartSolana />
      <Section bgColor="bg-night-grey">
        <PerfectForDAOs />
      </Section>
      <Section bgColor="bg-bkg-grey">
        <SelectDAOToCreate />
      </Section>
      <Section bgColor="bg-bkg-grey" showTopGlow>
        <WhatRealmsCanDo />
      </Section>
      <Section bgColor="bg-spl-gov bg-cover md:bg-bkg-grey md:bg-none ">
        <WhatIsSPL />
      </Section>
      <Section bgColor="bg-bkg-grey">
        <WhatIsADAO />
      </Section>
      <Section bgColor="bg-bkg-grey" showTopGlow>
        <RealmsMetrics />
      </Section>
      <Section bgColor="bg-night-grey md:bg-bkg-grey">
        <SocialChannels />
      </Section>
      <Section bgColor="bg-bkg-grey">
        <FAQs />
      </Section>
      <Footer />
    </div>
  )
}

export default Solana
