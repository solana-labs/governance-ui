import GradientTitle from '../../../components_2/GradientTitle'

const OptionsBox = ({
  imgSrc,
  imgAlt,
  title,
  description,
  direction = 'ltr',
}) => {
  return (
    <div
      className={`flex flex-wrap ${
        direction === 'rtl' ? 'md:flex-row-reverse' : 'flex-row'
      } items-center space-y-5`}
    >
      <div className="relative w-full md:w-1/2">
        <img
          src="/1-Landing-v2/bg-value-props.png"
          alt="artistic illustration"
          className="absolute bottom-[-20px] w-full z-[0]"
        />
        <img
          src={imgSrc}
          alt={imgAlt}
          className="relative z-[0] w-full rounded"
        />
      </div>
      <div className="w-full text-center md:w-1/2 md:text-left md:px-16">
        <h3 className="mb-4 font-normal">{title}</h3>
        <div className="front-light opacity-70">{description}</div>
      </div>
    </div>
  )
}

const ListOfPros = [
  {
    imgSrc: '/1-Landing-v2/screengrab-tokens.png',
    imgAlt: 'Token image',
    title: 'Mint tokens for your community',
    description:
      'Use your tokens to provide membership and voting power to your community members.',
    direction: 'ltr',
  },
  {
    imgSrc: '/1-Landing-v2/screengrab-invite.png',
    imgAlt: 'Invitation',
    title: 'Invite and Coordinate',
    description:
      'Bring members of your community onboard to participate in your DAO’s activity.',
    direction: 'rtl',
  },
  {
    imgSrc: '/1-Landing-v2/screengrab-vote.png',
    imgAlt: 'Vote results',
    title: 'Vote on the Issues',
    description:
      'Members are given a democratic voice in each DAO’s voting process.',
    direction: 'ltr',
  },
  {
    imgSrc: '/1-Landing-v2/screengrab-allocate.png',
    imgAlt: 'Dashboard',
    title: 'Fund and Allocate the Treasury',
    description:
      'Leverage your DAO’s treasury to fund goals and ideas voted on by its members.',
    direction: 'rtl',
  },
]

const WhatRealmsCanDo = () => {
  return (
    <div className="pb-20 pt-9 md:pt-24">
      <div className="text-center">
        <GradientTitle>What you can do on Realms</GradientTitle>
      </div>
      <div className="space-y-20 pt-14 md:pt-20">
        {ListOfPros.map((props) => (
          <OptionsBox key={props.title} {...props} />
        ))}
      </div>
    </div>
  )
}

export default WhatRealmsCanDo
