import GradientTitle from './GradientTitle'
import { IconInfoBox } from './IconInfoBox'

const SolanaPerks = () => {
  return (
    <div className="py-28 px-56">
      <div className="flex">
        <div className="flex-none w-80">
          <GradientTitle>Why is Solana</GradientTitle>
          <GradientTitle>perfect for DAOs?</GradientTitle>
        </div>

        <div className="grow">
          <div className="grid grid-cols-3 gap-16">
            <IconInfoBox
              imgSrc="pie-chart"
              title="Near-Zero Fees"
              text="Never worry about fees when launching a DAO, voting, or
            participating."
            />
            <IconInfoBox
              imgSrc="treasury"
              title="Treasury Management"
              text="Leverage shared wallets to decide as a community on resource
                allocation."
            />
            <IconInfoBox
              imgSrc="blockchain"
              title="Fully On-Chain"
              text="Cement governance decisions to ensure censorship resistance."
            />
            <IconInfoBox
              imgSrc="devices"
              title="One Product"
              text="All the tools and resources you need under the same roof."
            />
            <IconInfoBox
              imgSrc="magic"
              title="Easy Creation"
              text="Create and participate in fully on-chain DAOs of all kinds."
            />
            <div>
              <IconInfoBox
                imgSrc="solana-logo"
                title="Solana Standard"
                text="The standard framework for building and scaling DAOs on Solana."
              />
              <a
                href=""
                className="inline-block mt-3 text-xs opacity-50 underline hover:text-realms-theme-blue hover:opacity-90 active:text-white"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SolanaPerks
