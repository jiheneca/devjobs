import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["DEVELOPER", "COMPANY"], { message: "Role must be DEVELOPER or COMPANY" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  salary: z.number().optional(),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"], { message: "Invalid job type" }),
})

export const companyProfileSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  logo: z.string().url("Invalid logo URL").optional().or(z.literal("")),
  description: z.string().optional(),
})

export const developerProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  about: z.string().optional(),
})
