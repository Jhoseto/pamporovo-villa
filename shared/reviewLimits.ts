/** Max characters for guest review body (website + admin). */
export const REVIEW_BODY_MAX = 300;

/** Characters shown on carousel cards before „read more“. */
export const REVIEW_BODY_PREVIEW = 160;

export function truncateReviewPreview(text: string, max = REVIEW_BODY_PREVIEW): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  const slice = trimmed.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut}…`;
}

export function reviewNeedsExpand(text: string, max = REVIEW_BODY_PREVIEW): boolean {
  return text.trim().length > max;
}
