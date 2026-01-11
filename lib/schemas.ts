import { z } from 'zod';

export const paymentSchema = z.object({
  // Core Payment Details
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  date: z.date({ required_error: "Payment date is required." }),
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
