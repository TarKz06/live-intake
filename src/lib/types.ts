export type PatientStatus = "active" | "inactive" | "submitted";

export interface PatientData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  phone?: string;
  email?: string;
  address?: string;
  preferredLanguage?: string;
  nationality?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  religion?: string;
}

export interface PatientSession {
  id: string;
  data: PatientData;
  status: PatientStatus;
  updatedAt: number;
  submittedAt?: number;
}
