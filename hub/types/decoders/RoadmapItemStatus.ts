import * as IT from 'io-ts';

import { RoadmapItemStatus as _RoadmapItemStatus } from '../RoadmapItemStatus';

export const RoadmapItemStatusCompleted = IT.literal(
  _RoadmapItemStatus.Completed,
);
export const RoadmapItemStatusDelayed = IT.literal(_RoadmapItemStatus.Delayed);
export const RoadmapItemStatusInProgress = IT.literal(
  _RoadmapItemStatus.InProgress,
);
export const RoadmapItemStatusUpcoming = IT.literal(
  _RoadmapItemStatus.Upcoming,
);

export const RoadmapItemStatus = IT.union([
  RoadmapItemStatusCompleted,
  RoadmapItemStatusDelayed,
  RoadmapItemStatusInProgress,
  RoadmapItemStatusUpcoming,
]);
