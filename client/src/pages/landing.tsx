import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { ArrowRight, BookOpen, Brain, FileText, Lightbulb, Lock, Network, Shield, Zap, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function LandingPage() {
    const { setHasStarted } = useAppStore();
    const [_, setLocation] = useLocation();

    const handleGetStarted = () => {
        setHasStarted(true);
        setLocation("/auth");
    };

    const features = [
        {
            icon: <FileText className="h-6 w-6 text-gfg-green dark:text-gfg-green-light" />,
            title: "Smart MCQs",
            description: "Test your knowledge instantly with AI-generated questions from your materials.",
        },
        {
            icon: <Network className="h-6 w-6 text-purple-500" />,
            title: "AI Mind Maps",
            description: "Visualize complex topics and understand connections effortlessly.",
        },
        {
            icon: <Lightbulb className="h-6 w-6 text-yellow-500" />,
            title: "Flashcards",
            description: "Memorize faster with spaced repetition and active recall.",
        },
        {
            icon: <Brain className="h-6 w-6 text-pink-500" />,
            title: "24/7 AI Tutor",
            description: "Ask questions and get cited answers anytime, anywhere.",
        },
        {
            icon: <BookOpen className="h-6 w-6 text-gfg-green dark:text-gfg-green-light" />,
            title: "Summarizer",
            description: "Get concise summaries of long chapters in seconds.",
        },
        {
            icon: <Zap className="h-6 w-6 text-orange-500" />,
            title: "Instant Sync",
            description: "Cloud-powered access to your study materials from any device.",
        },
    ];

    return (
        <div className="min-h-screen bg-gfg-bg dark:bg-gfg-dark-bg text-gfg-text dark:text-gfg-dark-text font-sans transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-gfg-border dark:border-gfg-dark-border bg-white/95 dark:bg-gfg-dark-card/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gfg-dark-card/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl">
                    <div className="flex items-center gap-2 font-bold text-xl text-gfg-green dark:text-gfg-green-light">
                        <img
                            src="/logo.png"
                            alt="Edu Saarathi Logo"
                            className="h-8 w-auto mix-blend-multiply dark:invert dark:mix-blend-screen"
                        />
                        Edu Saarathi
                    </div>
                    <nav className="hidden md:flex gap-8 text-sm font-medium text-gfg-text dark:text-gfg-dark-text">
                        <a href="#features" className="hover:text-gfg-green dark:hover:text-gfg-green-light transition-colors">Features</a>
                        <a href="#about" className="hover:text-gfg-green dark:hover:text-gfg-green-light transition-colors">About</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Button onClick={handleGetStarted} variant="cta">Get Started</Button>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="py-20 md:py-28 px-4 md:px-6 bg-gfg-bg-secondary dark:bg-gfg-dark-panel overflow-hidden">
                    <div className="container mx-auto max-w-7xl">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-8 text-center lg:text-left"
                            >
                                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl text-gfg-text dark:text-gfg-dark-text leading-tight">
                                    Your AI Charioteer for <span className="text-gfg-green dark:text-gfg-green-light">Academic Success</span>
                                </h1>
                                <p className="text-lg text-gfg-text-light dark:text-gfg-dark-muted md:text-xl max-w-2xl mx-auto lg:mx-0">
                                    Upload any PDF and instantly get personalized quizzes, mind maps, and flashcards. The study tool that learns with you.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                    <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto" onClick={handleGetStarted} variant="cta">
                                        Start Studying for Free <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto border-gfg-green text-gfg-green hover:bg-gfg-green-50 dark:border-gfg-green-light dark:text-gfg-green-light dark:hover:bg-gfg-green/10">
                                        <PlayCircle className="mr-2 h-5 w-5" /> Watch Demo
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Floating UI Mockup */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="relative hidden lg:block"
                            >
                                <div className="relative z-10 bg-white dark:bg-gfg-dark-card rounded-xl shadow-2xl border border-gfg-border dark:border-gfg-dark-border p-2 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                    <div className="grid grid-cols-2 gap-4 h-[400px] overflow-hidden rounded-lg bg-gfg-bg dark:bg-gfg-dark-bg p-4">
                                        {/* Left: PDF View */}
                                        <div className="bg-gray-100 dark:bg-gfg-dark-panel rounded p-3 space-y-2">
                                            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                            <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                            <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded mt-4" />
                                        </div>
                                        {/* Right: AI Chat/MindMap */}
                                        <div className="flex flex-col gap-3">
                                            <div className="bg-gfg-green/10 dark:bg-gfg-green/20 p-3 rounded-lg rounded-tl-none">
                                                <p className="text-xs text-gfg-text dark:text-gfg-dark-text">Here's a mind map of the key concepts from Chapter 4.</p>
                                            </div>
                                            <div className="flex-1 bg-white dark:bg-gfg-dark-panel border border-gfg-border dark:border-gfg-dark-border rounded-lg flex items-center justify-center">
                                                <Network className="h-12 w-12 text-gfg-green dark:text-gfg-green-light opacity-50" />
                                            </div>
                                            <div className="bg-gfg-green text-white p-2 rounded-lg text-center text-xs font-bold">
                                                Generate Quiz
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Decorative blobs */}
                                <div className="absolute -top-10 -right-10 w-72 h-72 bg-gfg-green/20 rounded-full blur-3xl" />
                                <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-20 bg-gfg-bg dark:bg-gfg-dark-bg">
                    <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-gfg-text dark:text-gfg-dark-text">Everything you need to ace your exams</h2>
                            <p className="text-gfg-text-light dark:text-gfg-dark-muted text-lg max-w-2xl mx-auto">
                                We simplify the learning process so you can focus on understanding, not just memorizing.
                            </p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="bg-white dark:bg-gfg-dark-card p-6 rounded-xl border border-gfg-border dark:border-gfg-dark-border shadow-sm hover:shadow-md transition-shadow hover:border-gfg-green dark:hover:border-gfg-green-light"
                                >
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gfg-bg-secondary dark:bg-gfg-dark-panel">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-gfg-text dark:text-gfg-dark-text">{feature.title}</h3>
                                    <p className="text-gfg-text-light dark:text-gfg-dark-muted">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-10 border-t border-gfg-border dark:border-gfg-dark-border bg-white dark:bg-gfg-dark-card">
                    <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl">
                        <div className="flex items-center gap-2 font-bold text-lg text-gfg-text dark:text-gfg-dark-text">
                            <img
                                src="/logo.png"
                                alt="Edu Saarathi Logo"
                                className="h-6 w-auto mix-blend-multiply dark:mix-blend-normal dark:brightness-200"
                            />
                            Edu Saarathi
                        </div>
                        <p className="text-sm text-gfg-text-light dark:text-gfg-dark-muted">
                            © 2024 Edu Saarathi. Cloud-powered and accessible anywhere.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-sm text-gfg-text-light dark:text-gfg-dark-muted hover:text-gfg-green dark:hover:text-gfg-green-light transition-colors">GitHub</a>
                            <a href="#" className="text-sm text-gfg-text-light dark:text-gfg-dark-muted hover:text-gfg-green dark:hover:text-gfg-green-light transition-colors">Twitter</a>
                            <a href="#" className="text-sm text-gfg-text-light dark:text-gfg-dark-muted hover:text-gfg-green dark:hover:text-gfg-green-light transition-colors">Discord</a>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
