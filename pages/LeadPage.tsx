import ContentSectionAbout from '../components/ContentSectionAbout'
import ContentSectionSale from '../components/ContentSectionSale'
import ContentSectionRisks from '../components/ContentSectionRisks'
import FooterSection from '../components/FooterSection'
import HeroSectionLead from '../components/HeroSectionLead'

const LeadPage = () => {
  return (
    <>
      <HeroSectionLead />
      <ContentSectionAbout />
      <ContentSectionSale />
      <ContentSectionRisks />
      <FooterSection />
    </>
  )
}

export default LeadPage
