import { z } from "zod";

// ============================================================
// TERAMAP - Zod Validation Schemas
// ============================================================

// Auth
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string(),
  organizationName: z.string().min(2, "Nama organisasi minimal 2 karakter"),
  organizationType: z.enum(["GOVERNMENT", "PRIVATE", "BUSINESS", "INDIVIDUAL"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

// Organization
export const organizationSchema = z.object({
  name: z.string().min(2, "Nama organisasi minimal 2 karakter"),
  type: z.enum(["GOVERNMENT", "PRIVATE", "BUSINESS", "INDIVIDUAL"]),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  street: z.string().optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  logoUrl: z.string().optional(),
  defaultTeraValidity: z.number().min(1).max(3650).default(365),
  signatureName: z.string().optional(),
  signatureTitle: z.string().optional(),
  signatureName2: z.string().optional(),
  signatureTitle2: z.string().optional(),
  signatureName3: z.string().optional(),
  signatureTitle3: z.string().optional(),
  letterNumberPrefix: z.string().optional(),
  letterNumberMiddle: z.string().optional(),
  letterNumberSuffix: z.string().optional(),
});

// Equipment
export const equipmentSchema = z.object({
  name: z.string().min(2, "Nama alat minimal 2 karakter"),
  type: z.string().min(1, "Jenis alat harus diisi"),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().min(1, "Nomor seri harus diisi"),
  capacity: z.string().optional(),
  divisionValue: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  street: z.string().optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
});

// Tera History
export const teraHistorySchema = z.object({
  equipmentId: z.string().min(1, "ID alat harus diisi"),
  testDate: z.string().or(z.date()),
  result: z.enum(["PASS", "FAIL", "CONDITIONAL"]),
  officerName: z.string().min(2, "Nama petugas minimal 2 karakter"),
  notes: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// User Management
export const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  role: z.enum(["ORGANIZATION_OWNER", "ADMIN_INSTANSI", "STAFF", "VIEWER"]),
});

export const setupPasswordSchema = z.object({
  token: z.string().min(1, "Token tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").optional(),
  email: z.string().email("Email tidak valid").optional(),
  role: z.enum(["ORGANIZATION_OWNER", "ADMIN_INSTANSI", "STAFF", "VIEWER"]).optional(),
  isActive: z.boolean().optional(),
});

// Document Template
export const documentTemplateSchema = z.object({
  name: z.string().min(2, "Nama template minimal 2 karakter"),
  type: z.string().min(1, "Tipe template harus diisi"),
  headerHtml: z.string(),
  bodyHtml: z.string(),
  footerHtml: z.string(),
});

// System Settings
export const systemSettingSchema = z.object({
  subscriptionPrice: z.number().min(0),
  defaultTeraValidity: z.number().min(1).max(3650),
  maintenanceMode: z.boolean().optional(),
  enabledPaymentChannels: z.string().optional(),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OrganizationInput = z.infer<typeof organizationSchema>;
export type EquipmentInput = z.infer<typeof equipmentSchema>;
export type TeraHistoryInput = z.infer<typeof teraHistorySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DocumentTemplateInput = z.infer<typeof documentTemplateSchema>;
export type SystemSettingInput = z.infer<typeof systemSettingSchema>;
