import GradientText from './GradientText'
import RedeemModal
 from './RedeemModal'
const HeroSectionLead = () => {
  return (
    <section className="px-4 mx-4">
    <div className="flex flex-col md:flex-row lg:flex-row m-10 mx-auto">
      <div className="flex-1">
        <h2 className="my-5 text-3xl lg:text-5xl text-white font-bold font-heading">
          The event has ended. <br />
          It’s time to redeem your&nbsp;
          <GradientText>$MNGO</GradientText>
        </h2>
        <p className="lg:text-xl">
          Thank you for your contributions, soon you will be able to help decide
          the future of Mango.
        </p>
      </div>
      <div className="flex-1 my-5 z-10">
        <RedeemModal />
      </div>
    </div>
    </section>
  )
}

export default HeroSectionLead
