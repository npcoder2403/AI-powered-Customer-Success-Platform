"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Formik, Form } from "formik";
import { register } from "@/src/store/authSlice";
import { AppDispatch, RootState } from "@/src/store/store";
import { Zap, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import FormField from "@/src/components/ui/FormField";
import Button from "@/src/components/ui/Button";
import { registerSchema } from "@/src/utils/validationSchemas";

export default function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[480px] bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CS Platform</span>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Start building better customer relationships today
          </h2>
          <p className="text-lg text-slate-400">
            Create your free account and unlock AI-powered insights.
          </p>
        </div>

        <div className="relative text-sm text-slate-500">&copy; 2024 Customer Success Platform</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">CS Platform</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1.5 mb-8">Get started with Customer Success Platform</p>

          <Formik
            initialValues={{ full_name: "", email: "", password: "", confirmPassword: "" }}
            validationSchema={registerSchema}
            onSubmit={async (values, { setStatus }) => {
              setStatus(undefined);
              const result = await dispatch(register({ full_name: values.full_name, email: values.email, password: values.password }));
              if (register.fulfilled.match(result)) {
                toast.success("Account created successfully!");
                router.push("/dashboard");
              } else {
                const msg = (result.payload as string) || "Registration failed";
                setStatus(msg);
                toast.error(msg);
              }
            }}
          >
            {({ status }) => (
            <Form className="space-y-5" noValidate>
              {status && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                  {status}
                </div>
              )}
              <FormField name="full_name" type="text" label="Full Name" placeholder="John Doe" required />
              <FormField name="email" type="email" label="Email Address" placeholder="you@example.com" required />
              <FormField name="password" type="password" label="Password" placeholder="Min 6 characters" required />
              <FormField name="confirmPassword" type="password" label="Confirm Password" placeholder="Re-enter your password" required />
              <Button type="submit" loading={loading} fullWidth size="lg" iconRight={ArrowRight}>
                Create Account
              </Button>
            </Form>
            )}
          </Formik>

          <p className="text-center text-sm text-slate-500 mt-8">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
