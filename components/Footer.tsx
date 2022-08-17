import Link from 'next/link'
import cx from 'classnames'
import { ExternalLinkIcon } from '@heroicons/react/outline'

import Logo from '@components/Logo'
import SocialIcons from '@components/SocialIcons'

const Footer = () => {
  const { REALM } = process.env

  if (REALM) {
    return null
  }

  return (
    <div
      className={cx(
        'absolute',
        'bottom-0',
        'left-0',
        'flex',
        'flex-row',
        'items-center',
        'justify-around',
        'w-full',
        'h-20',
        'pb-24',
        'gap-y-8',
        'md:gap-y-0'
      )}
    >
      <div className="pl-14 w-80">
        <Logo />
      </div>

      <div
        className={cx(
          'absolute',
          'flex-col',
          'flex',
          'gap-2',
          'items-center',
          'justify-center',
          'left-1/2',
          'pb-4',
          'top-1/2',
          '-translate-x-1/2',
          'translate-y-[20px]',
          'lg:relative',
          'lg:pb-0',
          'lg:translate-x-0',
          'lg:translate-y-0',
          'lg:left-0',
          'lg:top-0',
          'w-fit'
        )}
      >
        <div
          className={cx('flex', 'flex-col', 'items-center', 'justify-center')}
        >
          <SocialIcons className="mb-5" />
          <div className="flex justify-center space-x-2 text-sm opacity-70">
            <div className="flex-shrink-0 whitespace-nowrap">
              © 2022 Solana Technology Services LLC
            </div>
            <span>|</span>
            <Link href="https://realms.today/terms" passHref>
              <a className="flex-shrink-0 whitespace-nowrap">Terms</a>
            </Link>
            <span>|</span>
            <Link href="https://realms.today/privacy-policy" passHref>
              <a className="flex-shrink-0 whitespace-nowrap">Privacy Policy</a>
            </Link>
          </div>
        </div>
        <div className="opacity-70">
          Powered by <span className="font-bold">Solana</span>
        </div>
      </div>

      <div className="pr-14 w-80 flex items-center justify-end">
        <a
          className={cx(
            'flex',
            'items-center',
            'group',
            '-mr-11',
            'px-11',
            'py-5',
            'opacity-70',
            'active:opacity-50',
            'focus:opacity-[.80]',
            'hover:opacity-[.80]'
          )}
          href="https://docs.realms.today/"
        >
          <ExternalLinkIcon className="w-4 h-4 mr-2 stroke-current" />
          <div>Read the Docs</div>
        </a>
      </div>
    </div>
  )
}

export default Footer
