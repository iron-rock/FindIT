import type { UserRole } from '../navigation/types';
import type { I18nKey } from '../lib/i18n/types';

/** Ключи полей мастера регистрации (значения хранятся в FormState). */
export type RegisterFieldKey =
  | 'phone'
  | 'phoneCountry'
  | 'otpCode'
  | 'email'
  | 'password'
  | 'fullName'
  | 'headline'
  | 'years'
  | 'stack'
  | 'position'
  | 'salary'
  | 'workFormat'
  | 'selectedAiTools'
  | 'selectedAiModels'
  | 'aiTools'
  | 'github'
  | 'company'
  | 'companyLink'
  | 'industry'
  | 'contact';

export type RegisterFieldDef = {
  key: RegisterFieldKey;
  labelKey: I18nKey;
  placeholderKey: I18nKey;
  secure?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
};

export type RegisterStepKind = 'form' | 'verify' | 'highlights';

export type RegisterStepDef = {
  id: string;
  kind?: RegisterStepKind;
  titleKey?: I18nKey;
  hintKey?: I18nKey;
  fields: RegisterFieldDef[];
  skippable: boolean;
  social?: boolean;
};

const OTP_FIELD: RegisterFieldDef = {
  key: 'otpCode',
  labelKey: 'auth.otp',
  placeholderKey: 'auth.otpPlaceholder',
  keyboardType: 'phone-pad',
  autoCapitalize: 'none',
};

const VERIFY_STEP: RegisterStepDef = {
  id: 'verify',
  kind: 'verify',
  titleKey: 'auth.verifyPhoneTitle',
  hintKey: 'auth.verifyPhoneHint',
  fields: [OTP_FIELD],
  skippable: false,
};

const GITHUB_FIELD: RegisterFieldDef = {
  key: 'github',
  labelKey: 'register.finder.github',
  placeholderKey: 'register.finder.githubPh',
  autoCapitalize: 'none',
};

/** Регистрация finder: подтверждение телефона → ИИ + GitHub. Остальное — в профиле. */
export const FINDER_REGISTER_STEPS: RegisterStepDef[] = [
  VERIFY_STEP,
  {
    id: 'highlights',
    kind: 'highlights',
    skippable: false,
    fields: [GITHUB_FIELD],
  },
];

const CORP_EMAIL_FIELD: RegisterFieldDef = {
  key: 'email',
  labelKey: 'register.recruiter.corpEmail',
  placeholderKey: 'register.recruiter.corpEmailPh',
  keyboardType: 'email-address',
  autoCapitalize: 'none',
};

const COMPANY_NAME_FIELD: RegisterFieldDef = {
  key: 'company',
  labelKey: 'register.recruiter.company',
  placeholderKey: 'register.recruiter.companyPh',
  autoCapitalize: 'words',
};

const COMPANY_LINK_FIELD: RegisterFieldDef = {
  key: 'companyLink',
  labelKey: 'register.recruiter.companyLink',
  placeholderKey: 'register.recruiter.companyLinkPh',
  autoCapitalize: 'none',
};

/** Регистрация recruiter: подтверждение телефона → данные компании. */
export const RECRUITER_REGISTER_STEPS: RegisterStepDef[] = [
  VERIFY_STEP,
  {
    id: 'company',
    skippable: false,
    fields: [CORP_EMAIL_FIELD, COMPANY_NAME_FIELD, COMPANY_LINK_FIELD],
  },
];

export const REGISTER_STEPS_BY_ROLE: Record<UserRole, RegisterStepDef[]> = {
  finder: FINDER_REGISTER_STEPS,
  recruiter: RECRUITER_REGISTER_STEPS,
};

export type RegisterFormState = Record<RegisterFieldKey, string>;

export const EMPTY_REGISTER_FORM: RegisterFormState = {
  phone: '',
  phoneCountry: 'RU',
  otpCode: '',
  email: '',
  password: '',
  fullName: '',
  headline: '',
  years: '',
  stack: '',
  position: '',
  salary: '',
  workFormat: '',
  selectedAiTools: '',
  selectedAiModels: '',
  aiTools: '',
  github: '',
  company: '',
  companyLink: '',
  industry: '',
  contact: '',
};

/** Макс. число точек до выбора роли (finder: account + 2 шага). */
export const REGISTER_DOTS_PLACEHOLDER = 3;
