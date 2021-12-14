export const saveState = (appState) => {
  console.log('saving state', appState)
  try {
    const serializedState = JSON.stringify(appState)

    console.log('saving state', serializedState, appState)

    localStorage.setItem('governance-state', serializedState)
  } catch (error) {
    console.error('<!> Error saving state', error)
  }
}

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('governance-state')

    if (!serializedState) {
      return null
    }

    return JSON.parse(serializedState)
  } catch (error) {
    console.error('<!> Error getting state', error)

    return null
  }
}
