import ModalSection from '../components/ModalSection'
import PoolInfoCards from '../components/PoolInfoCards'
import HeroSection from '../components/HeroSection'
import ContentSectionAbout from '../components/ContentSectionAbout'
import ContentSectionSale from '../components/ContentSectionSale'
import ContentSectionRisks from '../components/ContentSectionRisks'
import FooterSection from '../components/FooterSection'
import ScrollToTop from '../components/ScrollToTop'

const ContributionPage = () => {
  return (
    <>
      <HeroSection />
      <PoolInfoCards />
      <ContentSectionAbout />
      <ContentSectionSale />
      <ContentSectionRisks />
      <ModalSection />
      <FooterSection />
      <ScrollToTop />
    </>
  )
}

export default ContributionPage
