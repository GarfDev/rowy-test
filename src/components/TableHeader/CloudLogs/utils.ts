import { atomWithHash } from "jotai/utils";
import { sub } from "date-fns";

import type { IProjectContext } from "@src/contexts/ProjectContext";

export const modalAtom = atomWithHash<"cloudLogs" | "">("modal", "");

export type CloudLogFilters = {
  type: "webhook" | "audit" | "build";
  timeRange:
    | { type: "seconds" | "minutes" | "hours" | "days"; value: number }
    | { type: "range"; start: Date; end: Date };
  webhook?: string[];
  auditRowId?: string;
  buildLogExpanded?: number;
};

export const cloudLogFiltersAtom = atomWithHash<CloudLogFilters>(
  "cloudLogFilters",
  {
    type: "build",
    timeRange: { type: "days", value: 7 },
  }
);

export const cloudLogFetcher = (
  endpointRoot: string,
  rowyRun: IProjectContext["rowyRun"],
  cloudLogFilters: CloudLogFilters,
  tablePath: string
) => {
  // https://cloud.google.com/logging/docs/view/logging-query-language
  let logQuery: string[] = [];

  switch (cloudLogFilters.type) {
    case "webhook":
      logQuery.push(`logName = "projects/rowyio/logs/rowy-webhook-events"`);
      logQuery.push(`jsonPayload.url : "${tablePath}"`);
      if (
        Array.isArray(cloudLogFilters.webhook) &&
        cloudLogFilters.webhook.length > 0
      )
        logQuery.push(
          cloudLogFilters.webhook
            .map((id) => `jsonPayload.url : "${id}"`)
            .join(encodeURIComponent(" OR "))
        );
      break;

    case "audit":
      logQuery.push(`logName = "projects/rowyio/logs/rowy-audit"`);
      logQuery.push(`jsonPayload.ref.collectionPath = "${tablePath}"`);
      if (cloudLogFilters.auditRowId)
        logQuery.push(
          `jsonPayload.ref.rowId = "${cloudLogFilters.auditRowId}"`
        );
      break;

    // logQuery.push(`resource.labels.function_name="R-githubStars"`);

    default:
      break;
  }

  if (cloudLogFilters.timeRange.type === "range") {
  } else {
    try {
      const minDate = sub(new Date(), {
        [cloudLogFilters.timeRange.type]: cloudLogFilters.timeRange.value,
      });
      logQuery.push(`timestamp >= "${minDate.toISOString()}"`);
    } catch (e) {
      console.error("Failed to calculate minimum date", e);
    }
  }

  const logQueryUrl =
    endpointRoot +
    (logQuery.length > 0
      ? `?filter=${logQuery
          .map((item) => `(${item})`)
          .join(encodeURIComponent("\n"))}`
      : "");

  if (rowyRun)
    return rowyRun<Record<string, any>[]>({
      route: { path: logQueryUrl, method: "GET" },
    });

  return [];
};
