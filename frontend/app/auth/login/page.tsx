"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Formik, Form } from "formik";
import { login, checkEmail, setPassword } from "@/src/store/authSlice";
import { AppDispatch, RootState } from "@/src/store/store";
import { Zap, ArrowRight, ArrowLeft, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import FormField from "@/src/components/ui/FormField";
import Button from "@/src/components/ui/Button";
import { loginSchema, setPasswordSchema, emailSchema } from "@/src/utils/validationSchemas";

type LoginStep = "email" | "password" | "set_password";

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  const handleBack = () => {
    setStep("email");
    setEmail("");
    setFullName("");
  };

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
            Manage customer relationships with AI-powered insights
          </h2>
          <p className="text-lg text-slate-400">
            Track interactions, analyze sentiment, and drive customer success.
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

          {/* Step 1: Email check */}
          {step === "email" && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
              <p className="text-sm text-slate-500 mt-1.5 mb-8">Enter your email to continue</p>

              <Formik
                initialValues={{ email: "" }}
                validationSchema={emailSchema}
                onSubmit={async (values, { setStatus }) => {
                  setStatus(undefined);
                  const result = await dispatch(checkEmail(values.email));
                  if (checkEmail.fulfilled.match(result)) {
                    const payload = result.payload;
                    if (payload.status === "has_password") {
                      setEmail(values.email);
                      setFullName(payload.full_name || "");
                      setStep("password");
                    } else if (payload.status === "needs_password") {
                      setEmail(values.email);
                      setFullName(payload.full_name || "");
                      setStep("set_password");
                    } else {
                      setStatus("No account found with this email.");
                      toast.error("No account found with this email.");
                    }
                  } else {
                    const msg = (result.payload as string) || "Something went wrong";
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
                    <FormField name="email" type="email" label="Email Address" placeholder="you@example.com" icon={Mail} required />
                    <Button type="submit" loading={loading} fullWidth size="lg" iconRight={ArrowRight}>
                      Continue
                    </Button>
                  </Form>
                )}
              </Formik>

              <p className="text-center text-sm text-slate-500 mt-8">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="text-blue-600 font-semibold hover:text-blue-700">Create one</Link>
              </p>
            </>
          )}

          {/* Step 2a: Login with password */}
          {step === "password" && (
            <>
              <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back{fullName ? `, ${fullName}` : ""}</h1>
              <p className="text-sm text-slate-500 mt-1.5 mb-1">Enter your password to sign in</p>
              <p className="text-xs text-slate-400 mb-8">{email}</p>

              <Formik
                initialValues={{ email, password: "" }}
                validationSchema={loginSchema}
                onSubmit={async (values, { setStatus }) => {
                  setStatus(undefined);
                  const result = await dispatch(login(values));
                  if (login.fulfilled.match(result)) {
                    toast.success("Welcome back!");
                    const role = result.payload.user.role;
                    router.push(role === "admin" || role === "superadmin" ? "/dashboard" : "/interactions");
                  } else {
                    const msg = (result.payload as string) || "Login failed";
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
                    <FormField name="password" type="password" label="Password" placeholder="Enter your password" icon={Lock} required />
                    <Button type="submit" loading={loading} fullWidth size="lg" iconRight={ArrowRight}>
                      Sign In
                    </Button>
                  </Form>
                )}
              </Formik>
            </>
          )}

          {/* Step 2b: Set password for existing customer */}
          {step === "set_password" && (
            <>
              <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Set your password</h1>
              <p className="text-sm text-slate-500 mt-1.5 mb-1">
                Hi {fullName || "there"}, we found your account. Please create a password to get started.
              </p>
              <p className="text-xs text-slate-400 mb-8">{email}</p>

              <Formik
                initialValues={{ password: "", confirmPassword: "" }}
                validationSchema={setPasswordSchema}
                onSubmit={async (values, { setStatus }) => {
                  setStatus(undefined);
                  const result = await dispatch(setPassword({ email, password: values.password }));
                  if (setPassword.fulfilled.match(result)) {
                    toast.success("Password set successfully! Welcome!");
                    router.push("/interactions");
                  } else {
                    const msg = (result.payload as string) || "Failed to set password";
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
                    <FormField name="password" type="password" label="Password" placeholder="Create a password (min 6 characters)" icon={Lock} required />
                    <FormField name="confirmPassword" type="password" label="Confirm Password" placeholder="Confirm your password" icon={Lock} required />
                    <Button type="submit" loading={loading} fullWidth size="lg" iconRight={ArrowRight}>
                      Set Password & Sign In
                    </Button>
                  </Form>
                )}
              </Formik>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
