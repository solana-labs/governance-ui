import Header from 'components_2/Header'
import useIsExtensionWidth from 'components_2/Utils'

const TextBox = ({ title, text }) => {
  return (
    <div className="">
      <p className="text-lg">{title}</p>
      <p className="text-base opacity-70">{text}</p>
    </div>
  )
}

const WhatIsADAO = () => {
  // <useIsExtensionWidth width='800'/>

  const isExtensionWidth = useIsExtensionWidth({ width: '1150' })

  return (
    <div className="pt-9 md:pt-24 pb-11 md:pb-32">
      <div className="pb-8 md:pb-12">
        {!isExtensionWidth ? (
          <Header as="h2" withGradient>
            A DAO is a community working together to make decisions
          </Header>
        ) : (
          <>
            <Header as="h2" withGradient>
              A DAO is a community working <br /> together to make decisions
            </Header>
            {/* <Header as="h2" withGradient>
              together to make decisions
            </Header> */}
          </>
        )}
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <div className="md:pr-20">
            <p className="mb-2 text-base font-light tracking-tight opacity-70">
              DAOs (decentralized autonomous organizations) are an effective and
              safe way to work with like-minded folks around the globe.
              <br />
              <br />
              Think of them like an internet-native business thats collectively
              owned and managed by its members. They have built-in treasuries
              that no one has the authority to access without the approval of
              the group. Decisions are governed by proposals and voting to
              ensure everyone in the organization has a voice.
            </p>
          </div>
        </div>
        <div className="w-full pt-5 md:w-1/2 md:pt-0">
          <div className="mb-6 text-lg">Industries DAOs Impact:</div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-1 md:gap-x-8">
            <TextBox title="Defi" text="Enable equitable financial markets" />
            <TextBox
              title="Gaming"
              text="Unlock new models of gameplay and digital content"
            />
            <TextBox title="Creators" text="No middlemen, own your work" />
            <TextBox title="Corporations" text="Reinvent loyalty programs" />
            <TextBox
              title="Investing"
              text="Inclusive group access to capital allocation"
            />
            <TextBox title="Communities" text="Build shared resources" />
            <TextBox
              title="Startups"
              text="Reward risk-taking contributors to new products and ideas"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhatIsADAO
