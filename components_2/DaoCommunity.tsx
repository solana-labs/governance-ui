import GradientTitle from './GradientTitle'

const DaoCommunity = () => {
  return (
    <div className="py-24 px-56">
      <div className="pb-16">
        <h1 className="md:text-3xl font-thin">
          <GradientTitle>A DAO is a community working</GradientTitle>
        </h1>
        <h1 className="md:text-3xl font-thin">
          <GradientTitle>together to make decisions</GradientTitle>
        </h1>
      </div>
      <div className="flex flex-row">
        <div className="basis-1/2">
          <div className="pr-20">
            <p className="text-base font-thin tracking-tight opacity-70 mb-5">
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
            <GradientTitle>Industries DAOs Impact:</GradientTitle>
          </div>
          <div className="grid grid-rows-4 grid-flow-col gap-y-4">
            <div className="pr-16">
              <p className="font-bold">Defi</p>
              <p className="opacity-70">Enable equitable financial markets</p>
            </div>
            <div className="pr-16">
              <p className="font-bold">Gaming</p>
              <p className="opacity-70">
                Unlock new models of gameplay and digital content
              </p>
            </div>
            <div className="pr-16">
              <p className="font-bold">Creators</p>
              <p className="opacity-70">No middlemen, own your work</p>
            </div>
            <div className="pr-16">
              <p className="font-bold">Corporations</p>
              <p className="opacity-70">Reinvent loyalty programs</p>
            </div>
            <div className="pr-16">
              <p className="font-bold">Investing</p>
              <p className="opacity-70">
                Inclusive group access to capital allocation
              </p>
            </div>
            <div className="pr-16">
              <p className="font-bold">Communities</p>
              <p className="opacity-70">Build shared resources</p>
            </div>
            <div className="pr-16">
              <p className="font-bold">Startups</p>
              <p className="opacity-70">
                Reward risk-taking contributors to new products and ideas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DaoCommunity
