// Product Finder answers, saved when the quiz finishes (GetStartedForm) and sent with the
// estimate request (GetEstimatePage), then cleared so they don't ride along with a later one.

const STORAGE_KEY = 'projectory:finder-answers';

type FinderAnswers = { type: string[]; objectives: string[]; seating: string[] };

const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

export function saveFinderAnswers(answers: FinderAnswers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  } catch {
    // Storage unavailable (private mode, quota): the estimate goes without quiz answers.
  }
}

// Tolerates every way storage can fail or lie, like readStoredLikes in LikedProductsContext.
export function readFinderAnswers(): FinderAnswers | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return undefined;
    const { type, objectives, seating } = parsed as Record<string, unknown>;
    if (isStringList(type) && isStringList(objectives) && isStringList(seating)) {
      return { type, objectives, seating };
    }
  } catch {
    // Malformed JSON or storage unavailable.
  }
  return undefined;
}

export function clearFinderAnswers() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: nothing to clear.
  }
}
