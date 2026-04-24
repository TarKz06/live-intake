import { z } from "zod";

const phoneRegex = /^\+?[0-9][0-9\s\-()]{6,19}$/;

export const patientSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z.string().trim().optional().or(z.literal("")),
  lastName: z.string().trim().min(1, "Last name is required"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date")
    .refine((v) => new Date(v).getTime() <= Date.now(), "Date cannot be in the future"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Enter a valid phone number"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  address: z.string().trim().min(1, "Address is required"),
  preferredLanguage: z.string().trim().min(1, "Preferred language is required"),
  nationality: z.string().trim().min(1, "Nationality is required"),
  emergencyContactName: z.string().trim().optional().or(z.literal("")),
  emergencyContactRelationship: z.string().trim().optional().or(z.literal("")),
  religion: z.string().trim().optional().or(z.literal("")),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
