import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const reservationSchema = z.object({
  equipmentId: z.string().min(1, 'Equipment is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  notes: z.string().max(500, 'Notes must be under 500 characters').optional(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
)

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ReservationInput = z.infer<typeof reservationSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
