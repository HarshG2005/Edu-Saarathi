import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { ArrowRight, BookOpen, Brain, FileText, Lightbulb, Lock, Network, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export function LandingPage() {
    const { setHasStarted } = useAppStore();
    const [_, setLocation] = useLocation();

    const handleGetStarted = () => {
        setHasStarted(true);
        setLocation("/auth");
    };

    const features = [
        {
            icon: <FileText className="h-6 w-6 text-blue-500" />,
            title: "MCQ Generator",
            description: "Instantly generate multiple choice questions from your PDF textbooks.",
        },
        {
            icon: <Lightbulb className="h-6 w-6 text-yellow-500" />,
            title: "Flashcards",
            description: "Create study decks automatically to master key concepts.",
        },
        {
            icon: <Network className="h-6 w-6 text-purple-500" />,
            title: "Mindmaps",
            description: "Visualize connections between topics with auto-generated concept maps.",
        },
        {
            icon: <Brain className="h-6 w-6 text-pink-500" />,
            title: "AI Tutor",
            description: "Chat with your documents to clarify doubts and get explanations.",
        },
        {
            icon: <BookOpen className="h-6 w-6 text-green-500" />,
            title: "Summarizer",
            description: "Get concise summaries of long chapters in seconds.",
        },
        {
            icon: <Lock className="h-6 w-6 text-orange-500" />,
            title: "Local & Private",
            description: "Run 100% offline with Ollama. Your data never leaves your device.",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Brain className="h-5 w-5" />
                        </div>
                        EduQuest AI
                    </div>
                    <nav className="hidden md:flex gap-6 text-sm font-medium">
                        <a href="#features" className="hover:text-primary transition-colors">Features</a>
                        <a href="#privacy" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#about" className="hover:text-primary transition-colors">About</a>
                    </nav>
                    <Button onClick={handleGetStarted}>Get Started</Button>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="py-20 md:py-32 px-4 md:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="container mx-auto max-w-4xl space-y-6"
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl">
                            Your <span className="text-primary">Local-First</span> AI <br className="hidden md:block" /> Study Companion
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                            Transform your PDF textbooks into interactive quizzes, flashcards, and mindmaps.
                            Secure, private, and offline-capable.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Button size="lg" className="h-12 px-8 text-lg" onClick={handleGetStarted}>
                                Start Studying Now <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                                Learn More
                            </Button>
                        </div>
                    </motion.div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-20 bg-white dark:bg-muted/10">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Everything you need to ace your exams</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
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
                                    className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trust/Security Section */}
                <section id="privacy" className="py-20">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Private by Design</h2>
                                <p className="text-lg text-muted-foreground">
                                    Unlike other AI tools, EduQuest AI is built to run locally on your machine.
                                    Connect to Ollama for a completely offline experience where your documents never leave your device.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-green-500" />
                                        <span className="font-medium">No data collection or tracking</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-blue-500" />
                                        <span className="font-medium">Works without internet connection</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Lock className="h-5 w-5 text-purple-500" />
                                        <span className="font-medium">Your files stay on your computer</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="relative h-[400px] rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-background border flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                                <Shield className="h-32 w-32 text-primary opacity-20" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-10 border-t bg-muted/20">
                    <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2 font-bold text-lg">
                            <Brain className="h-5 w-5 text-primary" />
                            EduQuest AI
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2024 EduQuest AI. Open source and local-first.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">GitHub</a>
                            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Twitter</a>
                            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Discord</a>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
