import Image from 'next/image'

const RelevantLinks = {
  Docs: 'https://docs.realms.today/',
  'Programs Github':
    'https://github.com/solana-labs/solana-program-library/blob/master/governance/README.md',
}

const Socials = {
  Twitter: {
    url: 'https://twitter.com/Realms_DAOs',
    imgSrc: '/icons/twitter.svg',
  },
  Github: {
    url: 'https://github.com/solana-labs/governance-ui',
    imgSrc: '/icons/github.svg',
  },
  Discord: {
    url: 'https://discord.com/invite/VsPbrK2hJk',
    imgSrc: '/icons/discord.svg',
  },
}

const Footer = () => {
  const { REALM } = process.env

  if (REALM) return null
  else
    return (
      <div className="absolute bottom-0 left-0 flex flex-row justify-around w-full h-20 px-12 border-t border-bkg-4 bg-bkg-2 gap-y-8 md:gap-y-0">
        <div className="flex items-center justify-center gap-x-5 md:gap-x-6 ">
          {Object.keys(RelevantLinks).map((linkTitle) => {
            const href = RelevantLinks[linkTitle]
            return (
              <a
                key={linkTitle}
                href={href}
                target="_blank"
                className="text-base font-bold default-transition hover:text-fgd-2"
                rel="noreferrer"
              >
                {linkTitle}
              </a>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-x-10 sm:gap-x-20 md:gap-x-24">
          {Object.keys(Socials).map((name) => {
            const { url, imgSrc } = Socials[name]
            return (
              <a
                key={name}
                rel="noreferrer"
                target="_blank"
                href={url}
                className="text-base default-transition hover:scale-125"
              >
                <Image src={imgSrc} width={36} height={36} alt={name} />
              </a>
            )
          })}
        </div>

        <div className="items-center justify-center hidden gap-x-1 md:flex">
          <p className="text-base font-light">Powered by</p>

          <a
            rel="noreferrer"
            href="https://solana.com/"
            target="_blank"
            className="text-base font-bold default-transition hover:text-fgd-2"
          >
            Solana
          </a>
        </div>
      </div>
    )
}

export default Footer
