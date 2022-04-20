import SocialIcons from './SocialIcons'

const SocialChannels = () => {
  return (
    <div className="box-border w-480 py-10 bg-bkg-12">
      <div className="flex justify-center items-center">
        <img src="/img/realms-web/icons/Realms-logo.svg" />
      </div>
      <div className="text-center py-7 px-56">
        <p className="text-lg tracking-tight">
          The web3 world moves fast and Realms is no exception. Whether it’s
          improvements to our product or updates to SPL-Governance, participate
          in the conversation via our social channels.
        </p>
      </div>
      <div>
        <SocialIcons className="flex justify-center items-center gap-x-1 sm:gap-x-1 md:gap-x-3" />
      </div>
    </div>
  )
}

export default SocialChannels
