import { ScreenTimeConversion } from '../types';

export const SCREEN_TIME_CONVERSIONS: ScreenTimeConversion[] = [
  { points: 10, minutes: 15, label: '15 min' },
  { points: 20, minutes: 30, label: '30 min' },
  { points: 30, minutes: 45, label: '45 min' },
  { points: 40, minutes: 60, label: '1 hora' },
  { points: 60, minutes: 90, label: '1h30' },
  { points: 80, minutes: 120, label: '2 horas' },
];

export function calculateScreenTime(points: number): { minutes: number; label: string } {
  // Find the highest tier the user qualifies for
  let earnedMinutes = 0;
  let earnedLabel = '0 min';

  for (const tier of SCREEN_TIME_CONVERSIONS) {
    if (points >= tier.points) {
      earnedMinutes = tier.minutes;
      earnedLabel = tier.label;
    } else {
      break;
    }
  }

  return { minutes: earnedMinutes, label: earnedLabel };
}

export function getNextTier(points: number): { pointsNeeded: number; reward: string } | null {
  for (const tier of SCREEN_TIME_CONVERSIONS) {
    if (points < tier.points) {
      return {
        pointsNeeded: tier.points - points,
        reward: tier.label,
      };
    }
  }
  return null; // Already at max tier
}
