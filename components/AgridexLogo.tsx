"use client"
import React from 'react'
import { useTheme } from 'next-themes'
import { useMediaQuery } from 'react-responsive';
import cx from '@hub/lib/cx';

const AgridexLogo = () => {
  const { theme = "Dark" } = useTheme()

  const isMobile = useMediaQuery({ query: '(max-width: 639px)' });

  const mobileClassName = React.useMemo(() => cx(isMobile ? "" : "relative", isMobile ? "" : "top-[4px]"), [isMobile]); 

  return (
    <>
      <div className="pl-2 pr-2 pt-1 my-auto text-xs">for</div>
      {theme === 'Dark' ? (
        <picture>
          <source
            srcSet="/img/a-logo-white.svg"
            media="(min-width: 640px)"
          />
          <img src="/img/a-logo-white-m.svg" className={cx("w-8 h-8 sm:w-24", mobileClassName)} />
        </picture>
      ) : (
        <picture>
          <source
            srcSet="/img/a-logo-black.svg"
            media="(min-width: 640px)"
          />
          <img src="/img/a-logo-black-m.svg" className={cx("w-8 h-8 sm:w-24", mobileClassName)} />
        </picture>
      )}
    </>
  )
}

export default AgridexLogo
