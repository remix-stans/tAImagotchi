// Approval string to be shared across frontend and backend
export const APPROVAL = {
  YES: "Yes, confirmed.",
  NO: "No, denied.",
} as const;

export const INITIAL_STATE = {
  age: 0, // 0 - 5
  mood: 80,
  satiety: 100,
  energy: 100,
  health: 100,
  hygiene: 100,
  poops: 0,
  relationship: 3, // 1 - 5
  personality: "",
  isSleeping: false,
  timezone: "Asia/Tokyo",
  initialized: false,
  lastInteraction: 0,
  lightsOn: true,
  name: "",
  createdAt: 0,
  isAlive: true,
  consecutiveZeroHealthDays: 0,
} as const;

export type State = {
  age: number;
  mood: number;
  satiety: number;
  energy: number;
  health: number;
  hygiene: number;
  poops: number;
  relationship: number;
  personality: string;
  initialized: boolean;
  lastInteraction: number;
  isSleeping: boolean;
  timezone: string;
  lightsOn: boolean;
  name: string;
  createdAt: number;
  isAlive: boolean;
  consecutiveZeroHealthDays: number;
};

export const ACTIONS = {
  FEED: "feed",
  TAKE_MEDICINE: "takeMedicine",
  PLAY: "play",
  CLEAN: "clean",
  CLEAN_POOP: "cleanPoop",
  WORKOUT: "workout",
  LIGHTS_ON: "lightsOn",
  LIGHTS_OFF: "lightsOff",
} as const;
