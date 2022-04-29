import GradientTitle from './GradientTitle'
import { TextBox } from './TextBox'

const DaoCommunity = () => {
  return (
    <div className="">
      <div className="pb-8 md:pb-12">
        <GradientTitle>
          A DAO is a community working together to make decisions
        </GradientTitle>
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <div className="pr-20">
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
        <div className="w-full md:w-1/2">
          <div className="mb-6">
            <p className="font-bold">Industries DAOs Impact:</p>
          </div>
          <div className="grid grid-cols-2 gap-y-4">
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
