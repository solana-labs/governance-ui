import GradientTitle from './GradientTitle'
import { TextBox } from './TextBox'

const DaoCommunity = () => {
  return (
    <div className="py-24 px-56">
      <div className="pb-16">
        <GradientTitle>
          A DAO is a community working together to make decisions
        </GradientTitle>
      </div>
      <div className="flex flex-row">
        <div className="basis-1/2">
          <div className="pr-20">
            <p className="text-base font-thin tracking-tight opacity-70 mb-2">
              DAOs (decentralized autonomous organizations) are an effective and
              safe way to work with like-minded folks around the globe.
            </p>
            <p className="text-base font-thin tracking-tight opacity-70">
              Think of them like an internet-native business thats collectively
              owned and managed by its members. They have built-in treasuries
              that no one has the authority to access without the approval of
              the group. Decisions are governed by proposals and voting to
              ensure everyone in the organization has a voice.
            </p>
          </div>
        </div>
        <div className="basis-1/2">
          <div className="mb-6">
            <p className="font-bold">Industries DAOs Impact:</p>
          </div>
          <div className="grid grid-rows-4 grid-flow-col gap-y-4">
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

export default DaoCommunity
