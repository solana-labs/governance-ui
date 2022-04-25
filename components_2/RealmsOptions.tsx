import GradientTitle from './GradientTitle'
import { OptionsBox } from './OptionsBox'

const RealmsOptions = () => {
  return (
    // <div className="py-20 px-56 bg-cover bg-bkg-13 flex flex-col items-center ">
    <div className="py-20 px-56 flex flex-col items-center ">
      <div className="mb-28">
        <GradientTitle>What you can do on Realms</GradientTitle>
      </div>
      {/* <img
          src="/img/realms-web/backgrounds/glow-round.svg"
          className="my-2 h-40"
          alt=""
        /> */}

      <OptionsBox
        imgSrc="PLACEHOLDER-token"
        title="Mint tokens for your community"
        text="Use your tokens to provide membership and voting power to your
          community members."
      />
      <OptionsBox
        imgSrc="PLACEHOLDER-member-address"
        title="Invite and Coordinate"
        text="Bring members of your community onboard to participate in your DAO’s
          activity."
      />
      <OptionsBox
        imgSrc="PLACEHOLDER-vote-options"
        title="Vote on the Issues"
        text={`Members are given a democratic voice in each DAO’s voting process.`}
      />
      <OptionsBox
        imgSrc="PLACEHOLDER-treasury-fund"
        title="Fund and Allocate the Treasury"
        text="Leverage your DAO’s treasury to fund goals and ideas voted on by its
          members."
      />
    </div>
  )
}

export default RealmsOptions
