export type WeekDayState = "active" | "inactive" | "today" | "upcoming";

export type ConsistencyDay = Readonly<{
  date: Date;
  dateKey: string;
  weekday: string;
  dateNumber: string;
  fullLabel: string;
  state: WeekDayState;
  isActive: boolean;
  isToday: boolean;
  statusLabel: string;
}>;

export type CurrentWeekConsistency = Readonly<{
  days: readonly ConsistencyDay[];
  activeElapsedDays: number;
  elapsedDays: number;
  percentage: number;
}>;

const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const localCalendarDate = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getCurrentWeekConsistency = (
  completedSessionDates: readonly string[],
  now = new Date(),
): CurrentWeekConsistency => {
  const today = localCalendarDate(now);
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - mondayOffset,
  );
  const activeDateKeys = new Set(
    completedSessionDates
      .map((value) => new Date(value))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map(localDateKey),
  );
  const todayKey = localDateKey(today);
  const weekdayFormatter = new Intl.DateTimeFormat("en", { weekday: "short" });
  const fullDateFormatter = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const days = Array.from({ length: 7 }, (_, index): ConsistencyDay => {
    const date = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + index,
    );
    const dateKey = localDateKey(date);
    const isToday = dateKey === todayKey;
    const isUpcoming = date.getTime() > today.getTime();
    const isActive = !isUpcoming && activeDateKeys.has(dateKey);
    const state: WeekDayState = isUpcoming
      ? "upcoming"
      : isToday
        ? "today"
        : isActive
          ? "active"
          : "inactive";
    const statusLabel = isUpcoming
      ? "Upcoming"
      : isToday
        ? isActive
          ? "Today · Studied"
          : "Today · Not studied"
        : isActive
          ? "Studied"
          : "No activity";
    return {
      date,
      dateKey,
      weekday: weekdayFormatter.format(date),
      dateNumber: String(date.getDate()).padStart(2, "0"),
      fullLabel: fullDateFormatter.format(date),
      state,
      isActive,
      isToday,
      statusLabel,
    };
  });
  const elapsedDays = mondayOffset + 1;
  const activeElapsedDays = days
    .slice(0, elapsedDays)
    .filter((day) => day.isActive).length;

  return {
    days,
    activeElapsedDays,
    elapsedDays,
    percentage:
      elapsedDays === 0
        ? 0
        : Math.round((activeElapsedDays / elapsedDays) * 1000) / 10,
  };
};
