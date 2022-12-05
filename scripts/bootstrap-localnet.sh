#!/bin/bash
set -e

# use locally compiled solana binaries to access new program dump features
export PATH="../solana/target/debug:$PATH"

output_path="dump"

# clean up data from previous runs
rm -rf $output_path

# download solana-lab's versions of spl-governance as well as mango's versions of spl-governance & VSR
for program_id in GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J 4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo
do
 echo "downloading program binary and accounts to $output_path/$program_id"
 mkdir -p $output_path/$program_id/accounts
 solana program dump-executable $program_id $output_path/$program_id/program.so
 solana program dump-owned-accounts $program_id $output_path/$program_id/accounts
done

# save wallet used for simulation of VSR accounts
solana account -o $output_path/GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw/accounts/ENmcpFCpxN1CqyUjuog9yyUVfdXBKF3LVCwLr7grJZpk.json --output json ENmcpFCpxN1CqyUjuog9yyUVfdXBKF3LVCwLr7grJZpk

# find token accounts & mints to download through parsing all governances of the realm
export OUT=$output_path
export GOV_PROGRAM_ID=GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J
export VSR_PROGRAM_ID=4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo
export REALM_ID=DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE
yarn ts-node scripts/governance-dump.ts || exit

# launch a local validator
solana-test-validator --reset \
  --bpf-program GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw $output_path/GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw/program.so \
  --bpf-program GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J $output_path/GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J/program.so \
  --bpf-program 4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo $output_path/4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo/program.so \
  --account-dir $output_path/GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw/accounts \
  --account-dir $output_path/GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J/accounts \
  --account-dir $output_path/4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo/accounts
