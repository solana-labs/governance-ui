import ContributionModal from '../components/ContributionModal'
import PoolInfoCards from '../components/PoolInfoCards'
import HeroSection from '../components/HeroSection'
import LandingContent from '../components/LandingContent'

const SalePage = () => {
  return (
    <>
      <HeroSection />
      <PoolInfoCards />
      <LandingContent />
      <div className="flex justify-center">
        <div className="max-w-screen-md grid grid-cols-12 gap-4 w-full">
          <ContributionModal />
        </div>
      </div>
    </>
  )
}

export default SalePage
