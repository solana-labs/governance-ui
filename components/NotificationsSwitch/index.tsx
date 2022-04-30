import { useRef, useState } from 'react'
// import * as anchor from '@project-serum/anchor'
import {
  // IncomingThemeVariables,
  defaultVariables,
} from '@dialectlabs/react-ui'
// import { WalletType } from '@dialectlabs/react'
import { Transition } from '@headlessui/react'
// import { useTheme } from 'next-themes'
// import useWalletStore from 'stores/useWalletStore'

// const REALMS_PUBLIC_KEY = new anchor.web3.PublicKey(
//   'BUxZD6aECR5B5MopyvvYqJxwSKDBhx2jSSo1U32en6mj'
// )

// const themeVariables: IncomingThemeVariables = {
//   light: {
//     colors: {
//       bg: 'bg-bkg-1',
//     },
//     button: `${defaultVariables.light.button} bg-primary-light border-primary-light font-bold rounded-full hover:bg-primary-dark`,
//     buttonLoading: `${defaultVariables.light.buttonLoading} rounded-full min-h-[40px]`,
//     secondaryDangerButton: `${defaultVariables.light.secondaryDangerButton} rounded-full`,
//     bellButton: `!bg-bkg-2 !shadow-none text-fgd-1 h-10 rounded-full w-10 hover:bg-bkg-3`,
//     modal: `${defaultVariables.light.modal} sm:border sm:rounded-md sm:border-fgd-4 sm:shadow-md`,
//     modalWrapper: `${defaultVariables.dark.modalWrapper} sm:top-14`,
//   },
//   dark: {
//     colors: {
//       bg: 'bg-bkg-1',
//       highlight: 'border border-fgd-4',
//     },
//     button: `${defaultVariables.dark.button} bg-primary-light border-primary-light font-bold rounded-full hover:bg-primary-dark`,
//     buttonLoading: `${defaultVariables.dark.buttonLoading} rounded-full min-h-[40px]`,
//     secondaryDangerButton: `${defaultVariables.dark.secondaryDangerButton} rounded-full`,
//     bellButton:
//       '!bg-bkg-2 !shadow-none text-fgd-1 h-10 rounded-full w-10 hover:bg-bkg-3',
//     modal: `${defaultVariables.dark.modal} bg-bkg-1 sm:border sm:border-fgd-4 shadow-md sm:rounded-md`,
//     modalWrapper: `${defaultVariables.dark.modalWrapper} sm:top-14`,
//   },
// }

export default function NotificationsSwitch() {
  // const { theme } = useTheme()
  const wrapperRef = useRef(null)
  // const { current: wallet, connection } = useWalletStore()
  // const cluster = connection.cluster

  const [openModal, setOpenModal] = useState(false)

  // return (
  //   <NotificationsButton
  //     wallet={(wallet as unknown) as WalletType}
  //     network={cluster as string}
  //     publicKey={REALMS_PUBLIC_KEY}
  //     theme={theme === 'Dark' ? 'dark' : 'light'}
  //     variables={themeVariables}
  //     notifications={[{ name: 'New proposals', detail: 'Event' }]}
  //   />
  // )
  // console.log("bell: ", defaultVariables.dark.icons.bell({}));
  const Bell = defaultVariables.dark.icons.bell
  return (
    <>
      <Transition
        className={defaultVariables.dark.modalWrapper}
        show={openModal}
        {...defaultVariables.animations.popup}
      >
        <div ref={wrapperRef} className="w-full h-full bg-bkg-3">
          <div className="h-full flex flex-col items-center py-8">
            <Bell />
            <h2 className="mb-4">Realms Notifications</h2>
            <div className="w-full p-4">
              <div className="flex flex-col items-center bg-bkg-1 px-4 py-6">
                <div className="flex w-full justify-between">
                  <div>
                    <h2 className="inline-block">Dialect</h2>
                  </div>
                  <div>
                    <p className="inline-block">Wallet</p>
                  </div>
                </div>

                <div className="flex w-full justify-start">
                  <div>
                    <p className="inline-block">
                      Dialect is the first protocol for smart messaging -
                      dynamic, composable dapp notifications and
                      wallet-to-wallet chat
                    </p>
                  </div>
                </div>

                <div className="flex w-full justify-center pt-3">
                  <button className="bg-white rounded-full py-1 w-full text-black">
                    Use Dialect
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
      <button
        className="bg-bkg-2 default-transition flex items-center justify-center h-10 rounded-full w-10 hover:bg-bkg-3"
        onClick={() => setOpenModal(!openModal)}
      >
        {defaultVariables.dark.icons.bell({})}
      </button>
    </>
  )
}
