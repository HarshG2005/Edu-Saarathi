import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gfg-bg dark:bg-gfg-dark-bg p-4 transition-colors duration-300">
      <Card className="w-full max-w-md border-gfg-border dark:border-gfg-dark-border shadow-gfg-light dark:shadow-gfg-dark bg-gfg-card dark:bg-gfg-dark-card">
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gfg-text dark:text-gfg-dark-text mb-2">Page Not Found</h1>
          <p className="text-gfg-text-light dark:text-gfg-dark-muted mb-6">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link href="/">
            <Button variant="cta" className="w-full sm:w-auto min-w-[140px]">
              Go Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
