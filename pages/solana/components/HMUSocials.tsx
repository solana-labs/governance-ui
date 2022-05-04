import SocialIcons from '../../../components_2/SocialIcons'

const SocialChannels = () => {
  return (
    <div className="w-full md:bg-[#201f27] rounded py-8 px-0 flex flex-col items-center space-y-6 md:space-y-8">
      <img src="/img/realms-web/icons/Realms-logo.svg" className="w-8 h-8" />
      <div className="font-light leading-5 tracking-tight text-center md:w-2/3 md:mx-auto">
        The web3 world moves fast and Realms is no exception. Whether it&apos;s
        improvements to our product or updates to SPL-Governance, participate in
        the conversation via our social channels.
      </div>
      <div>
        <SocialIcons className="flex items-center justify-center gap-x-6 md:gap-x-8" />
      </div>
    </div>
  )
}

export default SocialChannels
