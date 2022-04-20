import GradientTitle from './GradientTitle'

const SolanaPerks = () => {
  return (
    <div className="py-28 px-56">
      <div className="flex">
        <div className="flex-none w-80">
          <div>
            <h1 className="md:text-3xl font-thin">
              <GradientTitle>Why is Solana</GradientTitle>
            </h1>
            <h1 className="md:text-3xl font-thin">
              <GradientTitle>perfect for DAOs?</GradientTitle>
            </h1>
          </div>
        </div>

        <div className="grow">
          <div className="grid grid-cols-3 gap-16">
            <div>
              <img
                src="/img/realms-web/icons/pie-chart.svg"
                className="my-2 h-7"
                alt=""
              />
              <h3>Near-Zero Fees</h3>
              <p>
                Never worry about fees when launching a DAO, voting, or
                participating.
              </p>
            </div>
            <div>
              <img
                src="/img/realms-web/icons/treasury.svg"
                className="my-2 h-7"
                alt=""
              />
              <h3>Treasury Management</h3>
              <p>
                Leverage shared wallets to decide as a community on resource
                allocation.
              </p>
            </div>
            <div>
              <img
                src="/img/realms-web/icons/blockchain.svg"
                className="my-2 h-7"
                alt=""
              />
              <h3>Fully On-Chain</h3>
              <p>
                Cement governance decisions to ensure censorship resistance.
              </p>
            </div>
            <div>
              <img
                src="/img/realms-web/icons/devices.svg"
                className="my-2 h-7"
                alt=""
              />
              <h3>One Product</h3>
              <p>All the tools and resources you need under the same roof.</p>
            </div>
            <div>
              <img
                src="/img/realms-web/icons/magic.svg"
                className="my-2 h-7"
                alt=""
              />
              <h3>Easy Creation</h3>
              <p>Create and participate in fully on-chain DAOs of all kinds.</p>
            </div>
            <div>
              <img
                src="/img/realms-web/icons/solana-logo.svg"
                className="my-2 h-7"
                alt=""
              />
              <h3>Solana Standard</h3>
              <p className="mb-3">
                The standard framework for building and scaling DAOs on Solana.
              </p>
              <a href="" className="text-xs opacity-70 underline">
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
