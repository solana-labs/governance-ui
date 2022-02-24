export const BPF_UPGRADEABLE_LOADER_INSTRUCTIONS = {
  BPFLoaderUpgradeab1e11111111111111111111111: {
    5: {
      name: 'Close buffer',
      accounts: [
        { name: 'Buffer' },
        { name: 'Sol receiver' },
        { name: 'Upgrade authority' },
      ],
      getDataUI: () => {
        return <div></div>
      },
    },
    3: {
      name: 'Program: Upgrade',
      accounts: [
        { name: 'Program Data' },
        { name: 'Program ID' },
        { name: 'Source Buffer' },
        { name: 'Spill Account' },
        { name: 'Sysvar: Rent' },
        { name: 'Sysvar: Clock' },
        { name: 'Upgrade Authority' },
      ],
    },
    getDataUI: () => {
      return <div></div>
    },
  },
}
