import GradientText from './GradientText'

const HeroSection = () => {
  return (
    <section className="bg-hero-img bg-no-repeat bg-cover">
      <div className="container px-4 mx-auto">
        <div className="relative pt-32 mb-32">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="mb-8 text-4xl lg:text-5xl text-white font-bold font-heading">
              Join the <GradientText>Mango DAO</GradientText>
            </h2>
            <p className="md:mx-24">
              The Mango DAO is an experiment in self governance to merge the
              liquidity and usability of CeFi with the permissionless innovation
              of DeFi at a lower cost to the end user than both currently
              provide.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
