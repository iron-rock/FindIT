import type { UserRole } from '../navigation/types';
import type { I18nKey } from '../lib/i18n/types';

/** Ключи полей мастера регистрации (значения хранятся в FormState). */
export type RegisterFieldKey =
  | 'email'
  | 'password'
  | 'fullName'
  | 'headline'
  | 'years'
  | 'stack'
  | 'position'
  | 'salary'
  | 'workFormat'
  | 'aiTools'
  | 'github'
  | 'company'
  | 'industry'
  | 'contact';

export type RegisterFieldDef = {
  key: RegisterFieldKey;
  labelKey: I18nKey;
  placeholderKey: I18nKey;
  secure?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words';
};

export type RegisterStepDef = {
  id: string;
  titleKey: I18nKey;
  hintKey?: I18nKey;
  fields: RegisterFieldDef[];
  skippable: boolean;
  social?: boolean;
};

const EMAIL_FIELD: RegisterFieldDef = {
  key: 'email',
  labelKey: 'auth.email',
  placeholderKey: 'auth.emailPlaceholder',
  keyboardType: 'email-address',
  autoCapitalize: 'none',
};

const PASSWORD_FIELD: RegisterFieldDef = {
  key: 'password',
  labelKey: 'auth.password',
  placeholderKey: 'auth.passwordPlaceholder',
  secure: true,
  autoCapitalize: 'none',
};

export const FINDER_REGISTER_STEPS: RegisterStepDef[] = [
  {
    id: 'account',
    titleKey: 'register.finder.accountTitle',
    // hintKey: 'register.finder.accountHint',
    fields: [EMAIL_FIELD, PASSWORD_FIELD],
    skippable: false,
    social: true,
  },
  {
    id: 'about',
    titleKey: 'register.finder.aboutTitle',
    // hintKey: 'register.finder.aboutHint',
    skippable: true,
    fields: [
      { key: 'fullName', labelKey: 'register.finder.fullName', placeholderKey: 'register.finder.fullNamePh', autoCapitalize: 'words' },
      { key: 'headline', labelKey: 'register.finder.headline', placeholderKey: 'register.finder.headlinePh' },
      { key: 'years', labelKey: 'register.finder.years', placeholderKey: 'register.finder.yearsPh', keyboardType: 'numeric' },
    ],
  },
  {
    id: 'stack',
    titleKey: 'register.finder.stackTitle',
    // hintKey: 'register.finder.stackHint',
    skippable: true,
    fields: [
      { key: 'stack', labelKey: 'register.finder.stack', placeholderKey: 'register.finder.stackPh' },
      { key: 'position', labelKey: 'register.finder.position', placeholderKey: 'register.finder.positionPh' },
      { key: 'salary', labelKey: 'register.finder.salary', placeholderKey: 'register.finder.salaryPh' },
      { key: 'workFormat', labelKey: 'register.finder.workFormat', placeholderKey: 'register.finder.workFormatPh' },
    ],
  },
  {
    id: 'ai',
    titleKey: 'register.finder.aiTitle',
    // hintKey: 'register.finder.aiHint',
    skippable: true,
    fields: [
      { key: 'aiTools', labelKey: 'register.finder.aiTools', placeholderKey: 'register.finder.aiToolsPh', multiline: true },
    ],
  },
  {
    id: 'vcs',
    titleKey: 'register.finder.vcsTitle',
    // hintKey: 'register.finder.vcsHint',
    skippable: true,
    fields: [
      { key: 'github', labelKey: 'register.finder.github', placeholderKey: 'register.finder.githubPh', autoCapitalize: 'none' },
    ],
  },
];

export const RECRUITER_REGISTER_STEPS: RegisterStepDef[] = [
  {
    id: 'account',
    titleKey: 'register.recruiter.accountTitle',
    // hintKey: 'register.recruiter.accountHint',
    fields: [EMAIL_FIELD, PASSWORD_FIELD],
    skippable: false,
    social: true,
  },
  {
    id: 'company',
    titleKey: 'register.recruiter.companyTitle',
    // hintKey: 'register.recruiter.companyHint',
    skippable: true,
    fields: [
      { key: 'company', labelKey: 'register.recruiter.company', placeholderKey: 'register.recruiter.companyPh', autoCapitalize: 'words' },
      { key: 'industry', labelKey: 'register.recruiter.industry', placeholderKey: 'register.recruiter.industryPh' },
      { key: 'contact', labelKey: 'register.recruiter.contact', placeholderKey: 'register.recruiter.contactPh', autoCapitalize: 'words' },
    ],
  },
];

export const REGISTER_STEPS_BY_ROLE: Record<UserRole, RegisterStepDef[]> = {
  finder: FINDER_REGISTER_STEPS,
  recruiter: RECRUITER_REGISTER_STEPS,
};

export type RegisterFormState = Record<RegisterFieldKey, string>;

export const EMPTY_REGISTER_FORM: RegisterFormState = {
  email: '',
  password: '',
  fullName: '',
  headline: '',
  years: '',
  stack: '',
  position: '',
  salary: '',
  workFormat: '',
  aiTools: '',
  github: '',
  company: '',
  industry: '',
  contact: '',
};
