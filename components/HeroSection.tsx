import GradientText from './GradientText'
const HeroSection = () => {
  return (
    <section className="">
      <div className="container px-8 mx-auto">
        <div className="relative pt-16 md:pt-32 pb-2">
          <div className="max-w-2xl mb-16 mx-auto text-left md:text-center lg:text-center">
            <h2 className="mb-8 text-3xl md:text-4xl lg:text-4xl text-white font-bold font-heading">
              Join the <GradientText>Mango DAO</GradientText> and help build the
              ecosystem.
            </h2>
            <p className="mb-8 text-xl md:text-2xl lg:text-2xl text-white text-opacity-50">
              The Mango DAO is an experiment in self governance that aims to
              build a completely decentralzied financial ecosystem.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
