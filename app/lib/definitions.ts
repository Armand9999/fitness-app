import { z } from 'zod';

export const SignUpSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, {message: "Name must be at least 2 characters long."}),
    email: z
        .string()
        .trim()
        .email({ message: "Please enter a valid email address." }),
    password: z
        .string()
        .trim()
        .min(8, {message: "Password must be at least 8 characters long."})
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        }),
    // confirmPassword: z
    //     .string()
    //     .trim(),
    // }).refine((data) => data.password === data.confirmPassword, {
    //     message: "Passwords do not match.",
    //     path: ["confirmPassword"],
});

export const LoginSchema = z.object({
    email: z
        .string()
        .trim()
        .email({ message: "Please enter a valid email address." }),
    password: z
        .string()
        .trim(),
})

export type FormState = 
| {
    errors?: {
        name?: string[],
        email?: string[],
        password?: string[],

    }
} | undefined

export type Profile = {
    age: string 
    weight_kg: string
    height_cm: string
    gender: string
    activity_level: string,
    goal: string,
}