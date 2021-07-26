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

        <div className="py-16 overflow-hidden">
          <div className="max-w-max lg:max-w-7xl mx-auto">
            <div className="relative">
                <div className="lg:grid lg:grid-cols-2 lg:gap-6">
                  <div className="lg:max-w-none">
                    <h2 className="text-2xl mb-6 leading-tight font-semibold font-heading">
                      What is Mango?
                    </h2>
                    <p className="mb-8 text-lg text-white text-opacity-50 leading-relaxed">
                      Mango is a decentralized autonomous organization. Its
                      purpose is to improve the Mango protocol for the greater defi
                      ecosystem. We aim to create commercially viable decentralized trading and lending
                      products for traders.
                    </p>

                    <h2 className="text-2xl mb-6 leading-tight font-semibold font-heading">
                      Why the <GradientText>Insurance fund</GradientText>?
                    </h2>
                    <p className="mb-8 text-lg text-white text-opacity-50 leading-relaxed">
                      At its core the Mango protocol is powered by lenders providing their
                      capital for the community to use for trading and borrowing
                      purposes. The insurance fund is the last line of defense
                      for protecting our mango lenders in case the system fails.
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
                      The introduction of the token gives contributing members of the DAO a chance to mold the future of the protocol. The token also helps bootstrap liquidity to the platform buy offering incentives to market makers and participants in the system. 
                      <br />
                      <br />
                      The token is the foundation of the Mango DAO and will be a pivital building block in the future of the protocol. 
                    </p>
                    {/* 
                    <div className="flex flex-col">
                      <div className="flex-1 flex-row mt-4">
                        <div className="mt-4">
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
                        <p className="text-md text-white text-opacity-50"> 
                        The insurance fund protects lenders funds from over zealous traders and borrowers.
                        </p>
                      </div>
                      <div className="flex-1 flex-row mt-4">
                      <div className="mt-4">
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
                        <p className="text-md text-white text-opacity-50">
                        The Mango DAO is a decetralized organization, protocol changes are contributor driven and DAO governed.
                        </p>
                      </div>
                      <div className="flex-1 flex-row mt-4">
                      <div className="mt-4">
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
                        <p className="text-md text-white text-opacity-50"> 
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

                <div className="max-w-4xl mx-auto text-center mt-16 pt-12 pb-16">
                      <h2 className="mb-8 text-3xl md:text-4xl lg:text-4xl text-white font-bold font-heading">
                      Current risks to DAO contributors.
                      </h2>
                      <p className="mb-8 text-xl md:text-2xl lg:text-2xl text-white text-opacity-50">
                      We feel it important to detail the current risks to the system in order to give full transparency for participants in the insurance funds inception. 
                      </p>
                    </div>

                    <div className="grid col-span-1 md:grid-cols-8 lg:grid-cols-8 gap-6">
                      <div className="col-span-1 md:col-span-4 lg:col-span-4 p-5 bg-bkg-3 border border-bkg-4 rounded-xl h-auto w-auto z-10 shadow-md">
                        <div className="py-2">
                        <svg 
                          width="24" 
                          height="20" 
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
                        <h3 className="my-2">
                        Unaudited smart contracts.  
                        </h3>
                        <p className="text-md text-white text-opacity-50"> 
                        While we take great care and forethought in the way we build our smart contracts, we cannot guarantee they are free of potential exploits.
                        Users should always take caution when participating and do as much research as possible
                        </p>
                      </div>
                      <div className="col-span-1 md:col-span-4 lg:col-span-4 p-5 bg-bkg-3 border border-bkg-4 rounded-xl h-auto w-auto z-10 shadow-md">
                      <div className="py-2">
                      <svg 
                          width="21" 
                          height="22" 
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
                        <h3 className="my-2">
                        New token sale mechanism 
                        </h3>
                        <p className="text-md text-white text-opacity-50">
                        We have focused on fairness for all participants in the sale. However, some players may game the system by inflating the token price during the deposit period (discouraging others to participate) before withdrawing when deposits are closed and lowering the price.
                        </p>
                      </div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-2 p-5 bg-bkg-3 border border-bkg-4 rounded-xl h-auto w-auto z-10 shadow-md">
                      <div className="py-2">
                      <svg 
                          width="22" 
                          height="22" 
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
                        <h3 className="my-2">
                        Not fully decentralzed; yet. 
                        </h3>
                        <p className="text-md text-white text-opacity-50"> 
                        Whilst the path to becoming decentralized is kicking off with the token sale, the team will have control over the direction of the protocol until the governance mechanism is fully established.
                        Contributers must trust the mango team until full decentralization is reached.
                        </p>
                      </div>
                      <div className="col-span-1 md:col-span-6 lg:col-span-6 p-5 bg-bkg-3 border border-bkg-4 rounded-xl h-auto w-auto z-10 shadow-md">
                      <div className="py-2">
                      <svg 
                          width="20" 
                          height="22" 
                          viewBox="0 0 14 16" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          >
                          <path d="M7 0C4.23858 0 2 2.23858 2 5V7C0.895431 7 0 7.89543 0 9V14C0 15.1046 0.89543 16 2 16H12C13.1046 16 14 15.1046 14 14V9C14 7.89543 13.1046 7 12 7H4V5C4 3.34315 5.34315 2 7 2C8.39651 2 9.57246 2.95512 9.90555 4.24926C10.0432 4.78411 10.5884 5.1061 11.1232 4.96844C11.6581 4.83078 11.9801 4.28559 11.8424 3.75074C11.2874 1.59442 9.33117 0 7 0Z" fill="url(#paint0_linear)"/>
                            <defs>
                              <linearGradient id="paint0_linear" x1="-11.5" y1="-26.1333" x2="44.415" y2="45.6265" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#FECA1A"/>
                                <stop offset="1" stopColor="#AFD803"/>
                              </linearGradient>
                            </defs>
                        </svg>

                        </div>
                        <h3 className="my-2">
                        Contributor tokens fully vested. 
                        </h3>
                        <p className="text-md text-white text-opacity-50"> 
                        Tokens distributed to early contributors of the protocol are unlocked and not on a vesting schedule. This means they are full tradable by contributors at launch. The team fully commits to not dumping on you though. 
                        </p>
                        <h3 className="my-2">
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
                        <div className="flex mt-4">
                          <div className="flex-1 m-1 p-1">
                            <p className="text-mango-green font-bold text-md my-2">
                              Mango DAO  
                            </p>
                              <p className="text-xs text-white text-opacity-50"> 
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                              </p>
                          </div>
                          <div className="flex-1 m-1 p-1">
                            <p className="text-mango-yellow font-bold text-md my-2">
                              Liquidity Incentives  
                            </p>
                              <p className="text-xs text-white text-opacity-50"> 
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                              </p>
                          </div>
                          <div className="flex-1 m-1 p-1">
                            <p className="text-mango-red font-bold text-md my-2">
                              Insurance Fund  
                            </p>
                              <p className="text-xs text-white text-opacity-50"> 
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.                              
                              </p>
                          </div>
                          <div className="flex-1 m-1 p-1">
                            <p className="text-blue-400 font-bold text-md my-2">
                              Contributor Tokens  
                            </p>
                              <p className="text-xs text-white text-opacity-50"> 
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.                              
                              </p>
                          </div>
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
