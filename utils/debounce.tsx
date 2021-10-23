class Debounce {
  typingTimeout: null | ReturnType<typeof setTimeout>
  debounce: Debounce
  constructor() {
    this.typingTimeout = null
    return this.debounce
  }
  debounceFcn = (callback) => {
    if (!callback) {
      console.log('missing argument callback')
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout)
    }
    this.typingTimeout = setTimeout(() => {
      callback()
    }, 900)
  }
}
export const debounce = new Debounce()
