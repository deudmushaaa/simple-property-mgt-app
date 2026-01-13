import { z } from 'zod';

export const paymentSchema = z.object({
  // Core Payment Details
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  date: z.date(),
  type: z.string().min(1, "Payment type is required."),
  months: z.array(z.string()).min(1, "Please select at least one month."),

  // Relational IDs
  userId: z.string().min(1, "User ID is required."),
  tenantId: z.string().min(1, "Please select a tenant."),
  propertyId: z.string().min(1, "Property could not be found for the selected tenant."),

  // Denormalized Fields for read-optimization
  tenantName: z.string().min(1, "Tenant name is required."),
  propertyName: z.string().min(1, "Property name is required."),
  unitName: z.string().optional(), // A tenant may not always have a unit assigned
});

export type PaymentInput = z.infer<typeof paymentSchema>;

export const propertySchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1, "Property name is required."),
  address: z.string().min(1, "Address is required."),
  units: z.array(z.object({
    name: z.string().min(1)
  })).min(1, "At least one unit is required."),
  createdAt: z.date().optional()
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const tenantSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1, "Tenant name is required."),
  phone: z.string().length(10, "Phone number must be exactly 10 digits."),
  dueDay: z.number().min(1).max(31),
  propertyId: z.string().min(1, "Property selection is required."),
  unitName: z.string().min(1, "Unit selection is required."),
  propertyName: z.string().min(1, "Property name is required.")
});

export type TenantInput = z.infer<typeof tenantSchema>;
