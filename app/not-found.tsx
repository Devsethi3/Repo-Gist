"use client";

import Link from "next/link";
import { Home, MessageSquare, ArrowLeft, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const NotFoundPage = () => {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full text-center">
          {/* 404 Visual */}
          <div className="relative mx-auto mb-8">
            {/* Floating channels decoration */}
            <div className="absolute -top-4 -left-4 sm:-left-8 opacity-20 animate-float-slow">
              <Hash className="size-8 sm:size-10 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 sm:-right-6 opacity-15 animate-float-slower">
              <Hash className="size-6 sm:size-8 text-muted-foreground" />
            </div>
            <div className="absolute -bottom-2 left-4 opacity-10 animate-float">
              <MessageSquare className="size-5 sm:size-6 text-primary" />
            </div>

            {/* Main 404 */}
            <div className="relative">
              <h1 className="text-[120px] sm:text-[160px] font-bold leading-none tracking-tighter text-muted-foreground/20 select-none">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background px-4 py-2 rounded-lg border shadow-sm">
                  <span className="text-sm sm:text-base font-medium text-muted-foreground">
                    #page-not-found
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">
            This page doesn&apos;t exist
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-sm mx-auto">
            The page you&apos;re looking for might have been moved, deleted, or
            never existed in the first place.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild variant="default" className="w-full sm:w-auto">
              <Link href="/" className="gap-2">
                <Home className="size-4" />
                Go to Home
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2"
              onClick={handleGoBack}
            >
              <ArrowLeft className="size-4" />
              Go Back
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-4 sm:px-6 py-4">
        <p className="text-center text-xs sm:text-sm text-muted-foreground">
          Lost? Try searching or check your workspace channels.
        </p>
      </footer>

      {/* Minimal floating animation styles */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(5deg);
          }
        }
        @keyframes float-slower {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(-5deg);
          }
        }
        :global(.animate-float) {
          animation: float 3s ease-in-out infinite;
        }
        :global(.animate-float-slow) {
          animation: float-slow 4s ease-in-out infinite;
        }
        :global(.animate-float-slower) {
          animation: float-slower 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
