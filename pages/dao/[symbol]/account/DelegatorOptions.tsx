import SelectPrimaryDelegators from '@components/SelectPrimaryDelegators'
import { SHOW_DELEGATORS_LIST } from '@constants/flags'
import { useTokenOwnerRecordsDelegatedToUser } from '@hooks/queries/tokenOwnerRecord'
import DelegatorsList from './DelegatorsList'

const DelegatorOptions = () => {
  const delegatesArray = useTokenOwnerRecordsDelegatedToUser()

  return delegatesArray === undefined || delegatesArray.length < 1 ? null : (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <h3 className="mb-4">Delegation Options</h3>
      <SelectPrimaryDelegators />
      {SHOW_DELEGATORS_LIST ? <DelegatorsList /> : ''}
    </div>
  )
}

export default DelegatorOptions
