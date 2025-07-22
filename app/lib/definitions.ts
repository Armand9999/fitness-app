import zod, { number, z } from 'zod';

export const SignUpSchema = zod.object({
    name: z
        .string()
        .min(2, {message: "Name must be at least 2 characters long."})
        .trim(),
    email: z
        .string()
        .email({ message: "Please enter a valid email address." }).trim(),
    password: z
        .string()
        .min(8, {message: "Password must be at least 8 characters long."})
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        })
        .trim(),
    // confirmPassword: z
    //     .string()
    //     .trim(),
    // }).refine((data) => data.password === data.confirmPassword, {
    //     message: "Passwords do not match.",
    //     path: ["confirmPassword"],
});

export const LoginSchema = zod.object({
    email: z
        .string()
        .email({ message: "Please enter a valid email address." }).trim(),
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