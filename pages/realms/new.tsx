import React from 'react'
import RealmWizard from '@components/RealmWizard/RealmWizard'

const New: React.FC = () => {
  const isLoading = false
  return (
    <div
      className={`bg-bkg-2 col-span-12 md:col-span-7 md:order-first lg:col-span-8 order-last p-4 md:p-6 rounded-lg space-y-3 ${
        isLoading ? 'pointer-events-none' : ''
      }`}
    >
      <RealmWizard />
    </div>
  )
}

export default New
