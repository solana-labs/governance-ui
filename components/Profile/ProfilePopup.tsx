import React, { FC, useState } from 'react'
import Modal from '@components/Modal'
import { Profile } from '@components/Profile'
import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress } from '@utils/formatting'
import { CivicIcon } from '@components/icons'

type Props = { publicKey: PublicKey; expanded?: boolean }
export const ProfilePopup: FC<Props> = ({ publicKey, expanded, children }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    setIsOpen(!isOpen)
  }

  const Icon: FC = () =>
    children ? (
      <>{children}</>
    ) : (
      <CivicIcon
        className={`flex-shrink-0 h-3 w-3 ml-1.5 mr-1.5 text-primary-light`}
      />
    )

  return (
    <span className="flex">
      <a onClick={toggle} className="hover:brightness-[1.15] cursor-pointer">
        <Icon />
      </a>
      {isOpen && (
        <Modal
          sizeClassName="sm:max-w-sm"
          onClose={(e) => {
            e.preventDefault()
            setIsOpen(false)
          }}
          isOpen={isOpen}
        >
          <h2>Civic Profile for {abbreviateAddress(publicKey)}</h2>
          <Profile publicKey={publicKey} expanded={expanded} />
        </Modal>
      )}
    </span>
  )
}
