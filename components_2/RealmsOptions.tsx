import GradientTitle from './GradientTitle'
import { OptionsBox } from './OptionsBox'

const RealmsOptions = () => {
  return (
    <div className="flex flex-col items-center ">
      <div className="pt-10 md:pt-24">
        <GradientTitle>What you can do on Realms</GradientTitle>
      </div>
      <OptionsBox
        imgSrc="PLACEHOLDER-token"
        title="Mint tokens for your community"
        text="Use your tokens to provide membership and voting power to your
          community members."
        direction="rtl"
      />
      <OptionsBox
        imgSrc="PLACEHOLDER-member-address"
        title="Invite and Coordinate"
        text="Bring members of your community onboard to participate in your DAO’s
          activity."
        direction="ltr"
      />
      <OptionsBox
        imgSrc="PLACEHOLDER-vote-options"
        title="Vote on the Issues"
        text={`Members are given a democratic voice in each DAO’s voting process.`}
        direction="rtl"
      />
      <OptionsBox
        imgSrc="PLACEHOLDER-treasury-fund"
        title="Fund and Allocate the Treasury"
        text="Leverage your DAO’s treasury to fund goals and ideas voted on by its
          members."
        direction="ltr"
      />
    </div>
  )
}

export default RealmsOptions
