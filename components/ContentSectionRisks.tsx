//import LinkLeft from "./LinkLeft"

const ContentSectionRisks = () => {
  return (
    <>
      {/* Section 3 */}
      <div className="bg-bkg-2 transform -skew-y-3">
        <div className="max-w-7xl mx-auto px-8 py-32 transform skew-y-3">
          <div className="max-w-4xl mx-auto -mb-48 md:-mb-0 lg:-mb-0 text-center pb-16">
            <h2 className="mb-4 text-3xl md:text-4xl lg:text-4xl text-white font-bold font-heading">
              Transparency builds trust.
            </h2>
            <p className="text-xl md:text-2xl lg:text-2xl text-white text-opacity-70">
              There are risks in participating in the token sale. It&apos;s
              important you understand them before deciding to commit your
              funds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 lg:grid-cols-7 grid-rows-2 gap-6 mb-16 mx-auto">
            <div className="col-span-1 md:col-span-3 lg:col-span-3 p-5 mt-48 md:mt-0 lg:mt-0 bg-bkg-3 border border-bkg-4 rounded-xl h-550 md:h-auto lg:h-auto w-auto z-10 shadow-md bg-risk-two md:bg-risk-one lg:bg-risk-one bg-contain bg-right-bottom bg-no-repeat">
              <h3 className="text-white font-semibold text-xl tracking-wide my-2">
                Unaudited smart contracts
              </h3>
              <div>
                <p className="text-white text-opacity-70 text-base w-full md:w-1/2 lg:w-1/2">
                  We take great care and forethought in the way we design our
                  smart contracts. We make their source code publicly accessible
                  in order to get peer reviewed by as many experts possible.
                  <br />
                  <br />
                  Still we cannot guarantee that our products are free of
                  exploits, when we launch.
                </p>
              </div>
            </div>
            <div className="col-span-1 md:col-span-4 lg:col-span-4 row-span-2 p-5 bg-bkg-3 border border-bkg-4 rounded-xl h-auto w-auto z-10 shadow-md bg-risk-four md:bg-risk-three lg:bg-risk-three bg-contain bg-right-bottom bg-no-repeat">
              <h3 className="text-white font-semibold text-xl tracking-wide my-2">
                New token sale mechanism
              </h3>
              <p className="text-white text-opacity-70 text-base w-full md:w-3/4 lg:w-3/4">
                The Mango token sale was designed with the goal of being as fair
                as possible to all participants. However, there is a mechanism
                by which one or more participants with large amounts of capital
                could discourage others from participating in the token sale.
                <br />
                <br />
                During the deposit phase, these participants could deposit very
                large amounts of USDC. This would drive up the average price of
                the token and potentially discourage others from participating
                in the sale.
                <br />
                <br />
                Then, during the last minute of the withdrawal phase, these
                large participants could withdraw much of their USDC, thus
                receiving a much lower average price, depending on how
                successful they were at discouraging others.
                <br />
                <br />
                Therefore, all participants should be aware of this potential
                behaviour during the sale and make their best decisions
                accordingly.
              </p>
            </div>
            <div className="col-span-1 md:col-span-3 lg:col-span-3 p-5 bg-bkg-3 border border-bkg-4 rounded-xl h-auto w-auto z-10 shadow-md">
              <h3 className="text-white font-semibold text-xl tracking-wide my-2">
                Inflationary Tokenomics
              </h3>
              <p className="text-white text-opacity-70 text-base">
                Mango will be running its own on-chain order books to allow
                perpetual swap trading. In order to attract sophisticed traders
                with the technical expertise to become market makers, the
                protocol will need to provide very generous liquidity mining
                rewards.
                <br />
                <br />
                We were inspired from bitcoins emission schedule in our design,
                but the mechanism is genuinely unproven in this context and
                potentially could be exploited. Even if it operates correctly,
                distributing MNGO from the DAO will be inflationary.
                <br />
                <br />
                {/*  
                      <a rel="noreferrer" target="_blank" href="https://docs.mango.markets/mango-v3/liquidity-incentives">
                      <LinkLeft>Learn about it in the docs</LinkLeft>
                      </a>
                      */}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContentSectionRisks
