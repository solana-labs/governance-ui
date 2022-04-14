const SocialIcons = ({ className }) => {
  return (
    <div className={className}>
      <a
        rel="noreferrer"
        target="_blank"
        href="https://discord.com/invite/VsPbrK2hJk"
        className="duration-500 hover:scale-125 shadow-sm"
      >
        <img src="/img/realms-web/icons/Discord.svg" className="h-11" />
      </a>
      <a
        rel="noreferrer"
        target="_blank"
        href="https://twitter.com/solana"
        className="duration-500 hover:scale-125 shadow-sm"
      >
        <img src="/img/realms-web/icons/Twitter.svg" className="h-11" />
      </a>
      <a
        rel="noreferrer"
        target="_blank"
        href="https://github.com/solana-labs/governance-ui"
        className="duration-500 hover:scale-125 shadow-sm"
      >
        <img src="/img/realms-web/icons/Github.svg" className="h-11" />
      </a>
    </div>
  )
}

export default SocialIcons
