export const plantSchedule: Record<string, { name: string; harvestDays: number }> = {
  bean: { name: "French bean", harvestDays: 70 },
  tomato: { name: "Tomato", harvestDays: 90 },
  lavender: { name: "English lavender", harvestDays: 120 },
  lettuce: { name: "Leaf lettuce", harvestDays: 50 },
};

export function addDays(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}
