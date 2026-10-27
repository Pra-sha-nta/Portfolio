/**
 * Single source of truth for every factual claim on this site.
 * Everything here traces to Prashanta_Resume_August_2026.pdf or the previous
 * live site. Nothing is invented. If a fact is not in the CV, it is not here.
 */

export const profile = {
  name: 'Prashanta Parajuli',
  role: 'Associate QA Engineer',
  location: 'Gatthaghar, Bhaktapur',
  email: 'parajuliprashant9@gmail.com',
  phone: '+977 9848092717',
  phoneHref: '+9779848092717',
  site: 'https://www.prashantaparajuli.com.np',
  cv: '/Prashanta-Parajuli-QA-Engineer-CV.pdf',
  links: {
    linkedin: 'https://www.linkedin.com/in/prashanta-parajuli-99a366295/',
    github: 'https://github.com/Pra-sha-nta',
    instagram: 'https://www.instagram.com/prashant_unscripted/',
  },
  /** CV PROFILE section, condensed for the hero. */
  intro:
    'I test web applications the way they actually break: across roles, permissions and API boundaries. Functional, regression, API, integration and role-based access testing across multiple business platforms.',
} as const;

/** Platforms named under the Associate QA Engineer role in the CV. */
export const platforms = [
  'EMIS',
  'Avani Cricket Club',
  'Official Global Partner',
  'ACAN',
  'TravelQuoter',
  'EkERP',
  'Payroll',
] as const;

export const about = {
  lead:
    'Associate QA Engineer and BCA student with hands-on experience testing web applications across functional, regression, API, integration, negative and role-based access scenarios.',
  body: [
    'My focus is end-to-end workflows: what happens when a real user moves through a whole business process, under a real role, with real permissions. That is where the defects that matter tend to live.',
    'I work in Postman, Jira and Browser DevTools, design and execute test cases, maintain a Requirements Traceability Matrix, and stay with a defect through its full lifecycle - reproduction, reporting, retesting and regression verification.',
  ],
} as const;

/**
 * Headline finding, worded at exactly the abstraction level of the CV.
 * No client name, no reproduction detail, no severity inflation.
 */
export const finding = {
  severity: 'HIGH',
  label: 'Authorization / Sensitive data exposure',
  title: 'Privileged authentication data exposed through a public API response',
  body:
    'While testing role and permission behaviour across application users, I found privileged authentication information being returned in a publicly accessible API response - data that no unauthenticated caller should ever receive.',
  outcome:
    'Reported through the standard defect process with reproduction steps and evidence, then retested and verified after the fix.',
  note: 'Reported and resolved through the normal defect lifecycle. Client and technical detail withheld.',
} as const;

export const experience = [
  {
    title: 'Associate QA Engineer',
    company: 'Ek ra Sunya Inc',
    period: '02/2026 - Present',
    location: 'Kathmandu, Nepal',
    current: true,
    platforms,
    points: [
      'Performed functional, regression, integration, negative, exploratory and end-to-end testing across multiple web applications and business modules.',
      'Designed and executed test cases covering positive and negative scenarios, edge cases, validation rules, business logic, authentication, authorization and role-based access control.',
      'Performed API testing using Postman, validating HTTP methods, request/response payloads, status codes, authentication, error handling and data consistency.',
      'Conducted role and permission testing across different application users and modules, identifying unauthorized access and privilege-related defects.',
      'Used Browser DevTools to inspect network requests, API responses and client-side behaviour during defect investigation.',
      'Tested complete business workflows across multiple modules and user roles to validate end-to-end functionality and data flow.',
      'Reported and tracked defects in Jira, documenting reproduction steps, severity, expected vs. actual results and evidence.',
      'Collaborated with developers throughout the defect lifecycle, including bug reproduction, retesting, regression testing and verification of fixes.',
      'Maintained a Requirements Traceability Matrix (RTM) and test documentation to ensure adequate test coverage.',
      'Identified high-severity authorization and sensitive-data exposure issues, including unintended exposure of privileged authentication information through a publicly accessible API response.',
    ],
  },
  {
    title: 'QA Intern',
    company: 'Ek ra Sunya Inc',
    period: '11/2025 - 02/2026',
    location: 'Kathmandu, Nepal',
    current: false,
    platforms: [],
    points: [
      'Conducted manual functional and regression testing across web application modules.',
      'Designed test scenarios, identified defects and performed retesting after fixes.',
      'Collaborated with developers throughout the defect lifecycle and maintained clear defect documentation.',
    ],
  },
  {
    title: 'IT Intern - QA-Relevant Activities',
    company: 'Business Interest Group of Industries Ltd.',
    period: '02/2025 - 06/2025',
    location: 'Nepal',
    current: false,
    platforms: [],
    points: [
      'Tested company websites for UI/UX inconsistencies, functional issues and technical errors.',
      'Gathered requirements and communicated defects and findings with the development team.',
    ],
  },
] as const;

/** Grouped from the CV's QA SKILLS and QA TOOLS sections. */
export const skillGroups = [
  {
    id: 'testing',
    label: 'Testing disciplines',
    items: [
      'Manual & Functional Testing',
      'Test Case Design & Execution',
      'Regression Testing',
      'Integration Testing',
      'End-to-End Testing',
      'Negative & Edge-Case Testing',
      'Exploratory Testing',
    ],
  },
  {
    id: 'security',
    label: 'Access & business logic',
    items: [
      'Role-Based Access Control (RBAC) Testing',
      'Authentication & Authorization Testing',
      'Business Logic Testing',
      'API Testing',
      'UI/UX Testing',
    ],
  },
  {
    id: 'process',
    label: 'Process & documentation',
    items: [
      'Requirements Traceability (RTM)',
      'Defect Lifecycle Management',
      'SDLC & STLC',
      'Requirement Gathering',
    ],
  },
] as const;

export const tools = [
  { name: 'Postman', use: 'API testing', slug: 'postman', colour: 'FF6C37' },
  { name: 'Jira', use: 'Test management', slug: 'jira', colour: '0052CC' },
  { name: 'Browser DevTools', use: 'Debugging', slug: 'googlechrome', colour: '4285F4' },
  { name: 'GitHub', use: 'Version control', slug: 'github', colour: 'FFFFFF' },
  { name: 'SQL / MySQL', use: 'Database', slug: 'mysql', colour: '4479A1' },
  { name: 'Playwright', use: 'Automation - learning', slug: 'playwright', colour: '2EAD33', learning: true },
] as const;

export const education = [
  {
    school: 'Swoyambhu International College (TU)',
    qualification: 'Bachelor in Computer Application (BCA)',
    period: '2022 - Present',
    result: null,
  },
  {
    school: 'Khwopa Secondary School (NEB)',
    qualification: '+2 in Science',
    period: '2020 - 2021',
    result: 'CGPA 3.21',
  },
  {
    school: 'Shree Indrenee Vidya Mandir (NEB)',
    qualification: 'SEE',
    period: '2019',
    result: 'CGPA 3.85',
  },
] as const;

export const certifications = [
  {
    title: 'Web Application Awareness',
    body: 'Understanding of CRUD operations, HTTP methods and client-server flow, relevant to functional and API testing.',
  },
  {
    title: 'Professional Communication Training',
    body: 'Enhanced verbal clarity and confidence in defect reporting and cross-team communication.',
  },
] as const;

/** Student/learning repos. Deliberately kept separate from professional QA work. */
export const repos = [
  {
    name: 'JS for Automation',
    description:
      'JavaScript fundamentals worked through specifically to move toward Playwright automation.',
    tags: ['JavaScript', 'Playwright'],
    url: 'https://github.com/Pra-sha-nta/JS-For-Automation',
  },
  {
    name: 'WearShare',
    description:
      'E-commerce project for renting and reselling unused clothing. Coursework build.',
    tags: ['HTML', 'CSS', 'JS', 'PHP'],
    url: 'https://github.com/Pra-sha-nta/WearShare',
  },
  {
    name: 'BookTopia',
    description: 'A book reading platform. Coursework build.',
    tags: ['Web'],
    url: 'https://github.com/Pra-sha-nta/BookTopia',
  },
  {
    name: 'React JS',
    description: 'Working through React fundamentals.',
    tags: ['React'],
    url: 'https://github.com/Pra-sha-nta/React-JS',
  },
] as const;

export const references = [
  {
    name: 'Rajkumar Shah',
    title: 'Program Coordinator, Swoyambhu International College',
  },
  {
    name: 'Sambhu Khanal',
    title: 'Secretary, Business Interest Group of Industries',
  },
] as const;

export const nav = [
  { label: 'Profile', href: '#about' },
  { label: 'Record', href: '#experience' },
  { label: 'Case file', href: '#finding' },
  { label: 'Method', href: '#skills' },
  { label: 'Learning', href: '#projects' },
  { label: 'Contact', href: '#contact' },
] as const;

/**
 * Contact overlay configuration. Every address is reused from `profile`, so
 * there is exactly one place to change an email or link.
 */
export const contact = {
  availability:
    'Open to Junior, Manual and Associate QA Engineer roles, and to software testing positions in Kathmandu or remote.',
  projectSubject: 'Project enquiry via prashantaparajuli.com.np',
} as const;

export const seo = {
  title: 'Prashanta Parajuli - Associate QA Engineer',
  description:
    'Associate QA Engineer in Kathmandu, Nepal. Functional, regression, API, integration and role-based access testing across business web platforms. Postman, Jira, RTM, defect lifecycle.',
  ogImage: '/og.png',
} as const;
