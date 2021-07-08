import { ChevronRightIcon } from '@heroicons/react/solid'
import GradientText from './GradientText'

const LandingContent = () => {
  return (
    <div className="bg-th-bkg-3 transform -skew-y-3 pt-12 md:pt-48 pb-32 lg:pb-48 mb-48 lg:mb-48 -mt-64">
      <div className="max-w-7xl mx-auto px-4 py-80 transform skew-y-3">
        <div className="max-w-4xl mb-16 mx-auto text-center">
          <h2 className="mb-8 text-3xl lg:text-4xl text-white font-bold font-heading">
            It is still the early days.
          </h2>
          <p className="mb-8 text-m lg:text-l text-gray-400">
            This is the first moment for non-developers to participate in the
            Mango DAO.
          </p>
        </div>

        {/* Section 1 */}
        <div className="flex flex-wrap overflow-hidden xl:-mx-4">
          <div className="w-full overflow-hidden xl:my-4 xl:px-16 xl:w-1/2">
            <h2 className="text-3xl mb-6 leading-tight font-semibold font-heading">
              What is Mango?
            </h2>
            <p className="mb-8 text-gray-400 leading-relaxed">
              Mango is a decentralized autonomous organization. Its purpose is
              to create a well integrated and completely decentralized financial
              ecosystem for traders.
            </p>

            <h2 className="text-3xl mb-6 leading-tight font-semibold font-heading">
              What is the Insurance Fund?
            </h2>
            <p className="mb-8 text-gray-400 leading-relaxed">
              The insurance fund will refund losses to the lenders on the Mango
              smart contract in the event extreme volatility causes bankrupt
              accounts and excess losses in the system. The proceeds of this
              sale go directly into the DAO treasury for use as the insurance
              fund.
            </p>
          </div>

          <div className="w-full overflow-hidden xl:my-4 xl:px-16 xl:w-1/2">
            <h2 className="text-3xl mb-6 leading-tight font-semibold font-heading">
              What is the <GradientText>$MNGO</GradientText> token?
            </h2>
            <p className="mb-8 text-gray-400 leading-relaxed">
              We believe that substantial rewards to a strong developer
              community and liquidity incentives are the essential drivers for
              growth and therefore the foundation of the Mango DAO. Mango
              Governance tokens ($MNGO) will serve as the incentive for those
              who can proove their work is useful to the DAO. So far tokens were
              until now only provided to contributors who helped to build out
              the protocol.
            </p>
            <button
              className="inline-flex items-center px-2 py-2 pr-4 text-lg text-white font-bold rounded-xl"
              style={{ backgroundColor: 'rgba(44, 41, 66, 1)' }}
            >
              <div className="m-2 p-2 rounded-full bg-opacity-10 bg-white">
                <img alt="paper" width="10" height="9" src="/icons/paper.svg" />
              </div>
              Check out the whitepaper &nbsp;
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Section 2 */}
        <div className="max-w-4xl mb-16 mx-auto text-center">
          <h2 className="mb-8 text-3xl lg:text-4xl text-white font-bold font-heading">
            How does it work?
          </h2>
          <p className="mb-8 text-m lg:text-l text-gray-400">
            This is not a regular token sale, you are not about to invest for a
            juicy ROI on day 1.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LandingContent
