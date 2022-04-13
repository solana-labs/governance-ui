import { FunctionComponent } from 'react'

interface TabsProps {
  activeTab: string
  onChange: (x) => void
  tabs: Array<string>
}

const Tabs: FunctionComponent<TabsProps> = ({ activeTab, onChange, tabs }) => {
  return (
    <div className={`border-b border-fgd-4 mb-4 relative`}>
      <div
        className={`absolute bg-primary-light bottom-[-1px] default-transition left-0 h-0.5`}
        style={{
          maxWidth: '176px',
          transform: `translateX(${
            tabs.findIndex((v) => v === activeTab) * 100
          }%)`,
          width: `${100 / tabs.length}%`,
        }}
      />
      <nav className="-mb-px flex" aria-label="Tabs">
        {tabs.map((tabName) => {
          return (
            <a
              key={tabName}
              onClick={() => onChange(tabName)}
              className={`cursor-pointer default-transition flex font-bold justify-center pb-3 relative text-sm whitespace-nowrap hover:opacity-100
                    ${
                      activeTab === tabName
                        ? `text-primary-light`
                        : `text-fgd-3 hover:text-primary-light`
                    }
                  `}
              style={{ width: `${100 / tabs.length}%`, maxWidth: '176px' }}
            >
              {tabName}
            </a>
          )
        })}
      </nav>
    </div>
  )
}

export default Tabs
