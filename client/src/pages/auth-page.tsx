import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthPage() {
    const { user, loginMutation, registerMutation } = useAuth();
    const [_, setLocation] = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState("login");

    useEffect(() => {
        if (user) {
            setLocation("/");
        }
    }, [user, setLocation]);

    const formSchema = z.object({
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    });

    const loginForm = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const registerForm = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gfg-bg dark:bg-gfg-dark-bg p-4 font-sans transition-colors duration-300">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-[420px]">
                <Card className="w-full shadow-gfg-light dark:shadow-gfg-dark border-gfg-border dark:border-gfg-dark-border bg-gfg-card dark:bg-gfg-dark-card">
                    <CardHeader className="space-y-3 pb-6 text-center">

                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold tracking-tight text-gfg-text dark:text-gfg-dark-text">
                                Welcome back
                            </CardTitle>
                            <CardDescription className="text-gfg-text-light dark:text-gfg-dark-muted">
                                Sign in to Edu Saarathi to continue learning
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <div className="grid w-full grid-cols-2 mb-6 bg-gfg-bg dark:bg-gfg-dark-panel p-1 rounded-lg border border-gfg-border dark:border-gfg-dark-border">
                            <button
                                onClick={() => setActiveTab("login")}
                                className={`text-sm font-medium py-1.5 rounded-md transition-all ${activeTab === "login"
                                    ? "bg-white dark:bg-gfg-dark-card text-gfg-green dark:text-gfg-green-light shadow-sm border border-gfg-border dark:border-gfg-dark-border"
                                    : "text-gfg-text-light dark:text-gfg-dark-muted hover:text-gfg-text dark:hover:text-gfg-dark-text"
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setActiveTab("register")}
                                className={`text-sm font-medium py-1.5 rounded-md transition-all ${activeTab === "register"
                                    ? "bg-white dark:bg-gfg-dark-card text-gfg-green dark:text-gfg-green-light shadow-sm border border-gfg-border dark:border-gfg-dark-border"
                                    : "text-gfg-text-light dark:text-gfg-dark-muted hover:text-gfg-text dark:hover:text-gfg-dark-text"
                                    }`}
                            >
                                Register
                            </button>
                        </div>

                        {activeTab === "login" && (
                            <Form {...loginForm}>
                                <form
                                    onSubmit={loginForm.handleSubmit((data) =>
                                        loginMutation.mutate(data as any)
                                    )}
                                    className="space-y-4"
                                >
                                    {loginMutation.error && (
                                        <div className="bg-destructive/10 text-destructive dark:bg-red-900/20 dark:text-red-400 text-sm p-3 rounded-md flex items-center gap-2" role="alert">
                                            <span className="font-medium">Error:</span>
                                            {loginMutation.error.message}
                                        </div>
                                    )}
                                    <FormField
                                        control={loginForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-xs font-bold text-gfg-text dark:text-gfg-dark-text">Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="john@example.com"
                                                        {...field}
                                                        autoFocus
                                                        className="h-10"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={loginForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-xs font-bold text-gfg-text dark:text-gfg-dark-text">Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            {...field}
                                                            className="h-10 pr-10"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gfg-text-light dark:text-gfg-dark-muted hover:text-gfg-green dark:hover:text-gfg-green-light z-30"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="remember" className="border-gfg-border dark:border-gfg-dark-border data-[state=checked]:bg-gfg-green dark:data-[state=checked]:bg-gfg-green-light data-[state=checked]:border-gfg-green dark:data-[state=checked]:border-gfg-green-light" />
                                            <label
                                                htmlFor="remember"
                                                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gfg-text-light dark:text-gfg-dark-muted"
                                            >
                                                Remember me
                                            </label>
                                        </div>
                                        <Button variant="link" className="px-0 font-normal text-xs text-gfg-green dark:text-gfg-green-light h-auto" type="button">
                                            Forgot password?
                                        </Button>
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            className="w-full h-10 font-bold shadow-md"
                                            variant="cta"
                                            disabled={loginMutation.isPending}
                                        >
                                            {loginMutation.isPending ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Signing in...</span>
                                                </div>
                                            ) : (
                                                "Sign in"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        )}

                        {activeTab === "register" && (
                            <Form {...registerForm}>
                                <form
                                    onSubmit={registerForm.handleSubmit((data) =>
                                        registerMutation.mutate(data as any)
                                    )}
                                    className="space-y-4"
                                >
                                    {registerMutation.error && (
                                        <div className="bg-destructive/10 text-destructive dark:bg-red-900/20 dark:text-red-400 text-sm p-3 rounded-md flex items-center gap-2" role="alert">
                                            <span className="font-medium">Error:</span>
                                            {registerMutation.error.message}
                                        </div>
                                    )}
                                    <FormField
                                        control={registerForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-xs font-bold text-gfg-text dark:text-gfg-dark-text">Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="john@example.com"
                                                        {...field}
                                                        className="h-10"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={registerForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-xs font-bold text-gfg-text dark:text-gfg-dark-text">Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            {...field}
                                                            className="h-10 pr-10"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gfg-text-light dark:text-gfg-dark-muted hover:text-gfg-green dark:hover:text-gfg-green-light z-30"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            className="w-full h-10 font-bold shadow-md"
                                            variant="cta"
                                            disabled={registerMutation.isPending}
                                        >
                                            {registerMutation.isPending ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Creating account...</span>
                                                </div>
                                            ) : (
                                                "Create Account"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                    <CardFooter className="bg-gfg-bg dark:bg-gfg-dark-panel p-4 border-t border-gfg-border dark:border-gfg-dark-border flex justify-center rounded-b-lg">
                        <p className="text-[11px] text-gfg-text-light dark:text-gfg-dark-muted text-center">
                            By continuing you agree to our <span className="text-gfg-green dark:text-gfg-green-light hover:underline cursor-pointer">Terms</span> & <span className="text-gfg-green dark:text-gfg-green-light hover:underline cursor-pointer">Privacy Policy</span>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
