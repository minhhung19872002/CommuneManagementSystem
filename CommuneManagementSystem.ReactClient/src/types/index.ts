export interface LoginResponse {
  userId: number;
  username: string;
  fullName: string;
  role: string;
  token: string;
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
