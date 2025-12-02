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
import { Brain, Shield, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
    const { user, loginMutation, registerMutation } = useAuth();
    const [_, setLocation] = useLocation();
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="flex items-center justify-center p-8">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 font-bold text-2xl mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Brain className="h-6 w-6" />
                            </div>
                            EduQuest AI
                        </div>
                        <CardTitle className="text-2xl">Welcome back</CardTitle>
                        <CardDescription>
                            Sign in to your account to continue learning
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="register">Register</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <Form {...loginForm}>
                                    <form
                                        onSubmit={loginForm.handleSubmit((data) =>
                                            loginMutation.mutate(data)
                                        )}
                                        className="space-y-4"
                                    >
                                        <FormField
                                            control={loginForm.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Username</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="johndoe" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={loginForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type={showPassword ? "text" : "password"}
                                                                {...field}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={loginMutation.isPending}
                                        >
                                            {loginMutation.isPending ? "Logging in..." : "Login"}
                                        </Button>
                                    </form>
                                </Form>
                            </TabsContent>

                            <TabsContent value="register">
                                <Form {...registerForm}>
                                    <form
                                        onSubmit={registerForm.handleSubmit((data) =>
                                            registerMutation.mutate(data)
                                        )}
                                        className="space-y-4"
                                    >
                                        <FormField
                                            control={registerForm.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Username</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="johndoe" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={registerForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type={showPassword ? "text" : "password"}
                                                                {...field}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={registerMutation.isPending}
                                        >
                                            {registerMutation.isPending ? "Creating account..." : "Create Account"}
                                        </Button>
                                    </form>
                                </Form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
            <div className="hidden lg:flex flex-col justify-center p-12 bg-muted">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="relative h-[400px] rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-background border flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                        <Shield className="h-32 w-32 text-primary opacity-20" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter">Secure & Private</h2>
                        <p className="text-muted-foreground text-lg">
                            Your study data is encrypted and stored locally. Access your quizzes, flashcards, and notes securely.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
