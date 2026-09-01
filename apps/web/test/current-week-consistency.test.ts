import { describe, expect, it } from "vitest";
import { getCurrentWeekConsistency } from "../src/current-week-consistency";

const localIso = (year: number, monthIndex: number, day: number, hour = 12) =>
  new Date(year, monthIndex, day, hour).toISOString();

describe("TEST-018 current-week learning consistency", () => {
  it("generates a Monday-to-Sunday week and identifies today", () => {
    const result = getCurrentWeekConsistency([], new Date(2026, 8, 2, 12));

    expect(result.days.map((day) => day.weekday)).toEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ]);
    expect(result.days.map((day) => day.dateNumber)).toEqual([
      "31",
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
    ]);
    expect(result.days[2]).toMatchObject({
      isToday: true,
      state: "today",
      statusLabel: "Today · Not studied",
    });
  });

  it("separates active, past inactive, today, and upcoming states", () => {
    const result = getCurrentWeekConsistency(
      [localIso(2026, 7, 31), localIso(2026, 8, 2)],
      new Date(2026, 8, 2, 12),
    );

    expect(result.days[0]).toMatchObject({ state: "active", isActive: true });
    expect(result.days[1]).toMatchObject({
      state: "inactive",
      statusLabel: "No activity",
    });
    expect(result.days[2]).toMatchObject({
      state: "today",
      isActive: true,
      statusLabel: "Today · Studied",
    });
    expect(result.days[3]).toMatchObject({
      state: "upcoming",
      isActive: false,
    });
    expect(result).toMatchObject({
      activeElapsedDays: 2,
      elapsedDays: 3,
      percentage: 66.7,
    });
  });

  it("counts multiple sessions on one local day once and excludes future days", () => {
    const result = getCurrentWeekConsistency(
      [
        localIso(2026, 8, 1, 8),
        localIso(2026, 8, 1, 20),
        localIso(2026, 8, 5, 8),
      ],
      new Date(2026, 8, 2, 12),
    );

    expect(result).toMatchObject({
      activeElapsedDays: 1,
      elapsedDays: 3,
      percentage: 33.3,
    });
    expect(result.days[5]).toMatchObject({
      state: "upcoming",
      isActive: false,
    });
  });

  it("handles empty activity and the minimum safe Monday denominator", () => {
    const result = getCurrentWeekConsistency([], new Date(2026, 7, 31, 9));

    expect(result).toMatchObject({
      activeElapsedDays: 0,
      elapsedDays: 1,
      percentage: 0,
    });
    expect(Number.isFinite(result.percentage)).toBe(true);
  });

  it("handles a week crossing a year boundary", () => {
    const result = getCurrentWeekConsistency([], new Date(2026, 0, 1, 12));

    expect(result.days.map((day) => day.dateKey)).toEqual([
      "2025-12-29",
      "2025-12-30",
      "2025-12-31",
      "2026-01-01",
      "2026-01-02",
      "2026-01-03",
      "2026-01-04",
    ]);
  });

  it("maps session instants to the user-facing local calendar date", () => {
    const localSession = new Date(2026, 8, 1, 0, 30);
    const result = getCurrentWeekConsistency(
      [localSession.toISOString(), "not-a-date"],
      new Date(2026, 8, 1, 12),
    );

    expect(result.days[1]).toMatchObject({
      dateKey: "2026-09-01",
      isToday: true,
      isActive: true,
    });
    expect(result.percentage).toBe(50);
  });
});
