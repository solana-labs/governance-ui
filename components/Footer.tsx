import cx from 'classnames'
import { ExternalLinkIcon } from '@heroicons/react/outline'

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
        'pb-0',
        'lg:pb-24',
        'gap-y-8',
        'md:gap-y-0',
        'z-10'
      )}
    >
      <div
        className={cx(
          'absolute',
          'flex-col',
          'flex',
          'gap-1',
          'sm:gap-2',
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

        </div>

        <a
          className={cx(
            'flex',
            'items-center',
            'group',
            'opacity-70',
            'active:opacity-50',
            'focus:opacity-[.80]',
            'hover:opacity-[.80]',
            'mr-2',
            'text-sm'
          )}
          href="https://docs.hadeswap.com/"
        >
          <ExternalLinkIcon className="w-4 h-4 mr-2 stroke-current" />
          <div>Read the Docs</div>
        </a>

        <div className="opacity-70">
          Powered by <span className="font-bold">Solana and Realms</span>
        </div>
      </div>
    </div>
  )
}

export default Footer
