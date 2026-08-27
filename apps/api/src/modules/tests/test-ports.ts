export type Clock = Readonly<{ now: () => Date }>;
export type RandomSource = Readonly<{ next: () => number }>;

export const systemClock: Clock = { now: () => new Date() };
export const systemRandom: RandomSource = { next: () => Math.random() };
