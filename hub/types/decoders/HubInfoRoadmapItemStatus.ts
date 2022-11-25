import * as IT from 'io-ts';

import { HubInfoRoadmapItemStatus as _HubInfoRoadmapItemStatus } from '../HubInfoRoadmapItemStatus';

export const HubInfoRoadmapItemStatusCompleted = IT.literal(
  _HubInfoRoadmapItemStatus.Completed,
);
export const HubInfoRoadmapItemStatusDelayed = IT.literal(
  _HubInfoRoadmapItemStatus.Delayed,
);
export const HubInfoRoadmapItemStatusInProgress = IT.literal(
  _HubInfoRoadmapItemStatus.InProgress,
);
export const HubInfoRoadmapItemStatusUpcoming = IT.literal(
  _HubInfoRoadmapItemStatus.Upcoming,
);

export const HubInfoRoadmapItemStatus = IT.union([
  HubInfoRoadmapItemStatusCompleted,
  HubInfoRoadmapItemStatusDelayed,
  HubInfoRoadmapItemStatusInProgress,
  HubInfoRoadmapItemStatusUpcoming,
]);
