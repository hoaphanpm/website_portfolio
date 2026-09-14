export type CaseFieldsState = {
  error: string | null;
  success: boolean;
};

export const caseFieldsInitialState: CaseFieldsState = {
  error: null,
  success: false,
};

export type SectionFormState = {
  error: string | null;
  success: boolean;
};

export const sectionFormInitialState: SectionFormState = {
  error: null,
  success: false,
};
