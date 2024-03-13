import Button from '@components/Button'
import Link from 'next/link'
import React from 'react'

export const HeliumOverlay = ({ symbol }: { symbol: string }) => {
  if (!symbol || !['HNT', 'IOT', 'MOBILE'].includes(symbol)) {
    return null
  }

  return (
    <div className="flex flex-col h-full w-full justify-center items-center backdrop-blur-md fixed inset-0 z-50 overflow-none">
      <div className="flex flex-col p-6 rounded-md gap-8 max-w-xl bg-black/40 max-md:bg-transparent">
        <div className="flex flex-col flex-1">
          <h1>Helium Vote Has Moved</h1>
          <p className="text-lg">Important Update for the Helium Community</p>
        </div>
        <p className="max-w-md">
          The Helium Vote platform, where our community comes together to shape
          the future of the Network through decision-making, has transitioned to
          a new domain.
        </p>
        <p className="max-w-md">
          This move allows us to dedicate more resources and focus to enhance
          your voting experience, ensuring that every voice is heard more
          clearly and efficiently.
        </p>
        <Link href="https://heliumvote.com/">
          <Button>Join Us at the New Helium Vote</Button>
        </Link>
      </div>
    </div>
  )
}
