import { parseSelectedAiModels } from './aiModelsCatalog';
import { templateFinderGit } from './mockGitActivity';
import type { RegisterFormState } from './registerStepDefs';
import type {
  FinderProfile,
  ProfileByRole,
  RecruiterProfile,
  RoleProfile,
} from '../lib/profileTypes';
import { emptyGit, parseGitProfileUrl } from '../lib/git';
import { emptyLocation } from '../lib/location';
import { sanitizeSalaryDigits } from '../lib/salary';
import type { UserRole } from '../lib/roles';
import { isWorkFormat, type WorkFormat } from '../lib/workFormat';

const FINDER_TEMPLATE: FinderProfile = {
  kind: 'finder',
  displayName: 'Алексей Петров',
  phone: '+7 900 123-45-67',
  location: { country: 'Россия', city: 'Москва' },
  about:
    'Делаю мобильные продукты на React Native и Expo. Люблю чистую архитектуру, быстрые итерации и осознанную работу с ИИ-агентами в повседневной разработке. Ищу команду, где важны качество кода и скорость доставки.',
  selectedAiModels: ['cursorGrok', 'claudeSonnet', 'gptSol'],
  git: templateFinderGit(),
  stack: ['TypeScript', 'React Native', 'Expo', 'Zustand', 'REST'],
  position: 'Senior React Native Developer',
  salary: '260000',
  workFormats: ['hybrid', 'online'],
  yearsExperience: 5,
  cardThemeId: 'classic',
  experience: [
    {
      id: 'exp1',
      title: 'Senior React Native Developer',
      company: 'FinTech Labs',
      employmentType: 'Полная занятость',
      startDate: 'Янв 2022',
      endDate: null,
      location: 'Москва · гибрид',
    },
    {
      id: 'exp2',
      title: 'React Native Developer',
      company: 'Mobile Studio',
      employmentType: 'Полная занятость',
      startDate: 'Мар 2019',
      endDate: 'Дек 2021',
      location: 'Москва',
    },
    {
      id: 'exp3',
      title: 'Frontend Developer',
      company: 'WebAgency',
      employmentType: 'Полная занятость',
      startDate: 'Июн 2017',
      endDate: 'Фев 2019',
      location: 'Москва',
    },
  ],
};

const RECRUITER_TEMPLATE: RecruiterProfile = {
  kind: 'recruiter',
  companyName: 'НейроСофт',
  phone: '+7 900 987-65-43',
  location: { country: 'Россия', city: 'Москва' },
  contactName: 'Марина Ковалёва',
  corpEmail: 'hr@neurosoft.ru',
  companyLink: 'neurosoft.ru',
  industry: 'FinTech · B2B SaaS',
};

export const TEMPLATE_PROFILES: ProfileByRole = {
  finder: FINDER_TEMPLATE,
  recruiter: RECRUITER_TEMPLATE,
};

export function getTemplateProfile(role: UserRole): RoleProfile {
  return structuredClone(TEMPLATE_PROFILES[role]);
}

function parseStackCsv(value: string, fallback: string[]): string[] {
  const parsed = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : fallback;
}

function parseWorkFormatsCsv(value: string, fallback: WorkFormat[]): WorkFormat[] {
  const parsed = value
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(isWorkFormat);
  return parsed.length > 0 ? parsed : fallback;
}

export function buildProfileFromRegistration(
  role: UserRole,
  form: RegisterFormState,
): RoleProfile {
  const template = getTemplateProfile(role);

  if (role === 'finder') {
    const finder = template as FinderProfile;
    const aiModels = parseSelectedAiModels(form.selectedAiModels);
    const parsedGit = parseGitProfileUrl(form.github);
    const git = parsedGit.normalized
      ? { ...emptyGit(), profileUrl: parsedGit.normalized }
      : emptyGit();
    const salaryDigits = sanitizeSalaryDigits(form.salary);

    return {
      ...finder,
      displayName: form.fullName.trim() || finder.displayName,
      phone: form.phone.trim() || finder.phone,
      location: emptyLocation(),
      selectedAiModels: aiModels.length > 0 ? aiModels : finder.selectedAiModels,
      git,
      stack: parseStackCsv(form.stack, finder.stack),
      position: form.position.trim() || finder.position,
      salary: salaryDigits || finder.salary,
      workFormats: parseWorkFormatsCsv(form.workFormat, finder.workFormats),
      yearsExperience: form.years.trim()
        ? Number.parseInt(form.years, 10) || finder.yearsExperience
        : finder.yearsExperience,
    };
  }

  const recruiter = template as RecruiterProfile;
  return {
    ...recruiter,
    companyName: form.company.trim() || recruiter.companyName,
    phone: form.phone.trim() || recruiter.phone,
    location: emptyLocation(),
    contactName: form.contact.trim() || recruiter.contactName,
    corpEmail: form.email.trim() || recruiter.corpEmail,
    companyLink: form.companyLink.trim() || recruiter.companyLink,
    industry: form.industry.trim() || recruiter.industry,
  };
}

/** Значения формы регистрации из шаблона (для префилла при выборе роли). */
export function getTemplateFormPrefill(role: UserRole): Partial<RegisterFormState> {
  const profile = TEMPLATE_PROFILES[role];

  if (role === 'finder') {
    const finder = profile as FinderProfile;
    return {
      fullName: finder.displayName,
      years: String(finder.yearsExperience),
      stack: finder.stack.join(', '),
      position: finder.position ?? '',
      salary: finder.salary ?? '',
      workFormat: finder.workFormats.join(','),
      github: finder.git.profileUrl ?? '',
      selectedAiModels: finder.selectedAiModels.join(','),
    };
  }

  const recruiter = profile as RecruiterProfile;
  return {
    company: recruiter.companyName,
    contact: recruiter.contactName,
    email: recruiter.corpEmail ?? '',
    companyLink: recruiter.companyLink ?? '',
    industry: recruiter.industry ?? '',
  };
}
