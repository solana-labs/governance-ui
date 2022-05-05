import Header from '../../../components_2/Header'

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
          src="/img/realms-web/backgrounds/bg-value-props.png"
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
        <Header as="h4" className="mb-4">
          {title}
        </Header>
        <div className="front-light opacity-70">{description}</div>
      </div>
    </div>
  )
}

const ListOfPros = [
  {
    imgSrc: '/img/realms-web/backgrounds/screengrab-tokens.png',
    imgAlt: 'Token image',
    title: 'Mint tokens for your community',
    description:
      'Use your tokens to provide membership and voting power to your community members.',
    direction: 'ltr',
  },
  {
    imgSrc: '/img/realms-web/backgrounds/screengrab-invite.png',
    imgAlt: 'Invitation',
    title: 'Invite and Coordinate',
    description:
      'Bring members of your community onboard to participate in your DAO’s activity.',
    direction: 'rtl',
  },
  {
    imgSrc: '/img/realms-web/backgrounds/screengrab-vote.png',
    imgAlt: 'Vote results',
    title: 'Vote on the Issues',
    description:
      'Members are given a democratic voice in each DAO’s voting process.',
    direction: 'ltr',
  },
  {
    imgSrc: '/img/realms-web/backgrounds/screengrab-allocate.png',
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
        <Header as="h2" withGradient>
          What you can do on Realms
        </Header>
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
