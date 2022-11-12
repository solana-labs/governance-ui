import React from 'react'
import * as Dropdown from '@radix-ui/react-dropdown-menu'
import { DotsVerticalIcon } from '@heroicons/react/solid'

interface Props {
  triggerButton: React.ReactNode
  children: React.ReactNode[] | React.ReactNode
}

const DropdownMenu: React.FC<Props> = (props) => {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button aria-label="Further Options">
          <DotsVerticalIcon className=" h-4 w-4" />
        </button>
      </Dropdown.Trigger>

      <Dropdown.Content
        className="DropdownMenuContent"
        side="top"
        sideOffset={5}
      >
        {Array.isArray(props.children) ? (
          props.children?.map((menuItem: React.ReactNode) => (
            <Dropdown.Item
              className="DropdownMenuItem"
              key={menuItem?.toString()}
            >
              {menuItem}
            </Dropdown.Item>
          ))
        ) : (
          <Dropdown.Item
            className="DropdownMenuItem"
            key={props.children?.toString()}
          >
            {props.children}
          </Dropdown.Item>
        )}
      </Dropdown.Content>
    </Dropdown.Root>
  )
}

export default DropdownMenu
