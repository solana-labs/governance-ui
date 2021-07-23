import ContributionModal from './ContributionModal'
import StatsModal from './StatsModal'

const ModalSection = () => {
  return (
    <>
    <div className="pt-48 pb-48 px-4">
      <div className="max-w-5xl mx-auto text-center">
          <h2 className="mb-8 text-3xl md:text-4xl lg:text-4xl text-white font-bold font-heading">
            It is still the early days.
          </h2>
          <p className="mb-8 text-xl md:text-2xl lg:text-2xl text-white text-opacity-50">
            This is the first moment for non-developers to participate in helping
            build the Mango protocol by supporting the inception of the protocols
            Insurance Fund.
          </p>
        </div>
        <div className="max-w-3xl flex flex-wrap md:flex-row lg:flex-row mx-auto">
          <ContributionModal />
          <StatsModal />
        </div>
    </div>

    </>
  )
}

export default ModalSection
