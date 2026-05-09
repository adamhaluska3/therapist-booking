const handleLastSession = (lastSessionAt: Date | null): number | null => {
  if (!lastSessionAt) return null;
  if (lastSessionAt.getTime() > Date.now()) return null;
  return lastSessionAt.getTime();
};