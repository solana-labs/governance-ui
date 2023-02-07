import { TypeOf } from 'io-ts';

import * as gql from './gql';

export type Rules = TypeOf<
  typeof gql.getGovernanceRulesResp
>['realmByUrlId']['governance'];
export type CommunityRules = Rules['communityTokenRules'];
export type CouncilRules = Rules['councilTokenRules'];
