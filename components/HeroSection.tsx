import GradientText from './GradientText'
const HeroSection = () => {
  return (
    <section className="">
      <div className="container px-4 mx-auto">
        <div className="relative pt-12 md:pt-48 pb-32 lg:pb-48">
          <div className="max-w-2xl mb-16 mx-auto text-center">
            <h2 className="mb-8 text-4xl lg:text-5xl text-white font-bold font-heading">
              Join the <GradientText>Mango DAO</GradientText> and help build the
              ecosystem.
            </h2>
            <p className="mb-8 text-2xl text-gray-400">
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
