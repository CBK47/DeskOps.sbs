import { describe, it, expect } from "vitest";
import { sortStreamsForPicker } from "@/lib/db/streams";

describe("sortStreamsForPicker", () => {
  it("puts non-archived first, then alphabetic", () => {
    const input = [
      { id: "1", name: "Van",      archived: false },
      { id: "2", name: "Personal", archived: false },
      { id: "3", name: "OldThing", archived: true  },
      { id: "4", name: "House",    archived: false },
    ];
    const sorted = sortStreamsForPicker(input);
    expect(sorted.map(s => s.name)).toEqual(["House", "Personal", "Van", "OldThing"]);
  });

  it("returns [] for an empty array", () => {
    expect(sortStreamsForPicker([])).toEqual([]);
  });

  it("sorts alphabetically when everything is archived", () => {
    const input = [
      { id: "1", name: "Van",      archived: true },
      { id: "2", name: "Personal", archived: true },
      { id: "3", name: "House",    archived: true },
    ];
    const sorted = sortStreamsForPicker(input);
    expect(sorted.map(s => s.name)).toEqual(["House", "Personal", "Van"]);
  });

  it("does not mutate the input array", () => {
    const input = [
      { id: "1", name: "Van",      archived: false },
      { id: "2", name: "Personal", archived: false },
      { id: "3", name: "House",    archived: false },
    ];
    const snapshot = input.map(s => s.name);
    sortStreamsForPicker(input);
    expect(input.map(s => s.name)).toEqual(snapshot);
  });
});
