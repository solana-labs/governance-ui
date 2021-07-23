import ContributionModal from './ContributionModal'

const ModalSection = () => {
  return (
    <>
      <div className="max-w-5xl px-8 mx-auto text-center">
        <h2 className="mb-8 text-3xl md:text-4xl lg:text-4xl text-white font-bold font-heading">
          It is still the early days.
        </h2>
        <p className="mb-8 text-xl md:text-2xl lg:text-2xl text-white text-opacity-50">
          This is the first moment for non-developers to participate in helping
          build the Mango protocol by supporting the inception of the protocols
          Insurance Fund.
        </p>
      </div>
      <ContributionModal />
    </>
  )
}

export default ModalSection
