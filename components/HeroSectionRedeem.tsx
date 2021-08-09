import GradientText from './GradientText'
import RedeemModal from './RedeemModal'
const HeroSectionRedeem = () => {
  return (
    <section className="max-w-5xl mx-auto px-4">
      <div className="flex flex-col md:flex-row lg:flex-row m-10 mx-auto gap-6 items-center">
        <div className="flex-1 px-4">
          <h2 className="mb-4 text-3xl md:text-5xl lg:text-5xl text-white font-bold font-heading">
            The event has ended. <br />
            It’s time to redeem your&nbsp;
            <GradientText>$MNGO</GradientText>
          </h2>
          <p className="text-xl md:text-2xl lg:text-2xl text-white text-opacity-70">
            Thank you for your contributions, soon you will be able to help
            decide the future of Mango.
          </p>
        </div>
        <div className="flex-1 my-5 z-10">
          <RedeemModal />
        </div>
      </div>
    </section>
  )
}

export default HeroSectionRedeem
