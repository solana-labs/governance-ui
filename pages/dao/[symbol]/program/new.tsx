import NewProgramForm from '@components/AssetsList/NewProgramForm'
import React from 'react'

const New = () => {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12 md:col-span-7 lg:col-span-8 space-y-3">
        <NewProgramForm></NewProgramForm>
      </div>
    </div>
  )
}

export default New
