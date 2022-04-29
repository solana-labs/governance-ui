import GradientTitle from './GradientTitle'
import { IconInfoBox } from './IconInfoBox'

const SolanaPerks = () => {
  return (
    <div className="pt-10 pb-9 md:pt-20 md:pb-24">
      <div className="flex flex-wrap">
        <div className="w-full mb-10 md:w-1/3 md:mb-0 md:pr-4">
          <GradientTitle>Why is Solana</GradientTitle>
          <GradientTitle>perfect for DAOs?</GradientTitle>
        </div>
        <div className="flex flex-col w-full space-y-12 md:space-y-0 md:w-2/3 md:grid md:grid-cols-3 md:gap-16">
          <IconInfoBox imgSrc="pie-chart" title="Near-Zero Fees">
            <p className="opacity-70">
              Never worry about fees when launching a DAO, voting, or
              participating.
            </p>
          </IconInfoBox>
          <IconInfoBox imgSrc="treasury" title="Treasury Management">
            <p className="opacity-70">
              Leverage shared wallets to decide as a community on resource
              allocation
            </p>
          </IconInfoBox>
          <IconInfoBox imgSrc="blockchain" title="Fully On-Chain">
            <p className="opacity-70">
              Cement governance decisions to ensure censorship resistance
            </p>
          </IconInfoBox>
          <IconInfoBox imgSrc="devices" title="One Product">
            <p className="opacity-70">
              All the tools and resources you need under the same roof
            </p>
          </IconInfoBox>
          <IconInfoBox imgSrc="magic" title="Easy Creation">
            <p className="opacity-70">
              Create and participate in fully on-chain DAOs of all kinds
            </p>
          </IconInfoBox>
          <div>
            <IconInfoBox imgSrc="solana-logo" title="Solana Standard">
              <p className="opacity-70">
                The standard framework for building and scaling DAOs on Solana
              </p>
              <div>
                <a
                  href=""
                  className="inline-block mt-3 text-xs underline opacity-50 hover:text-realms-theme-blue hover:opacity-90 active:text-white"
                >
                  Learn More
                </a>
              </div>
            </IconInfoBox>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SolanaPerks
