"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Mail, Lock, User, Terminal } from "lucide-react"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultIsSignUp?: boolean
}

export function UserAuthForm({ className, defaultIsSignUp = false, ...props }: UserAuthFormProps) {
    const router = useRouter()
    const [isSignUp, setIsSignUp] = React.useState(defaultIsSignUp)
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setError(null)

        try {
            if (isSignUp) {
                // Sign Up Logic
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    values.email,
                    values.password
                )
                // Optional: Update profile with a default display name if needed
                // await updateProfile(userCredential.user, { displayName: "User" })
            } else {
                // Login Logic
                await signInWithEmailAndPassword(auth, values.email, values.password)
            }

            router.push("/dashboard") // Redirect to dashboard on success
        } catch (err: any) {
            console.error(err)
            let message = "An error occurred. Please try again."
            if (err.code === "auth/email-already-in-use") {
                message = "This email is already in use."
            } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
                message = "Invalid email or password."
            } else if (err.code === "auth/weak-password") {
                message = "Password is too weak."
            } else if (err.code === "auth/user-not-found") {
                message = "No user found with this email."
            }
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleMode = () => {
        setIsSignUp(!isSignUp)
        setError(null)
        form.reset()
    }

    return (
        <div className={cn("flex justify-center items-center w-full p-4", className)} {...props}>
            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">
                        {isSignUp ? "Create an account" : "Welcome back"}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {isSignUp
                            ? "Enter your email below to create your account"
                            : "Enter your email and password to access your account"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {error && (
                        <Alert variant="destructive">
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="name@example.com"
                                                    className="pl-9"
                                                    autoCapitalize="none"
                                                    autoComplete="email"
                                                    autoCorrect="off"
                                                    disabled={isLoading}
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="password"
                                                    placeholder="********"
                                                    className="pl-9"
                                                    autoComplete={isSignUp ? "new-password" : "current-password"}
                                                    disabled={isLoading}
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSignUp ? "Sign Up" : "Sign In"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <div className="text-sm text-center text-muted-foreground">
                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        <Button
                            variant="link"
                            className="p-0 h-auto font-semibold text-primary underline-offset-4 hover:underline"
                            onClick={toggleMode}
                            disabled={isLoading}
                            type="button"
                        >
                            {isSignUp ? "Login" : "Sign Up"}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
