export interface LoginResponse {
  userId: number;
  username: string;
  fullName: string;
  role: string;
  token: string;
  email?: string | null;
  phoneNumber?: string | null;
  passwordExpiresAt?: string | null;
  passwordNearExpiry?: boolean;
  passwordExpired?: boolean;
  passwordWarningMessage?: string | null;
}

export interface Household {
  id: number;
  householdNumber: string;
  address: string;
  headPersonId: number | null;
  headPersonName: string | null;
  createdAt: string;
  status: string;
  movedTo: string | null;
  memberCount: number;
}

export interface Person {
  id: number;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationalId: string;
  nationalIdIssuedAt: string | null;
  nationalIdIssuedDate: string | null;
  ethnicity: string;
  religion: string;
  educationLevel: string;
  occupation: string;
  householdId: number | null;
  householdNumber: string | null;
  relationshipToHead: string;
  status: string;
}

export interface PersonDocument {
  id: number;
  personId: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  downloadUrl: string;
}

export interface BirthRecord {
  id: number;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  birthPlace: string | null;
  fatherId: number | null;
  motherId: number | null;
  createdAt: string;
  registeredBy: string;
}

export interface DeathRecord {
  id: number;
  fullName: string;
  dateOfDeath: string;
  reason: string;
  placeOfDeath: string;
  personId: number;
  createdAt: string;
  registeredBy: string;
}

export interface TempResidence {
  id: number;
  personId: number;
  personName: string | null;
  address: string;
  startDate: string;
  endDate: string;
  extendedTo: string | null;
  reason: string;
  status: string;
}

export interface TempAbsence {
  id: number;
  personId: number;
  personName: string | null;
  startDate: string;
  endDate: string;
  extendedTo: string | null;
  reason: string;
  destination: string;
  status: string;
}

export interface AppUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  status: string;
  email?: string | null;
  phoneNumber?: string | null;
  passwordChangedAt: string;
}

export interface SystemLog {
  id: number;
  userId: number | null;
  username: string;
  action: string;
  module: string;
  detail: string | null;
  createdAt: string;
  ipAddress: string;
}

export interface PopulationStats {
  totalPopulation: number;
  maleCount: number;
  femaleCount: number;
  aliveCount: number;
  deadCount: number;
  movedCount: number;
  totalHouseholds: number;
  activeHouseholds: number;
  movedHouseholds: number;
  tempResidentCount: number;
  tempAbsentCount: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  summary: string;
  content: string;
  audienceRole: string | null;
  status: string;
  createdByName: string;
  createdAt: string;
  reviewedByName: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface MeetingEvent {
  id: number;
  title: string;
  agenda: string;
  location: string;
  startsAt: string;
  endsAt: string;
  status: string;
  createdByName: string;
  createdAt: string;
  registrationCount: number;
  isRegistered: boolean;
}

export interface WorkScheduleEntry {
  id: number;
  title: string;
  content: string;
  workDate: string;
  session: string;
  assignedUserId: number | null;
  assignedUserName: string | null;
  createdByName: string;
  createdAt: string;
}

export interface LibraryDocument {
  id: number;
  title: string;
  description: string;
  category: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  downloadUrl: string;
}

export interface FeedbackItem {
  id: number;
  fullName: string;
  contactInfo: string;
  title: string;
  content: string;
  status: string;
  resolutionNote: string | null;
  createdAt: string;
  processedAt: string | null;
  processedByName: string | null;
}

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  category: string;
  description: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CatalogItem {
  id: number;
  type: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserGroup {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  userIds: number[];
  userNames: string[];
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  startDate: string;
  dueDate: string;
  progress: number;
  assignedUserId: number | null;
  assignedUserName: string | null;
  createdByName: string;
  createdAt: string;
}

export interface WorkItem {
  id: number;
  title: string;
  description: string;
  fieldCode: string;
  unitCode: string;
  priority: string;
  status: string;
  startDate: string;
  dueDate: string;
  progress: number;
  assignedUserId: number | null;
  assignedUserName: string | null;
  createdByName: string;
  createdAt: string;
}

export interface TaskKpiStats {
  totalTasks: number;
  completedTasks: number;
  totalWorks: number;
  completedWorks: number;
  overdueTasks: number;
  overdueWorks: number;
  taskCompletionRate: number;
  workCompletionRate: number;
  overallKpiScore: number;
}

export interface ProjectItem {
  id: number;
  name: string;
  description: string;
  sponsor: string;
  budget: number;
  startDate: string;
  endDate: string;
  progress: number;
  status: string;
  managerUserId: number | null;
  managerUserName: string | null;
  createdByName: string;
  createdAt: string;
}

export interface ProposalItem {
  id: number;
  title: string;
  content: string;
  fieldCode: string;
  priority: string;
  status: string;
  submittedByName: string;
  submittedAt: string;
  reviewedByName: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface ProjectProposalStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalProposals: number;
  pendingProposals: number;
  approvedProposals: number;
  totalBudget: number;
  activeProjectBudget: number;
}

export interface StaffProfile {
  id: number;
  userId: number | null;
  fullName: string;
  position: string;
  department: string;
  salaryCoefficient: number;
  bankName: string;
  bankAccount: string;
  email: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaseSalaryRate {
  id: number;
  amount: number;
  effectiveDate: string;
  note: string;
  isActive: boolean;
  createdAt: string;
}

export interface PayrollEntry {
  id: number;
  staffProfileId: number;
  staffName: string;
  month: string;
  baseSalaryAmount: number;
  salaryCoefficient: number;
  allowance: number;
  bonus: number;
  deduction: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface SalaryTransfer {
  id: number;
  payrollEntryId: number;
  staffName: string;
  bankName: string;
  bankAccount: string;
  amount: number;
  transferDate: string;
  status: string;
  referenceCode: string | null;
  note: string | null;
}

export interface HrPayrollStats {
  staffCount: number;
  activeStaffCount: number;
  payrollCount: number;
  transferredPayrollCount: number;
  currentBaseSalary: number;
  monthlyPayrollTotal: number;
}

export interface SystemOverview {
  totalPopulation: number;
  totalHouseholds: number;
  activeTasks: number;
  activeWorks: number;
  activeProjects: number;
  pendingProposals: number;
  staffCount: number;
  monthlyPayrollTotal: number;
  overallKpiScore: number;
}
