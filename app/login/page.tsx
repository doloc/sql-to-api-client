import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-5">
              <div className="relative z-20 flex items-center text-lg font-semibold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-6 w-6"
                >
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                </svg>
                API Configuration Manager
              </div>
              <div className="relative z-20 mt-auto">
                <blockquote className="space-y-2">
                  <p className="text-lg">
                    &ldquo;This platform has transformed how we manage our API configurations, making it simpler and more secure than ever.&rdquo;
                  </p>
                  <footer className="text-sm">TuLVA, CTO - TNEX Future</footer>
                </blockquote>
              </div>
            </div>
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] md:w-[500px]">
              <LoginForm />
            </div>
          </div>
        </section>
      </main>
      <footer className="flex h-14 items-center border-t px-4 md:px-6">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Admin Tool. All rights reserved.
        </p>
      </footer>
    </div>
  );
}