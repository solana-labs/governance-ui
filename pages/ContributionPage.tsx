import ModalSection from '../components/ModalSection'
import PoolInfoCards from '../components/PoolInfoCards'
import HeroSection from '../components/HeroSection'
import ContentSection from '../components/ContentSection'
import FooterSection from '../components/FooterSection'

const ContributionPage = () => {
  return (
    <>
      <HeroSection />
      <PoolInfoCards />
      <ContentSection />
      <div className="flex justify-center">
        <div className="">
          <ModalSection />
        </div>
      </div>
      <FooterSection />
    </>
  )
}

export default ContributionPage
