import ContributionModal from '../components/ContributionModal'
import FooterSection from '../components/FooterSection'
import HeroSection from '../components/HeroSection'
import LandingContent from '../components/LandingContent'
import NavBarBeta from '../components/NavBarBeta'

const ContributionPage = () => {
  return (
    <>
      <NavBarBeta />
      <HeroSection />
      <LandingContent />
      <div className="flex justify-center">
        <div className="max-w-screen-md grid grid-cols-12 gap-4 w-full">
          <ContributionModal />
        </div>
      </div>
      <FooterSection />
    </>
  )
}

export default ContributionPage
