import * as Yup from "yup";

export const emailSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
});

export const loginSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const setPasswordSchema = Yup.object({
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

export const registerSchema = Yup.object({
  full_name: Yup.string().min(2, "Name must be at least 2 characters").required("Full name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

export const customerSchema = Yup.object({
  company_name: Yup.string().min(2, "Company name must be at least 2 characters").required("Company name is required"),
  contact_name: Yup.string().min(2, "Contact name must be at least 2 characters").required("Contact name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  phone: Yup.string().optional(),
  industry: Yup.string().optional(),
  status: Yup.string().oneOf(["active", "inactive", "lead", "churned"]).required("Status is required"),
});

export const interactionSchema = Yup.object({
  customer_id: Yup.string().required("Customer is required"),
  title: Yup.string().min(3, "Title must be at least 3 characters").required("Title is required"),
  interaction_type: Yup.string().oneOf(["meeting", "call", "email", "demo", "support"]).required("Type is required"),
  meeting_date: Yup.string().required("Meeting date is required"),
  meeting_notes: Yup.string().optional(),
});

export const interactionUpdateSchema = Yup.object({
  title: Yup.string().min(3, "Title must be at least 3 characters").required("Title is required"),
  interaction_type: Yup.string().oneOf(["meeting", "call", "email", "demo", "support"]).required("Type is required"),
  meeting_date: Yup.string().required("Meeting date is required"),
  meeting_notes: Yup.string().optional(),
});
