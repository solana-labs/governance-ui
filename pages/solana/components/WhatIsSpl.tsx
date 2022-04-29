import Button from '../../../components_2/Button'

const SplGov = () => {
  return (
    <div className="bg-cover md:px-16 md:py-10 md:pt-12 bg-spl-gov h-fit">
      {/* <div className="bg-[url('/img/Spl-Gov-background.svg')]"> */}
      <div className="flex items-center justify-start">
        <div>
          <img src="/img/realms-web/icons/solana-black.svg" className="mr-2" />
        </div>
        <div>
          <p className="font-bold text-black">The Solana Standard</p>
        </div>
      </div>
      <div className="mb-8">
        <h1 className="mt-8 mb-5 font-thin md:text-3xl">SPL Governance</h1>
        {/* <div className="flex flex-row"> */}
        <div>
          {/* <div className="pr-20 basis-2/3"> */}
          <div>
            <p className="mb-5 text-base tracking-tight text-black">
              The Solana Program Library (SPL) is a collection of on-chain
              programs targeting the Sealevel parallel runtime. These programs
              are tested against Solana`s implementation of Sealevel,
              solana-runtime, and deployed to its mainnet. As others implement
              Sealevel, we will graciously accept patches.
            </p>
            <p className="text-base tracking-tight text-black">
              The Token Swap Program allows simple trading of token pairs
              without a centralized limit order book. The program uses a
              mathematical formula called curve to calculate the price of all
              trades. Curves aim to mimic normal market dynamics: for example,
              as traders buy a lot of one token type, the value of the other
              token type goes up.
            </p>
          </div>
          {/* <div className="relative pl-16 basis-1/3"> */}
          <div>
            <p className="mb-5 tracking-tight text-black">
              Solana has compiled a robust library of information to read.
            </p>

            <Button withBorder>
              <div className="relative flex items-center justify-center px-4">
                <div className="pr-2">Read about SPL Governance</div>
                <svg
                  width="13"
                  height="12"
                  viewBox="0 0 13 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 0L7.25 0.75L8.96967 2.46967L5.21968 6.21967L6.28034 7.28033L10.0303 3.53033L11.75 5.25L12.5 4.5V0H8Z"
                    fill="currentColor"
                  />
                  <path
                    d="M1.25 1.5H5V3H2.75V9.75H9.5V7.5H11V11.25H1.25V1.5Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SplGov
