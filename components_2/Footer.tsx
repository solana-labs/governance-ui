import SocialIcons from './SocialIcons'

const Footer = () => {
  const { REALM } = process.env

  if (REALM) return null
  else
    return (
      <div className="bg-cover bg-bkg-12 px-56 pt-12 pb-24">
        <div className="flex items-center">
          <div>
            <img src="/img/realms-web/icons/Realms-logo.svg" className="mr-2" />
          </div>
          <div className="flex-1">
            <a rel="noreferrer" href="" target="_blank">
              Realms
            </a>
          </div>
          <div className="ml-auto">
            <SocialIcons className="flex justify-end gap-x-3 sm:gap-x-2 md:gap-x-3" />
          </div>
        </div>
        <div className="text-sm opacity-70 mt-3">
          <a>© 2022 </a>
          <a href="">Realms | </a>
          <a href="">Security | </a>
          <a href="">Your Privacy | </a>
          <a href="">Terms</a>
        </div>
      </div>
    )
}

export default Footer
