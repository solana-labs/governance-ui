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
        <div className="z-[1] relative top-0 left-0 w-[100vw] h-[100vh] bg-bkg-1">
          <picture>
            <source srcSet="/img/shimmer.svg" media="(min-width: 640px)" />
            <img src="/img/bg-mobile.png" />
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
