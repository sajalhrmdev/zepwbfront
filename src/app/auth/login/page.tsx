"use client";

import { Leaf } from "lucide-react";

import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-900 items-center justify-center p-12">
        <div className="text-center text-white space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm">
            <Leaf className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold">Welcome Back!</h2>
          <p className="text-brand-100 max-w-md mx-auto text-lg">
            Sign in to continue your grocery shopping experience with Zep.
            Freshness delivered to your doorstep.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <LoginForm />
      </div>
    </div>
  );
}
