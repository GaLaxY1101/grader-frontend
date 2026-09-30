export const AssignmentType = {
  CODE: 'CODE',
  FILE: 'FILE',
  CODE_FILE: 'CODE_FILE',
} as const;

export type AssignmentType = (typeof AssignmentType)[keyof typeof AssignmentType];

export const supportsCode = (type: AssignmentType | undefined | null): boolean =>
  type === AssignmentType.CODE || type === AssignmentType.CODE_FILE;

export const supportsFiles = (type: AssignmentType | undefined | null): boolean =>
  type === AssignmentType.FILE || type === AssignmentType.CODE_FILE;

export const SubmissionFileState = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  RETURNED: 'RETURNED',
  GRADED: 'GRADED',
} as const;

export type SubmissionFileState = (typeof SubmissionFileState)[keyof typeof SubmissionFileState];

export const isFileStateEditable = (state: SubmissionFileState | undefined | null): boolean =>
  state === SubmissionFileState.DRAFT || state === SubmissionFileState.RETURNED;
