import RedeemModal from '../components/RedeemModal'
import GradientText from '../components/GradientText'

const RedeemPage = () => {
  return (
    <div className="justify-center grid grid-cols-12 gap-4 m-10">
      <div className="col-span-6 col-start-2">
        <h2 className="my-5 text-5xl lg:text-5xl text-white font-bold font-heading">
          The event has ended. <br />
          It’s time to redeem your&nbsp;
          <GradientText>$MNGO</GradientText>
        </h2>
        <p className="text-xl">
          Thank you for your contributions, soon you will be able to help decide
          the future of Mango.
        </p>
      </div>
      <div className="col-span-4 col-start-8 my-5">
        <RedeemModal />
      </div>
    </div>
  )
}

export default RedeemPage
