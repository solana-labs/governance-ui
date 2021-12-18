import { ArrowLeftIcon } from '@heroicons/react/outline'
import { ViewState } from './types'
import useMembersListStore from 'stores/useMembersListStore'

const AddMember = () => {
  const { setCurrentCompactView, resetCompactViewState } = useMembersListStore()

  const handleGoBackToMainView = async () => {
    setCurrentCompactView(ViewState.MainView)
    resetCompactViewState()
  }
  return (
    <>
      <h3 className="mb-4 flex items-center hover:cursor-pointer">
        <>
          <ArrowLeftIcon
            onClick={handleGoBackToMainView}
            className="h-4 w-4 mr-1 text-primary-light mr-2"
          />
          Add new member
        </>
      </h3>
    </>
  )
}

export default AddMember
