import Button from './Button'
import GradientText from './GradientText'

const ContentSection = () => {
  return (
    <div className="bg-bkg-2 transform -skew-y-3 pt-12 pb-16 mb-16 -mt-32 z-0">
      <div className="max-w-7xl mx-auto px-4 py-40 transform skew-y-3">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="mb-8 text-3xl md:text-4xl lg:text-4xl text-white font-bold font-heading">
            It is still the early days.
          </h2>
          <p className="mb-8 text-xl md:text-2xl lg:text-2xl text-white text-opacity-50">
            This is the first moment for non-developers to participate in
            helping build the Mango protocol by supporting the inception of the
            protocol&apos;s Insurance Fund.
          </p>
        </div>

        {/* Section 1 */}

        <div className="py-16 xl:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-max lg:max-w-7xl mx-auto">
            <div className="relative">
              <div className="relative md:p-6">
                <div className="lg:grid lg:grid-cols-2 lg:gap-6">
                  <div className="lg:max-w-none">
                    <h2 className="text-2xl mb-6 leading-tight font-semibold font-heading">
                      What is Mango?
                    </h2>
                    <p className="mb-8 text-lg text-white text-opacity-50 leading-relaxed">
                      Mango is a decentralized autonomous organization. Its
                      purpose is to contribute maximum value for the defi
                      ecosystem and its developer community to create
                      commercially viable decentralized trading and lending
                      products for traders.
                    </p>

                    <h2 className="text-2xl mb-6 leading-tight font-semibold font-heading">
                      Why the <GradientText>Insurance fund</GradientText>?
                    </h2>
                    <p className="mb-8 text-lg text-white text-opacity-50 leading-relaxed">
                      Mango protocol is powered by lenders providing their
                      capital for the community to use for trading and borrowing
                      purposes. The insurance fund is the last line of defense
                      for protecting our mango lenders.
                    </p>
                  </div>

                  <div className="mt-6 lg:mt-0">
                    <h2 className="text-2xl mb-6 leading-tight font-semibold font-heading">
                      What is the <GradientText>$MNGO</GradientText> token?
                    </h2>
                    <p className="mb-8 text-lg text-white text-opacity-50 leading-relaxed">
                      We believe that substantial rewards to a strong developer
                      community and liquidity incentives are the essential
                      drivers for growth and therefore the foundation of the
                      Mango DAO.
                    </p>
                    <p className="mb-8 text-lg text-white text-opacity-50 leading-relaxed">
                      Mango Governance tokens ($MNGO) will serve as the
                      incentive for those who can prove their work is useful to
                      the DAO.
                    </p>
                    <Button>Check out the whitepaper</Button>

                    <p className="text-white leading-relaxed py-4">
                      <span className="text-mango-yellow font-semibold">$MNGO</span> were only
                      provided to contributors who helped build the
                      protocol.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="max-w-4xl mb-12 mx-auto text-center">
          <h2 className="mb-8 text-3xl md:text-4xl lg:text-4xl text-white font-bold font-heading">
            How it works.
          </h2>
          <p className="mb-8 text-xl md:text-2xl lg:text-2xl text-white text-opacity-50">
            We take the view that token sales should be simple, transparent and
            minimize randomness and luck in the distribution.
          </p>
        </div>
        <section className="">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-3 lg:col-span-1">
              <div className="bg-bkg-3 border border-bkg-4 bg-feature-one bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                <div className="py-4 px-8 mt-3">
                  <div className="flex flex-col mb-8">
                    <h2 className="text-mango-yellow font-semibold text-xl tracking-wide mb-2">
                      Deposit your USDC contribution.
                    </h2>
                    <p className="text-white text-opacity-50 text-base">
                      Users deposit USDC into a vault during the event period to
                      set their contribution amount.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-3 lg:col-span-2">
              <div className="bg-bkg-3 border border-bkg-4 bg-feature-two bg-contain lg:bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                <div className="py-4 px-8 mt-3">
                  <div className="flex flex-col mb-8">
                    <h2 className="text-mango-yellow font-semibold text-xl tracking-wide mb-2">
                      48 hour participation period.
                    </h2>
                    <p className="text-white text-opacity-50 text-base">
                      The event will span over a 2 day period split into two
                      sections,{' '}
                      <span className="text-mango-green italic">
                        Unrestricted
                      </span>{' '}
                      and{' '}
                      <span className="text-mango-red italic">Restricted</span>.
                    </p>
                    <div className="flex flex-wrap overflow-hiddenm mt-8">
                      <div className="w-full overflow-hidden lg:w-1/2 pr-4 mt-4">
                        <p>
                          <span className="text-mango-green italic">
                            Unrestricted
                          </span>
                        </p>
                        <p className="text-white text-opacity-50">
                          During the unrestricted period users may deposit or
                          withdraw their USDC from the vault. During the
                          unrestricted period price can fluctuate.
                        </p>
                      </div>

                      <div className="w-full mt-4 overflow-hidden lg:w-1/2">
                        <p>
                          <span className="text-mango-red italic">
                            Restricted
                          </span>
                        </p>
                        <p className="text-white text-opacity-50">
                          After 24 hours deposits will be restricted and only
                          withdrawals allowed. During the restricted period
                          price can only go down.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-3 lg:col-span-2">
              <div className="bg-bkg-3 border border-bkg-4 bg-feature-three bg-contain lg:bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                <div className="py-4 px-8 mt-3">
                  <div className="flex flex-col mb-8">
                    <h2 className="text-mango-yellow font-semibold text-xl tracking-wide mb-2">
                      Why does it work this way?
                    </h2>
                    <p className="text-white text-opacity-50 text-base mb-4">
                      Simple mechanisms are easier to build, explain, understand
                      and are harder to exploit. A transparent mechanism
                      increases participation because buyers are more confident
                      there are no hidden tricks that could harm them.
                    </p>
                    <p className="text-white text-opacity-50 text-base mb-4">
                      Elements of luck engineered into the mechanism distribute
                      value randomly to those who are most willing to do the
                      arbitrary, worthless tasks to get the free value.
                    </p>
                    {/*<p className="text-white font-bold leading-relaxed">
                      We believe all &quot;excess&quot; value should be captured
                      by token holders in the DAO.
                    </p>*/}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-3 lg:col-span-1">
              <div className="bg-bkg-3 bg-feature-four bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                <div className="py-4 px-8 mt-3">
                  <div className="flex flex-col mb-8">
                    <h2 className="text-mango-yellow font-semibold text-xl tracking-wide mb-2">
                      MNGO unlocked and distributed.
                    </h2>
                    <p className="text-white text-opacity-50 text-base">
                      At event conclusion $MNGO gets distributed in propotion to
                      a users USDC contribution.{' '}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ContentSection
