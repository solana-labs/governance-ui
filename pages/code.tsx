import { useEffect } from 'react'

export default function Code() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.replace(
        'https://docs.google.com/forms/d/e/1FAIpQLSf_BP5Oi1WiXxm6VlfZWhxJmZBpHrl8fLMN3dLWKIwu-g-3Tw/viewform'
      )
    }
  }, [])

  return null
}
