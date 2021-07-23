import GradientText from './GradientText'
const HeroSectionLead = () => {
  return (
    <section className="flex">
      <div className="px-8 mx-auto h-screen justify-items-center align-middle">
        <div className="relative pt-16 md:pt-32 pb-2">
          <div className="max-w-2xl mb-16 mx-auto text-left md:text-center lg:text-center">
            <h2 className="mb-8 text-7xl text-white font-bold font-heading">
              <GradientText>Wen</GradientText> Token?
            </h2>
            <p className="mb-8 text-7xl">
                6d 23h 35m 12s
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSectionLead
