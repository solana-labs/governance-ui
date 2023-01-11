import { useEffect, useState } from 'react'
import { useHeliumVsr } from './useHeliumVsr'
import { Position, getPositions } from '../utils/positions'

export const usePositions = () => {
  const program = useHeliumVsr()
  const [positions, setPositions] = useState<Position[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        if (program) {
          const { positions } = getPositions(program)
          setPositions(positions)
        }
      } catch (e: any) {
        console.log(e)
      }
    })()
  }, [program])

  return positions
}
