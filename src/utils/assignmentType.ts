export const SubmissionFileState = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  RETURNED: 'RETURNED',
  GRADED: 'GRADED',
} as const;

export type SubmissionFileState = (typeof SubmissionFileState)[keyof typeof SubmissionFileState];

export const isFileStateEditable = (state: SubmissionFileState | undefined | null): boolean =>
  state === SubmissionFileState.DRAFT || state === SubmissionFileState.RETURNED;

export const isFileStateUploadAllowed = (state: SubmissionFileState | undefined | null): boolean =>
  state === SubmissionFileState.DRAFT ||
  state === SubmissionFileState.RETURNED ||
  state === SubmissionFileState.GRADED;
