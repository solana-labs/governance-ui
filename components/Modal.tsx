import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

import { XIcon } from '@heroicons/react/outline'
import { Portal } from 'react-portal'
import { NewButton } from './Button'

const Modal = ({
  isOpen,
  onClose,
  children,
  hideClose = false,
  sizeClassName = 'sm:max-w-md',
  background = 'bg-bkg-2',
}) => {
  return (
    <Portal>
      <div
        className="fixed inset-0 z-30 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center min-h-screen px-4 pb-20 text-center sm:block sm:p-0">
          {isOpen ? (
            <div
              className="fixed inset-0 transition-opacity bg-black bg-opacity-70"
              aria-hidden="true"
              onClick={onClose}
            ></div>
          ) : null}

          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>

          {isOpen ? (
            <div
              className={`inline-block bg-bkg-2 ${background}
              rounded-lg text-left px-8 pt-6 pb-8 shadow-lg transform transition-all 
              sm:my-8 align-middle ${sizeClassName} w-full`}
            >
              {!hideClose ? (
                <div className="">
                  <button
                    onClick={onClose}
                    className={`absolute right-2 top-2 text-fgd-1 hover:text-primary focus:outline-none`}
                  >
                    <XIcon className={`h-5 w-5`} />
                  </button>
                </div>
              ) : (
                <div className="w-full pt-4" />
              )}
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </Portal>
  )
}

const Header = ({ children }) => {
  return <div className={`flex justify-center bg-bkg-2 pb-4`}>{children}</div>
}

Modal.Header = Header

export default Modal

export function NewModal({ isOpen, onClose = () => null, header, children }) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 flex p-4 md:items-center md:justify-center bg-bkg-grey md:max-w-3xl md:h-fit md:rounded md:my-auto md:mx-auto">
            <Dialog.Panel className="flex flex-col w-full h-full md:max-h-[70vh]">
              <div className="flex flex-col">
                <Dialog.Title>{header}</Dialog.Title>
              </div>
              {children}
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}

function noop() {
  return
}
export function ConfirmationDialog({
  isOpen,
  onClose = noop,
  header,
  confirmButton,
  closeButton,
  children,
}) {
  return (
    <NewModal isOpen={isOpen} header={header}>
      <div className="overflow-scroll">{children}</div>
      <div className="flex flex-col items-center justify-end mt-4 space-y-4 md:space-x-4 md:justify-start md:space-y-0 md:flex-row-reverse grow">
        <div className="md:ml-4">{confirmButton}</div>
        {closeButton ? (
          closeButton
        ) : (
          <NewButton type="button" secondary onClick={onClose}>
            Close
          </NewButton>
        )}
      </div>
    </NewModal>
  )
}
