import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import Footer from '@components/Footer'

const PageBodyContainer = ({ children }) => {
  const { pathname } = useRouter()
  const { theme } = useTheme()

  const isNewRealmsWizard = /\/realms\/new\/\w+/.test(pathname)

  return (
    <>
      <div
        className={`grid grid-cols-12 gap-4 pt-4 ${
          isNewRealmsWizard ? '' : 'min-h-[calc(100vh_-_80px)] pb-44'
        }`}
      >
        <div className="z-[-1] fixed top-0 left-0 w-[100vw] h-[100vh] bg-bkg-1">
          <picture>
            <source
              srcSet={`/img/bg-desktop-${
                theme === 'Dark' ? 'dark' : 'light'
              }.png`}
              media="(min-width: 640px)"
            />
            <img
              src={`/img/bg-mobile-${theme === 'Dark' ? 'dark' : 'light'}.png`}
            />
          </picture>
        </div>
        <div className="col-span-12 px-4 md:px-8 xl:px-4 xl:col-start-2 xl:col-span-10">
          {children}
        </div>
      </div>
      {isNewRealmsWizard ? <></> : <Footer />}
    </>
  )
}

export default PageBodyContainer
