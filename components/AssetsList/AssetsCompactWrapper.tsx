import AssetsList from './AssetsList'
import { ChevronRightIcon } from '@heroicons/react/solid'
import useRealm from '@hooks/useRealm'
import useQueryContext from '@hooks/useQueryContext'
import Link from 'next/link'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { AccountType } from '@utils/uiTypes/assets'

const AssetsCompactWrapper = () => {
  const { fmtUrlWithCluster } = useQueryContext()

  const { symbol } = useRealm()

  const { assetAccounts } = useGovernanceAssets()
  const programGovernances = assetAccounts
    .filter((x) => x.type === AccountType.PROGRAM)
    .map((x) => x.governance)

  return programGovernances.length < 1 ? (
    <></>
  ) : (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <div className="flex items-center justify-between pb-4">
        <h3 className="mb-0">Programs</h3>

        <Link href={fmtUrlWithCluster(`/dao/${symbol}/assets`)}>
          <a
            className={`default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3`}
          >
            View
            <ChevronRightIcon className="flex-shrink-0 h-6 w-6" />
          </a>
        </Link>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: '350px' }}>
        <AssetsList panelView />
      </div>
      )
    </div>
  )
}

export default AssetsCompactWrapper
