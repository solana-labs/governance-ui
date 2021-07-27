import LinkLeft from './LinkLeft'
import GradientText from './GradientText'

const ContentSection = () => {
  return (
    <>
    <div className="bg-bkg-2 transform -skew-y-3 pt-16 pb-16 mb-16 -mt-32 z-0">
      <div className="max-w-7xl mx-auto px-8 pt-48 pb-16 transform skew-y-3">
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

                    <div className="mt-10 mb-8 px-7 py-4 bg-bkg-3 border border-bkg-4 shadow-md rounded-xl">
                    <h3 className="font-bold text-lg my-2">
                        Token distribution.
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
                </div>
              </div>
            </div>
          </div>
        </div>


{/* Section 2 */}                  
<div className="pt-16 pb-16 mb-16 -mt-16 z-0">
      <div className="max-w-7xl mx-auto px-8 py-16">
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
                    <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
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
                    <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
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
                    <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
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
                    <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
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


{/* Section 3 */} 
      <div className="bg-bkg-2 transform -skew-y-3">
        <div className="max-w-7xl mx-auto px-8 py-48 my-16 transform skew-y-3">
            <div className="max-w-4xl mx-auto text-center pt-12 pb-16">
                    <h2 className="mb-4 text-3xl md:text-4xl lg:text-4xl text-white font-bold font-heading">
                       We want to be fully transparent.
                    </h2>
                    <p className="mb-10 text-xl md:text-2xl lg:text-2xl text-white text-opacity-50">
                       We feel it is important to detail current risks to the system in order to give full transparency for participants in the insurance fund sale. 
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-7 lg:grid-cols-7 grid-rows-2 gap-6 mb-16 mx-auto">
                    <div className="col-span-1 md:col-span-3 lg:col-span-3 p-5 bg-bkg-3 border border-bkg-4 rounded-xl h-auto w-auto z-10 shadow-md">
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
                  <div className="col-span-1 md:col-span-4 lg:col-span-4 row-span-2 p-5 bg-bkg-3 border border-bkg-4 rounded-xl h-auto w-auto z-10 shadow-md">
                      <h3 className="text-white font-semibold text-xl tracking-wide my-2">
                      New token sale mechanism 
                      </h3>
                      <p className="text-white text-opacity-50 text-md">
                      The Mango token sale was designed with the goal of being as fair as possible to all participants. 
                      However, there is a mechanism by which one or more participants with large amounts of capital could 
                      discourage others from participating in the token sale. 
                      <br />
                       <br />
                       During the deposit phase, these participants 
                      could deposit very large amounts of USDC. This would drive up the average price of the token and 
                      potentially discourage others from participating in the sale. 
                      <br />
                       <br />Then, during the last minute 
                      of the withdrawal phase, these large participants could withdraw much of their USDC, thus 
                      receiving a much lower average price, depending on how successful they were at discouraging others. 
                      <br />
                       <br />
                      Therefore, all participants should be aware of this potential behaviour during the sale and 
                      make their best decisions accordingly.
                      </p>
                </div>
                <div className="col-span-1 md:col-span-3 lg:col-span-3 p-5 bg-bkg-3 border border-bkg-4 rounded-xl h-auto w-auto z-10 shadow-md">
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
  </>
  )
}

export default ContentSection
