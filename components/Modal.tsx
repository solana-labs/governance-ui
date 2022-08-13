import { XIcon } from '@heroicons/react/outline'
import { Portal } from 'react-portal'

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
