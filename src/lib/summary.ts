import type { DailyEntry } from "./types";

export function summarizeRecentData(entries: DailyEntry[]): string {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentEntries = entries.filter(
    (e) => new Date(e.date) >= thirtyDaysAgo
  );

  let loggedDays = recentEntries.length;
  let bleedingDays = 0;
  const symptoms: Record<string, number> = {};
  let moodSum = 0;
  let moodCount = 0;

  recentEntries.forEach((entry) => {
    if (entry.periodFlag) bleedingDays++;
    if (entry.mood !== undefined) {
      moodSum += entry.mood;
      moodCount++;
    }
    if (entry.symptoms) {
      entry.symptoms.forEach((s) => {
        symptoms[s] = (symptoms[s] || 0) + 1;
      });
    }
  });

  const topSymptoms = Object.entries(symptoms)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => `${name} (${count}x)`)
    .join(", ");

  const avgMood = moodCount > 0 ? (moodSum / moodCount).toFixed(1) : "N/A";

  return `Over the past 30 days, the user logged symptoms on ${loggedDays} days. Bleeding/period was logged on ${bleedingDays} days. Key symptoms reported: ${topSymptoms || "None"}. Average mood rating was ${avgMood}/5.`;
}
