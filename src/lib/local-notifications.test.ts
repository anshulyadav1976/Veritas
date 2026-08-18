import { describe, expect, it } from "vitest";

import { notificationUpdateState, parseNotificationUpdates } from "./local-notifications";

const id = "7814f7ef-95e5-4a59-8e2b-21e5cdf0ac70";

describe("local notification state", () => {
  it("notifies only a previously seen followed story that changed", () => {
    const state = notificationUpdateState([{ id, headline: "Bridge closure", updatedAt: "2026-08-18T12:00:00.000Z" }], [id], { [id]: "2026-08-18T11:00:00.000Z" });
    expect(state.changed).toHaveLength(1);
    expect(state.next).toEqual({ [id]: "2026-08-18T12:00:00.000Z" });
  });
  it("does not trust malformed local state", () => expect(parseNotificationUpdates("not json")).toEqual({}));
});
