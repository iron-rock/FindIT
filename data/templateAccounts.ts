import { parseSelectedAiTools } from './aiToolsCatalog';
import type { RegisterFormState } from './registerStepDefs';
import type {
  FinderProfile,
  ProfileByRole,
  RecruiterProfile,
  RoleProfile,
} from '../lib/profileTypes';
import type { UserRole } from '../lib/roles';

const FINDER_TEMPLATE: FinderProfile = {
  kind: 'finder',
  displayName: 'Алексей Петров',
  headline: 'Senior React Native',
  selectedAiTools: ['cursor', 'claude'],
  gitlabUrl: 'gitlab.com/alexey-petrov',
  stack: ['TypeScript', 'React Native', 'Expo', 'Zustand', 'REST'],
  position: 'Senior React Native Developer',
  salary: 'от 260 000 ₽',
  workFormat: 'Москва · гибрид',
  yearsExperience: 5,
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

export function buildProfileFromRegistration(
  role: UserRole,
  form: RegisterFormState,
): RoleProfile {
  const template = getTemplateProfile(role);

  if (role === 'finder') {
    const finder = template as FinderProfile;
    const aiTools = parseSelectedAiTools(form.selectedAiTools);
    const gitlab = form.github.trim();

    return {
      ...finder,
      displayName: form.fullName.trim() || finder.displayName,
      headline: form.headline.trim() || finder.headline,
      selectedAiTools: aiTools.length > 0 ? aiTools : finder.selectedAiTools,
      gitlabUrl: gitlab || finder.gitlabUrl,
      stack: parseStackCsv(form.stack, finder.stack),
      position: form.position.trim() || finder.position,
      salary: form.salary.trim() || finder.salary,
      workFormat: form.workFormat.trim() || finder.workFormat,
      yearsExperience: form.years.trim()
        ? Number.parseInt(form.years, 10) || finder.yearsExperience
        : finder.yearsExperience,
    };
  }

  const recruiter = template as RecruiterProfile;
  return {
    ...recruiter,
    companyName: form.company.trim() || recruiter.companyName,
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
      headline: finder.headline ?? '',
      years: String(finder.yearsExperience),
      stack: finder.stack.join(', '),
      position: finder.position ?? '',
      salary: finder.salary ?? '',
      workFormat: finder.workFormat ?? '',
      selectedAiTools: finder.selectedAiTools.join(','),
      github: finder.gitlabUrl ?? '',
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
