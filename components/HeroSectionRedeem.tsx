import GradientText from './GradientText'
import RedeemModal from './RedeemModal'
const HeroSectionRedeem = () => {
  return (
    <section className="max-w-5xl mx-auto px-4">
      <div className="flex flex-col md:flex-row lg:flex-row m-10 mx-auto gap-6 items-center">
        <div className="flex-1 px-4">
          <h2 className="mb-4 text-3xl md:text-5xl lg:text-5xl text-white font-bold font-heading">
            That&apos;s a wrap.
            <br />
            <GradientText>MNGO</GradientText> is ready.
          </h2>
          <p className="mb-2 text-xl text-white text-opacity-70">
            Thank you to everyone who participated in the sale.
          </p>
          <p className="text-xl text-white text-opacity-70">
            You are now valued members of the Mango DAO. Let&apos;s shape the
            future of Mango together.
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
