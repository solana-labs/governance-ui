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
                      Mango Governance tokens ($MNGO) will serve as the
                      incentive for those who can prove their work is useful to
                      the DAO.
                    </p>
                    <h2 className="text-2xl mb-6 leading-tight font-semibold font-heading">
                      Why the token?
                    </h2>
                    <p className="mb-8 text-lg text-white text-opacity-50 leading-relaxed">
                      We believe that substantial rewards to a strong developer
                      community and liquidity incentives are the essential
                      drivers for growth and therefore the foundation of the
                      Mango DAO.
                    </p>
                    {/*
                    <div className="flex flex-col">
                      <div className="flex-1 flex-row">
                        <div className="my-2">
                        <svg 
                        width="24" 
                        height="26" 
                        viewBox="0 0 16 18" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        >
                          <path fillRule="evenodd" clipRule="evenodd" d="M0.166107 3.99878C3.17437 3.95797 5.91528 2.81021 8 0.944336C10.0847 2.81021 12.8256 3.95797 15.8339 3.99878C15.9431 4.64956 16 5.31809 16 5.99991C16 11.2248 12.6608 15.6697 8 17.317C3.33923 15.6697 0 11.2248 0 5.99991C0 5.31809 0.0568637 4.64956 0.166107 3.99878ZM11.7071 7.70698C12.0976 7.31646 12.0976 6.6833 11.7071 6.29277C11.3166 5.90225 10.6834 5.90225 10.2929 6.29277L7 9.58566L5.70711 8.29277C5.31658 7.90225 4.68342 7.90225 4.29289 8.29277C3.90237 8.6833 3.90237 9.31646 4.29289 9.70698L6.29289 11.707C6.68342 12.0975 7.31658 12.0975 7.70711 11.707L11.7071 7.70698Z" fill="url(#paint0_linear)"/>
                          <defs>
                            <linearGradient id="paint0_linear" x1="-28" y1="-6" x2="26" y2="23" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#E54033"/>
                              <stop offset="1" stopColor="#FECA1A"/>
                            </linearGradient>
                          </defs>
                        </svg>
                        </div>
                        <h3>
                        Insurance Fund 
                        </h3>
                        <p> The insurance fund protects lenders funds from over zealous traders and borrowers.
                        </p>
                      </div>
                      <div className="flex-1 flex-row ">
                      <div className="my-2">
                      <svg 
                        width="24" 
                        height="21" 
                        viewBox="0 0 18 15" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 3C12 4.65685 10.6569 6 9 6C7.34315 6 6 4.65685 6 3C6 1.34315 7.34315 0 9 0C10.6569 0 12 1.34315 12 3Z" fill="url(#paint0_linear)"/>
                          <path d="M17 5C17 6.10457 16.1046 7 15 7C13.8954 7 13 6.10457 13 5C13 3.89543 13.8954 3 15 3C16.1046 3 17 3.89543 17 5Z" fill="url(#paint1_linear)"/>
                          <path d="M13 12C13 9.79086 11.2091 8 9 8C6.79086 8 5 9.79086 5 12V15H13V12Z" fill="url(#paint2_linear)"/>
                          <path d="M5 5C5 6.10457 4.10457 7 3 7C1.89543 7 1 6.10457 1 5C1 3.89543 1.89543 3 3 3C4.10457 3 5 3.89543 5 5Z" fill="url(#paint3_linear)"/>
                          <path d="M15 15V12C15 10.9459 14.7282 9.9552 14.2507 9.09432C14.4902 9.03275 14.7413 9 15 9C16.6569 9 18 10.3431 18 12V15H15Z" fill="url(#paint4_linear)"/>
                          <path d="M3.74926 9.09432C3.27185 9.9552 3 10.9459 3 12V15H0V12C0 10.3431 1.34315 9 3 9C3.25871 9 3.50977 9.03275 3.74926 9.09432Z" fill="url(#paint5_linear)"/>
                            <defs>
                              <linearGradient id="paint0_linear" x1="-14" y1="-3.89417e-07" x2="9" y2="15" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#E54033"/>
                                <stop offset="1" stopColor="#FECA1A"/>
                              </linearGradient>
                              <linearGradient id="paint1_linear" x1="-14" y1="-3.89417e-07" x2="9" y2="15" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#E54033"/>
                                <stop offset="1" stopColor="#FECA1A"/>
                              </linearGradient>
                              <linearGradient id="paint2_linear" x1="-14" y1="-3.89417e-07" x2="9" y2="15" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#E54033"/>
                                <stop offset="1" stopColor="#FECA1A"/>
                              </linearGradient>
                              <linearGradient id="paint3_linear" x1="-14" y1="-3.89417e-07" x2="9" y2="15" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#E54033"/>
                                <stop offset="1" stopColor="#FECA1A"/>
                              </linearGradient>
                              <linearGradient id="paint4_linear" x1="-14" y1="-3.89417e-07" x2="9" y2="15" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#E54033"/>
                                <stop offset="1" stopColor="#FECA1A"/>
                              </linearGradient>
                              <linearGradient id="paint5_linear" x1="-14" y1="-3.89417e-07" x2="9" y2="15" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#E54033"/>
                                <stop offset="1" stopColor="#FECA1A"/>
                              </linearGradient>
                            </defs>
                      </svg>
                      </div>
                        <h3 className="my-2">
                        Governance 
                        </h3>
                        <p>
                        The Mango DAO is a decetralized organization, protocol changes are contributor driven and DAO governed.
                        </p>
                      </div>
                      <div className="flex-1 flex-row">
                      <div className="my-2">
                      <svg 
                        width="24" 
                        height="20" 
                        viewBox="0 0 16 12" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg">
                          <path d="M0 2C0 0.895431 0.895431 0 2 0H14C15.1046 0 16 0.895431 16 2V4C14.8954 4 14 4.89543 14 6C14 7.10457 14.8954 8 16 8V10C16 11.1046 15.1046 12 14 12H2C0.895431 12 0 11.1046 0 10V8C1.10457 8 2 7.10457 2 6C2 4.89543 1.10457 4 0 4V2Z" fill="url(#paint0_linear)"/>
                            <defs>
                              <linearGradient id="paint0_linear" x1="-16.5" y1="3.08733e-07" x2="25" y2="10.5" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#E54033"/>
                                <stop offset="1" stopColor="#FECA1A"/>
                              </linearGradient>
                            </defs>
                        </svg>
                        </div>
                        <h3 className="my-2">
                        Liquidity Incentives 
                        </h3>
                        <p> 
                          In order to bootstrap liquidity for our markets we have designed a system well aligned with liquidity providers needs
                        </p>
                      </div>
                    </div>
                    */}
                    <Button>Check out the whitepaper</Button>

                    <p className="text-white leading-relaxed py-4">
                      <span className="text-mango-yellow font-semibold">
                        $MNGO
                      </span>{' '}
                      were only provided to contributors who helped build the
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
            fairly distributed.
          </p>
        </div>
        <section className="">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-3 lg:col-span-1">
              <div className="bg-bkg-3 border border-bkg-4 bg-feature-one bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                <div className="py-4 px-8 mt-3">
                  <div className="flex flex-col mb-8">
                    <h2 className="text-mango-yellow font-semibold text-xl tracking-wide mb-2">
                      Deposit USDC into Vault.
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
                      The event will span over 2 days split into two periods,{' '}
                      <span className="text-mango-green italic">
                        Unrestricted
                      </span>{' '}
                      and{' '}
                      <span className="text-mango-red italic">Restricted</span>.
                    </p>
                    <div className="flex flex-wrap overflow-hiddenm mt-8">
                      <div className="w-full overflow-hidden lg:w-1/2 pr-4">
                        <p>
                          <span className="text-mango-green italic">
                            Unrestricted
                          </span>
                        </p>
                        <p className="text-white text-opacity-50">
                          During the unrestricted period, you may deposit or
                          withdraw USDC from the vault. During the unrestricted
                          period, the $MNGO price can fluctuate.
                        </p>
                      </div>

                      <div className="w-full overflow-hidden lg:w-1/2">
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
              <div className="bg-bkg-3 border border-bkg-4 bg-feature-four bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                <div className="py-4 px-8 mt-3">
                  <div className="flex flex-col mb-8">
                    <h2 className="text-mango-yellow font-semibold text-xl tracking-wide mb-2">
                      MNGO unlocked and redeemable.
                    </h2>
                    <p className="text-white text-opacity-50 text-base">
                      On conclusion of the token sale, $MNGO will be distributed
                      in proportion to your USDC contribution.{' '}
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
