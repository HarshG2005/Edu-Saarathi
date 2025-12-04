import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
                        <div className="rounded-full bg-destructive/10 p-4 mb-4">
                            <AlertCircle className="h-10 w-10 text-destructive" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                        <p className="text-muted-foreground max-w-md mb-4">
                            {this.state.error?.message || "An unexpected error occurred."}
                        </p>
                        <Button onClick={() => window.location.reload()}>Reload Page</Button>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}
