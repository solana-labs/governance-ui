import LinkLeft from './LinkLeft'
import GradientText from './GradientText'

const ContentSection = () => {
  return (
    <div className="bg-bkg-2 transform -skew-y-3 pt-16 pb-16 mb-16 -mt-32 z-0">
      <div className="max-w-7xl mx-auto px-8 py-48 transform skew-y-3">
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

        <div className="overflow-hidden">
          <div className="max-w-max lg:max-w-7xl mx-auto">
            <div className="relative">
                <div className="lg:grid lg:grid-cols-2 lg:gap-6 py-24 ">
                  <div className="lg:max-w-none">
                    <h2 className="text-2xl mb-6 leading-tight font-semibold font-heading">
                      What is Mango?
                    </h2>
                    <p className="mb-8 text-lg text-white text-opacity-50 leading-relaxed">
                      Mango is a decentralized autonomous organization. Its
                      purpose is to improve the Mango protocol for the greater defi
                      ecosystem. We aim to create commercially viable decentralized trading and lending
                      products.
                    </p>
                    <h2 className="mt-8 text-2xl mb-6 leading-tight font-semibold font-heading">
                      Why the <GradientText>Insurance fund</GradientText>?
                    </h2>
                    <p className="mb-8 text-lg text-white text-opacity-50 leading-relaxed">
                      The Mango protocol is powered by lenders providing their
                      capital for the community to use for trading and borrowing
                      purposes. The insurance fund is the last line of defense
                      for protecting our mango lenders in case the system fails.
                    </p>
                    <h2 className="text-2xl mb-6 leading-tight font-semibold font-heading">
                      What is the <GradientText>$MNGO</GradientText> token?
                    </h2>
                    <p className="mb-6 text-lg text-white text-opacity-50 leading-relaxed">
                    The token is the foundation of the Mango DAO and will be a pivital building block in the future of the protocol. 
                    </p>
                    <p className="mb-8 text-lg text-white text-opacity-50 leading-relaxed">
                      Mango Governance tokens ($MNGO) will serve as the
                      incentive for those who can prove their work is useful to
                      the DAO.
                    </p>
                   </div>



                  <div className="mt-6 lg:mt-0">
                    <h2 className="text-2xl mb-6 leading-tight font-semibold font-heading">
                      Why the token?
                    </h2>
                    <p className="mb-2 text-lg text-white text-opacity-50 leading-relaxed">
                      The introduction of the token gives contributing members of the DAO a chance to mold the future of the protocol. The token also helps bootstrap liquidity to the platform buy offering incentives to market makers and participants in the system. 
                    </p>
                    <LinkLeft>Checkout the whitepaper</LinkLeft>

                    <div className="mt-16 mb-8">
                    <h3 className="font-bold text-lg my-2">
                        Token distribution: 
                        </h3>
                        
                        <div className="grid grid-cols-12 mt-4 py-1 px-1 rounded-md shadow-md bg-mango-med-dark">
                          <div className="col-span-8 bg-mango-green text-center rounded-l-sm py-1">
                            <span className="text-xs px-1 font-bold text-white">80%</span> 
                          </div>
                          <div className="col-span-2 bg-mango-yellow text-center  py-1">
                            <span className="text-xs px-1 font-bold text-white">10%</span>  
                          </div>
                          <div className="col-span-1 bg-mango-red text-center  py-1">
                            <span className="text-xs px-1 font-bold text-white">5%</span> 
                          </div>
                          <div className="col-span-1 bg-blue-400 text-center rounded-r-sm  py-1">
                            <span className="text-xs px-1 font-bold text-white">5%</span> 
                          </div>
                        </div>
                        <div className="grid grid-cols-4 mt-4">
                          <div className="col-span-2 md:col-span-2 lg:col-span-1  m-1 p-1">
                            <p className="text-mango-green font-bold text-md my-2">
                              Mango DAO  
                            </p>
                              <p className="text-xs text-white text-opacity-50"> 
                              A majority of the tokens will be locked in a smart contract only accessible through DAO governance votes. 
                              </p>
                          </div>
                          <div className="col-span-2 md:col-span-2 lg:col-span-1 m-1 p-1">
                            <p className="text-mango-yellow font-bold text-md my-2">
                              Liquidity Incentives  
                            </p>
                              <p className="text-xs text-white text-opacity-50"> 
                              Bootstraping liquidity is important, market makers and other participants should be incentivized to be active in the books.
                              </p>
                          </div>
                          <div className="col-span-2 md:col-span-2 lg:col-span-1  m-1 p-1">
                            <p className="text-mango-red font-bold text-md my-2">
                              Insurance Fund  
                            </p>
                              <p className="text-xs text-white text-opacity-50"> 
                              MNGO will be exchange for funds commited to the insurance fund that helps protect Mango lenders.                              
                              </p>
                          </div>
                          <div className="col-span-2 md:col-span-2 lg:col-span-1  m-1 p-1">
                            <p className="text-blue-400 font-bold text-md my-2">
                              Contributor Tokens  
                            </p>
                              <p className="text-xs text-white text-opacity-50"> 
                              Tokens distributed to early contributors of the protocol are unlocked and not on a vesting schedule. 
                              
                              </p>
                          </div>
                        </div>
                    </div>  
                  </div>                  
                </div>

                <div className="max-w-4xl mx-auto text-center mt-16 pt-12 pb-16">
                      <h2 className="mb-4 text-3xl md:text-4xl lg:text-4xl text-white font-bold font-heading">
                      We want to be fully transparent.
                      </h2>
                      <p className="mb-10 text-xl md:text-2xl lg:text-2xl text-white text-opacity-50">
                      We feel it is important to detail current risks to the system in order to give full transparency for participants in the insurance fund sale. 
                      </p>
                    </div>

                    <div className="flex flex-col md:flex-row lg:flex-row gap-6 mb-16">
                      <div className="flex-1 p-5 bg-bkg-3 border border-bkg-4 rounded-xl h-auto w-auto z-10 shadow-md">
                        <div className="py-2">
                        <svg 
                          width="28" 
                          height="24" 
                          viewBox="0 0 20 16" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          >
                            <path fillRule="evenodd" clipRule="evenodd" d="M3.70711 0.292893C3.31658 -0.0976311 2.68342 -0.0976311 2.29289 0.292893C1.90237 0.683418 1.90237 1.31658 2.29289 1.70711L16.2929 15.7071C16.6834 16.0976 17.3166 16.0976 17.7071 15.7071C18.0976 15.3166 18.0976 14.6834 17.7071 14.2929L16.2339 12.8197C17.7715 11.5924 18.939 9.9211 19.5424 7.99996C18.2681 3.94288 14.4778 1 10.0002 1C8.37665 1 6.84344 1.38692 5.48779 2.07358L3.70711 0.292893ZM7.96813 4.55391L9.48201 6.0678C9.6473 6.02358 9.82102 6 10.0003 6C11.1048 6 12.0003 6.89543 12.0003 8C12.0003 8.17923 11.9767 8.35296 11.9325 8.51824L13.4463 10.0321C13.7983 9.43658 14.0003 8.74187 14.0003 8C14.0003 5.79086 12.2094 4 10.0003 4C9.25838 4 8.56367 4.20197 7.96813 4.55391Z" fill="url(#paint0_linear)"/>
                            <path d="M12.4541 14.6967L9.74965 11.9923C7.74013 11.8681 6.1322 10.2601 6.00798 8.2506L2.33492 4.57754C1.50063 5.57223 0.856368 6.73169 0.458008 8.00004C1.73228 12.0571 5.52257 15 10.0002 15C10.8469 15 11.6689 14.8948 12.4541 14.6967Z" fill="url(#paint1_linear)"/>
                            <defs>
                              <linearGradient id="paint0_linear" x1="-14" y1="-21" x2="34.5" y2="34" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#FECA1A"/>
                                <stop offset="1" stopColor="#AFD803"/>
                              </linearGradient>
                              <linearGradient id="paint1_linear" x1="-14" y1="-21" x2="34.5" y2="34" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#FECA1A"/>
                                <stop offset="1" stopColor="#AFD803"/>
                              </linearGradient>
                            </defs>
                        </svg>
                        </div>
                        <h3 className="text-white font-semibold text-xl tracking-wide my-2">
                        Unaudited smart contracts.  
                        </h3>
                        <p className="text-white text-opacity-50 text-md"> 
                        We take great care and forethought in the way we build our smart contracts, we opensource all code once 
                        ready and work with many industry leading developers during creation.
                        <br />
                        <br />
                        While this is the case we cannot guarantee they are free of potential exploits.
                        Users should understand the risks when participating today and know what they are contribtuing too.
                        </p>
                      </div>
                      <div className="flex-1 p-5 bg-bkg-3 border border-bkg-4 rounded-xl h-auto w-auto z-10 shadow-md">
                      <div className="py-2">
                      <svg 
                          width="25" 
                          height="27" 
                          viewBox="0 0 14 15" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          >
                          <path fillRule="evenodd" clipRule="evenodd" d="M0 3C0 1.34315 1.34315 0 3 0H13C13.3788 0 13.725 0.214002 13.8944 0.552786C14.0638 0.89157 14.0273 1.29698 13.8 1.6L11.25 5L13.8 8.4C14.0273 8.70302 14.0638 9.10843 13.8944 9.44721C13.725 9.786 13.3788 10 13 10H3C2.44772 10 2 10.4477 2 11V14C2 14.5523 1.55228 15 1 15C0.447715 15 0 14.5523 0 14V3Z" fill="url(#paint0_linear)"/>
                          <defs>
                            <linearGradient id="paint0_linear" x1="-11.5" y1="-24.5" x2="40" y2="46" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#FECA1A"/>
                              <stop offset="1" stopColor="#AFD803"/>
                            </linearGradient>
                          </defs>
                        </svg>

                      </div>
                        <h3 className="text-white font-semibold text-xl tracking-wide my-2">
                        New token sale mechanism 
                        </h3>
                        <p className="text-white text-opacity-50 text-md">
                         We built our own sale and distribution mechanism in order to focus on fairness for all participants in the sale. 
                         <br />
                         <br />
                         While fairness is our intention, some participants may still game the system by inflating the token price during the 
                         sale period with the intention of discouraging others to participate. 
                         <br />
                         <br />
                         they then could withdrawal their deposits during the grace period
                        lowering the price.
                        </p>
                      </div>
                      <div className="flex-1 p-5 bg-bkg-3 border border-bkg-4 rounded-xl h-auto w-auto z-10 shadow-md">
                      <div className="py-2">
                      <svg 
                          width="26" 
                          height="26" 
                          viewBox="0 0 16 16" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          >
                          <path fillRule="evenodd" clipRule="evenodd" d="M2.08296 7H4.02863C4.11783 5.45361 4.41228 4.02907 4.86644 2.88228C3.41752 3.77135 2.37513 5.25848 2.08296 7ZM8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM8 2C7.92395 2 7.76787 2.03173 7.5347 2.26184C7.29723 2.4962 7.03751 2.8849 6.79782 3.44417C6.40914 4.3511 6.12491 5.58559 6.03237 7H9.96763C9.87509 5.58559 9.59086 4.3511 9.20218 3.44417C8.96249 2.8849 8.70277 2.4962 8.4653 2.26184C8.23213 2.03173 8.07605 2 8 2ZM11.9714 7C11.8822 5.45361 11.5877 4.02907 11.1336 2.88228C12.5825 3.77135 13.6249 5.25848 13.917 7H11.9714ZM9.96763 9H6.03237C6.12491 10.4144 6.40914 11.6489 6.79782 12.5558C7.03751 13.1151 7.29723 13.5038 7.5347 13.7382C7.76787 13.9683 7.92395 14 8 14C8.07605 14 8.23213 13.9683 8.4653 13.7382C8.70277 13.5038 8.96249 13.1151 9.20218 12.5558C9.59086 11.6489 9.87509 10.4144 9.96763 9ZM11.1336 13.1177C11.5877 11.9709 11.8822 10.5464 11.9714 9H13.917C13.6249 10.7415 12.5825 12.2287 11.1336 13.1177ZM4.86644 13.1177C4.41228 11.9709 4.11783 10.5464 4.02863 9H2.08296C2.37513 10.7415 3.41752 12.2287 4.86644 13.1177Z" fill="url(#paint0_linear)"/>
                            <defs>
                              <linearGradient id="paint0_linear" x1="-13.1429" y1="-26.1333" x2="40.5356" y2="52.5975" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#FECA1A"/>
                                <stop offset="1" stopColor="#AFD803"/>
                              </linearGradient>
                            </defs>
                        </svg>

                        </div>
                        <h3 className="text-white font-semibold text-xl tracking-wide my-2">
                        Not fully decentralzed; yet. 
                        </h3>
                        <p className="text-white text-opacity-50 text-md"> 
                        Whilst the path to becoming decentralized is kicking off with the token sale, at inception the team will have control over the direction of the protocol until the governance mechanism is estabilshed and tools built out.
                        <br />
                        <br />
                        Contributers must trust the mango team until full decentralization is reached. 
                        
                        <br />
                        <br />
                        We offer full transparency in during this phase of transition and will commit to creating a fair voting system for those participating in DAO votes in the future. 
                        </p>
                      </div>

                    </div>




                
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="max-w-4xl mb-24 mx-auto text-center mt-16 pt-16">
          <h2 className="mb-4 text-3xl md:text-4xl lg:text-4xl text-white font-bold font-heading">
            How the sale works.
          </h2>
          <p className="text-xl md:text-2xl lg:text-2xl text-white text-opacity-50">
            We take the view that token sales should be simple, transparent and
            fairly distributed.
          </p>
        </div>
        <section className="">
          <div className="grid grid-cols-3 gap-6 mb-6">

            <div className="col-span-3 lg:col-span-2">
              <div className="bg-bkg-3 border border-bkg-4 bg-feature-two bg-contain lg:bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                <div className="py-4 px-8 mt-3">
                  <div className="flex flex-col mb-8">
                    <h2 className="text-mango-yellow font-semibold text-xl tracking-wide mb-2">
                      The 48 hour participation period begins.
                    </h2>
                    <p className="text-white text-opacity-50 text-base">
                      The event will span over 2 days split into two periods,{' '}
                      <span className="text-mango-green italic">
                        sale period
                      </span>{' '}
                      and{' '}
                      <span className="text-blue-400 italic">grace period</span>.
                    </p>
                    <div className="flex flex-wrap overflow-hiddenm mt-8">
                      <div className="w-full overflow-hidden lg:w-1/2 pr-4">
                        <p>
                          <span className="text-mango-green italic">
                            Sale Period
                          </span>
                        </p>
                        <p className="text-white text-opacity-50">
                          During the sale period, you may deposit or
                          withdraw USDC from the vault. During the sale
                          period, the $MNGO price can fluctuate.
                        </p>
                      </div>

                      <div className="w-full overflow-hidden lg:w-1/2">
                        <p>
                          <span className="text-blue-400 italic">
                            Grace Period
                          </span>
                        </p>
                        <p className="text-white text-opacity-50">
                          After 24 hours deposits will be restricted and only
                          withdrawals allowed. During the grace period
                          price can only go down.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-3 lg:col-span-1">
              <div className="bg-bkg-3 border border-bkg-4 bg-feature-one bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                <div className="py-4 px-8 mt-3">
                  <div className="flex flex-col mb-8">
                    <h2 className="text-mango-yellow font-semibold text-xl tracking-wide mb-2">
                      Deposit USDC into Vault.
                    </h2>
                    <p className="text-white text-opacity-50 text-base">
                      Users deposit their USDC into the contribution vault during the 
                      <span className="text-mango-green italic"> sale period</span> locking in their ticket for $MNGO redemptions on sale completion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            
            <div className="col-span-3 lg:col-span-1">
              <div className="bg-bkg-3 border border-bkg-4 bg-feature-four bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                <div className="py-4 px-8 mt-3">
                  <div className="flex flex-col mb-8">
                    <h2 className="text-mango-yellow font-semibold text-xl tracking-wide mb-2">
                      MNGO unlocked and redeemable.
                    </h2>
                    <p className="text-white text-opacity-50 text-base">
                      Once the <span className="text-blue-400 italic"> grace period</span> ends, MNGO will be unlocked for redemption from the distribution vault. 
                      <br />
                      <br />
                      Users receive a token amount
                      in proportion to their USDC contribution.{' '}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-3 lg:col-span-2">
              <div className="bg-bkg-3 border border-bkg-4 bg-feature-three bg-contain lg:bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                <div className="py-4 px-8 mt-3">
                  <div className="flex flex-col mb-8">
                    <h2 className="text-mango-yellow font-semibold text-xl tracking-wide mb-2">
                      Why does it work this way?
                    </h2>
                    <p className="text-white text-opacity-50 text-base mb-4">
                    We wanted to build a mechanism that is fair and transparent for all participants. No private sale, no backroom deals with VCs, all players are on a level playing field.
                    </p>
                    <p className="text-white text-opacity-50 text-base mb-4">
                    The mechanism is simple but robust. This makes it easier to build, use, and more importantly, harder to exploit.
                    </p>
                    {/*<p className="text-white font-bold leading-relaxed">
                      We believe all &quot;excess&quot; value should be captured
                      by token holders in the DAO.
                    </p>*/}
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
