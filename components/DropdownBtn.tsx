import { Menu } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import Loading from '@components/Loading'

export interface DropdownBtnOptions {
  isDefault: boolean | undefined
  label: string
  callback: () => Promise<void>
}

const DropdownBtn = ({
  options,
  isLoading,
}: {
  options: DropdownBtnOptions[]
  isLoading?: boolean
}) => {
  const defaultFunction = options.find((x) => x.isDefault)
  if (!defaultFunction) {
    throw 'DropdownBtn must have at least one default option'
  }
  const filtredOptions = options.filter((x) => !x.isDefault)
  return (
    <div className="flex">
      {isLoading ? (
        <Loading></Loading>
      ) : (
        <>
          <button
            className={`bg-transparent border border-fgd-3 border-r-0 default-transition flex h-12 items-center pl-3 pr-4 rounded-l-full rounded-r-none w-36 hover:bg-bkg-3 focus:outline-none`}
            onClick={() => defaultFunction?.callback()}
          >
            <div className="flex font-bold items-center text-fgd-1 text-left text-sm">
              <div>{defaultFunction?.label}</div>
            </div>
          </button>

          <div className="relative ">
            <Menu>
              {({ open }) => (
                <>
                  <Menu.Button
                    className={`border border-fgd-3 cursor-pointer default-transition h-12 w-12 py-2 px-2 rounded-r-full hover:bg-bkg-3 focus:outline-none`}
                  >
                    <ChevronDownIcon
                      className={`${
                        open ? 'transform rotate-180' : 'transform rotate-360'
                      } default-transition h-5 m-auto ml-1 text-primary-light w-5`}
                    />
                  </Menu.Button>
                  <Menu.Items className="absolute bg-bkg-1 border border-fgd-4 p-2 right-0 top-14 shadow-md outline-none rounded-md w-48 z-20">
                    {filtredOptions.map((x) => (
                      <Menu.Item key={x.label}>
                        <button
                          className="flex default-transition h-9 items-center p-2 w-full hover:bg-bkg-3 hover:cursor-pointer hover:rounded font-normal focus:outline-none"
                          onClick={() => x.callback()}
                        >
                          {x.label}
                        </button>
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </>
              )}
            </Menu>
          </div>
        </>
      )}
    </div>
  )
}

export default DropdownBtn
