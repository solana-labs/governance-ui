import SocialIcons from './SocialIcons'

const SocialChannels = () => {
  return (
    <div className="w-full md:bg-[#201f27] rounded">
      <div className="flex items-center justify-center">
        <img src="/img/realms-web/icons/Realms-logo.svg" />
      </div>
      <div className="text-center py-7">
        <p className="text-lg tracking-tight">
          The web3 world moves fast and Realms is no exception. Whether
          it&apos;s improvements to our product or updates to SPL-Governance,
          participate in the conversation via our social channels.
        </p>
      </div>
      <div>
        <SocialIcons className="flex items-center justify-center gap-x-1 sm:gap-x-1 md:gap-x-3" />
      </div>
    </div>
  )
}

export default SocialChannels
