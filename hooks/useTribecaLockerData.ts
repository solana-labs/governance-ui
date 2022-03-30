import { useCallback, useEffect, useState } from 'react'
import { LockerData } from '@tools/sdk/tribeca/programs'
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration'
import useTribecaPrograms from './useTribecaPrograms'

export default function useTribecaLockerData(
  tribecaConfiguration: ATribecaConfiguration | null
) {
  const { programs } = useTribecaPrograms(tribecaConfiguration)

  const [lockerData, setLockerData] = useState<LockerData | null>(null)

  const loadLockerData = useCallback(async (): Promise<LockerData | null> => {
    if (!programs || !tribecaConfiguration) {
      return null
    }

    return programs.LockedVoter.account.locker.fetch(
      tribecaConfiguration.locker
    )
  }, [programs, tribecaConfiguration])

  useEffect(() => {
    loadLockerData().then(setLockerData)
  }, [loadLockerData])

  return {
    lockerData,
    programs,
  }
}
