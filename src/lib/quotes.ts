const QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Discipline is choosing between what you want now and what you want most.",
  "Champions keep playing until they get it right.",
  "The pain of discipline is far less than the pain of regret.",
  "Success is the sum of small efforts repeated day in and day out.",
  "You don't have to be great to start, but you have to start to be great.",
  "Hard work beats talent when talent doesn't work hard.",
  "Every champion was once a contender who refused to give up.",
];

function dayOfYear(date: Date): number {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

export function getDailyQuote(): string {
  return QUOTES[dayOfYear(new Date()) % QUOTES.length];
}
