import DiscordIcon from './DiscordIcon'
import TwitterIcon from './TwitterIcon'

const Footer = () => {
  const { REALM } = process.env

  if (REALM) return null
  else
    return (
      <div className="flex flex-row h-20   justify-around bottom-0 bg-bkg-1 gap-y-8 md:gap-y-0 w-full absolute left-0  px-12 border-t border-primary-light">
        <div className="flex justify-center  items-center gap-x-5   md:gap-x-6  ">
          <a
            rel="noreferrer"
            href="https://forums.orca.so/"
            target="_blank"
            className="text-white text-base font-bold hover:text-primary-dark transition-all duration-200"
          >
            Forum
          </a>
          <a
            rel="noreferrer"
            href="https://docs.orca.so/orca-governance/governance-v0-user-guide"
            target="_blank"
            className="text-white text-base font-bold hover:text-primary-dark transition-all duration-200"
          >
            Guide
          </a>
        </div>

        <div className="flex justify-center items-center gap-x-10 sm:gap-x-20 md:gap-x-24">
          <a
            rel="noreferrer"
            href="https://www.orca.so/"
            target="_blank"
            className="text-white text-base font-bold hover:text-primary-dark transition-all duration-200"
          >
            <img src="/img/orcaicon.svg" className="h-8 mr-3" />
          </a>
          <a
            rel="noreferrer"
            target="_blank"
            href="https://twitter.com/orca_so"
            className="text-primary-light text-base font-light transform transition duration-500 hover:scale-125 shadow-sm"
          >
            <TwitterIcon className="" />
          </a>
          <a
            rel="noreferrer"
            target="_blank"
            href="https://discord.com/invite/nSwGWn5KSG"
            className="text-primary-light text-base font-light transform transition duration-500 hover:scale-125 shadow-sm"
          >
            <DiscordIcon className="" />
          </a>
        </div>

        <div className=" justify-center items-center gap-x-1   hidden md:flex ">
          <p className="text-white text-base font-light cursor-default ">
            Powered by
          </p>

          <a
            rel="noreferrer"
            href="https://solana.com/"
            target="_blank"
            className="text-white text-base font-bold hover:text-primary-dark transition-all duration-200"
          >
            Solana
          </a>
        </div>
      </div>
    )
}

export default Footer
