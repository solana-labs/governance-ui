import Footer from '../../components_2/Footer'
import Navbar from '../../components_2/NavBar'

import KickstartSolana from './components/KickstartSolana'
import PerfectForDAOs from './components/PerfectForDAOs'
import SelectDAOToCreate from './components/SelectDAOToCreate'
import WhatRealmsCanDo from './components/WhatRealmsCanDo'
import WhatIsSPL from './components/WhatIsSpl'
import WhatIsADAO from './components/WhatIsADAO'
import RealmsMetrics from './components/RealmsMetrics'
import SocialChannels from './components/HMUSocials'
import FAQs from './components/FAQs'

export const Section = ({ bgColor = '', showTopGlow = false, children }) => {
  return (
    <div className={`w-full ${bgColor} relative`}>
      {showTopGlow && (
        <img
          src="/img/realms-web/backgrounds/divider-glow.png"
          className="absolute w-full"
        />
      )}
      <div className="w-full px-5 mx-auto md:px-16 lg:w-5/6 lg:px-0 xl:px-20 max-w-[1440px]">
        {children}
      </div>
    </div>
  )
}

const Solana = () => {
  return (
    <div className="relative landing-page">
      <Navbar />
      <KickstartSolana />
      <Section bgColor="bg-[#201f27]">
        <PerfectForDAOs />
      </Section>
      <Section bgColor="bg-[#292833]">
        <SelectDAOToCreate />
      </Section>
      <Section bgColor="bg-[#292833]" showTopGlow>
        <WhatRealmsCanDo />
      </Section>
      <Section bgColor="bg-spl-gov bg-cover md:bg-[#292833] md:bg-none ">
        <WhatIsSPL />
      </Section>
      <Section bgColor="bg-[#292833]">
        <WhatIsADAO />
      </Section>
      <Section bgColor="bg-[#292833]" showTopGlow>
        <RealmsMetrics />
      </Section>
      <Section bgColor="bg-[#201f27] md:bg-[#292833]">
        <SocialChannels />
      </Section>
      <Section bgColor="bg-[#292833]">
        <FAQs />
      </Section>
      <Footer />
    </div>
  )
}

export default Solana
