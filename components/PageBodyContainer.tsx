import { useRouter } from 'next/router'

const PageBodyContainer = ({ children }) => {
  const { pathname } = useRouter()
  const isNewRealmsWizard = /\/realms\/new\/\w+/.test(pathname)

  return (
    <>
      <div
        className={`grid grid-cols-12 gap-4 pt-4 ${
          isNewRealmsWizard ? '' : 'min-h-[calc(100vh_-_80px)] pb-64'
        }`}
      >
        <div className="fixed top-0 left-30 w-[100vw] h-[100vh] bg-bkg-1">
          <picture>
            <source srcSet="/img/shimmer.svg" media="(min-width: 640px)" />
            <img src="/img/shimmer.svg" />
          </picture>
        </div>
        <div className="fixed top-0 left-0 w-[100vw] h-[100vh] bg-bkg-1">
          <picture>
            <source srcSet="/img/wavestop.svg" media="(min-width: 640px)" />
            <img src="/img/wavestop.svg" />
          </picture>
        </div>
        <div className="relative z-[3] col-span-12 px-4 md:px-8 xl:px-4 xl:col-start-2 xl:col-span-10">
          {children}
        </div>
      </div>
    </>
  )
}

export default PageBodyContainer
