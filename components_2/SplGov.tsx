import { PopUpButtonBorder } from './Button'

const SplGov = () => {
  return (
    <div className="bg-cover bg-spl-gov h-fit w-480 py-10 pt-12 px-16">
      {/* <div className="bg-[url('/img/Spl-Gov-background.svg')]"> */}
      <div className="flex items-center justify-start">
        <div>
          <img src="/img/realms-web/icons/solana-black.svg" className="mr-2" />
        </div>
        <div>
          <p className="text-black font-bold">The Solana Standard</p>
        </div>
      </div>
      <div className="mb-8">
        <h1 className="md:text-3xl font-thin mt-8 mb-5">SPL Governance</h1>
        <div className="flex flex-row">
          <div className="basis-2/3 pr-20">
            <p className="text-base text-black tracking-tight mb-5">
              The Solana Program Library (SPL) is a collection of on-chain
              programs targeting the Sealevel parallel runtime. These programs
              are tested against Solana`s implementation of Sealevel,
              solana-runtime, and deployed to its mainnet. As others implement
              Sealevel, we will graciously accept patches.
            </p>
            <p className="text-base text-black tracking-tight">
              The Token Swap Program allows simple trading of token pairs
              without a centralized limit order book. The program uses a
              mathematical formula called curve to calculate the price of all
              trades. Curves aim to mimic normal market dynamics: for example,
              as traders buy a lot of one token type, the value of the other
              token type goes up.
            </p>
          </div>
          <div className="basis-1/3 pl-16">
            <p className="text-black tracking-tight mb-5">
              Solana has compiled a robust library of information to read.
            </p>
            <PopUpButtonBorder className="">
              Read about SPL Governance
            </PopUpButtonBorder>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SplGov
