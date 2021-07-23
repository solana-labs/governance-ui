import GradientText from './GradientText'
import RedeemModal
 from './RedeemModal'
const HeroSectionLead = () => {
  return (
    <section className="">
    <div className="justify-center grid grid-cols:1 lg:grid-cols-12 gap-4 m-10 mx-auto">
      <div className="lg:col-span-6 lg:col-start-2">
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
      <div className="lg:col-span-4 lg:col-start-8 my-5">
        <RedeemModal />
      </div>
    </div>
    </section>
  )
}

export default HeroSectionLead
