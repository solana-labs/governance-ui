import React from 'react'
import RealmWizard from '@components/RealmWizard/RealmWizard'

const New: React.FC = () => {
	const isLoading = false
	return (
		<div className={`w-full flex justify-center bg-bkg-2  ${isLoading ? 'pointer-events-none' : ''}`}>
			<RealmWizard />
		</div>
	)
}

export default New
