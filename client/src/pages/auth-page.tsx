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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";

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
        username: z.string().min(2, "Username must be at least 2 characters"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    });

    const loginForm = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const registerForm = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4 font-sans">
            <div className="w-full max-w-[420px]">
                <Card className="w-full bg-[#0D1B2A] border-[rgba(255,255,255,0.06)] shadow-2xl rounded-xl overflow-hidden">
                    <CardHeader className="space-y-3 pb-6 text-center">
                        <div className="flex justify-center mb-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] ring-1 ring-[#3B82F6]/20">
                                <Brain className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-semibold tracking-tight text-[#E6EEF3]">
                                Welcome back
                            </CardTitle>
                            <CardDescription className="text-[#93A4B2]">
                                Sign in to EduQuest AI to continue learning
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <div className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab("login")}
                                className={`text-sm font-medium py-1.5 rounded-md transition-all ${activeTab === "login"
                                    ? "bg-[#3B82F6] text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setActiveTab("register")}
                                className={`text-sm font-medium py-1.5 rounded-md transition-all ${activeTab === "register"
                                    ? "bg-[#3B82F6] text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Register
                            </button>
                        </div>

                        {activeTab === "login" && (
                            <Form {...loginForm}>
                                <form
                                    onSubmit={loginForm.handleSubmit((data) =>
                                        loginMutation.mutate(data)
                                    )}
                                    className="space-y-4"
                                >
                                    {loginMutation.error && (
                                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2" role="alert">
                                            <span className="font-medium">Error:</span>
                                            {loginMutation.error.message}
                                        </div>
                                    )}
                                    <FormField
                                        control={loginForm.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-xs font-medium text-[#93A4B2]">Username</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="johndoe"
                                                        {...field}
                                                        autoFocus
                                                        className="bg-[#0F172A] border-[rgba(255,255,255,0.06)] focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20 h-10 transition-all text-white"
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
                                                <FormLabel className="text-xs font-medium text-[#93A4B2]">Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            {...field}
                                                            className="bg-[#0F172A] border-[rgba(255,255,255,0.06)] focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20 h-10 pr-10 transition-all relative z-20 text-white"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground z-30"
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
                                            <Checkbox id="remember" className="border-white/20 data-[state=checked]:bg-[#3B82F6] data-[state=checked]:border-[#3B82F6]" />
                                            <label
                                                htmlFor="remember"
                                                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#93A4B2]"
                                            >
                                                Remember me
                                            </label>
                                        </div>
                                        <Button variant="link" className="px-0 font-normal text-xs text-[#3B82F6] h-auto" type="button">
                                            Forgot password?
                                        </Button>
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            className="w-full h-10 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white font-medium shadow-lg shadow-[#3B82F6]/20 transition-all"
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
                                        registerMutation.mutate(data)
                                    )}
                                    className="space-y-4"
                                >
                                    {registerMutation.error && (
                                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2" role="alert">
                                            <span className="font-medium">Error:</span>
                                            {registerMutation.error.message}
                                        </div>
                                    )}
                                    <FormField
                                        control={registerForm.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-xs font-medium text-[#93A4B2]">Username</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="johndoe"
                                                        {...field}
                                                        className="bg-[#0F172A] border-[rgba(255,255,255,0.06)] focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20 h-10 transition-all text-white"
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
                                                <FormLabel className="text-xs font-medium text-[#93A4B2]">Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            {...field}
                                                            className="bg-[#0F172A] border-[rgba(255,255,255,0.06)] focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20 h-10 pr-10 transition-all relative z-20 text-white"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground z-30"
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
                                            className="w-full h-10 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white font-medium shadow-lg shadow-[#3B82F6]/20 transition-all"
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
                    <CardFooter className="bg-muted/20 p-4 border-t border-white/5 flex justify-center">
                        <p className="text-[11px] text-[#93A4B2] text-center">
                            By continuing you agree to our <span className="text-[#3B82F6] hover:underline cursor-pointer">Terms</span> & <span className="text-[#3B82F6] hover:underline cursor-pointer">Privacy Policy</span>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
