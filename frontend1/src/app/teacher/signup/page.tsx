"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function TeacherSignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teacherCategory, setTeacherCategory] = useState("Primary Teacher");
  const [administrativeRole, setAdministrativeRole] = useState("Classroom Teacher");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
          password
        }),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col justify-center py-12 sm:px-6 relative font-body text-black">
      {/* Background radial gradient to mimic image background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% -20%, rgba(0,0,0,0.03) 0%, transparent 60%)' }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-[560px] text-center z-10 relative mb-8">
        <h1 className="text-3xl font-display font-bold tracking-tight text-primary">Ruroxz Time Management</h1>
        <p className="mt-2 text-sm text-primary/60">Teacher Registration Portal</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[560px] z-10 relative">
        <div className="bg-white border text-left border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.03)] rounded-md overflow-hidden">

          {/* Identity Verification Banner */}
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-6 flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-4 h-4 rounded-full bg-[#4B5563] flex items-center justify-center">
                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary leading-tight mb-1">
                Identity Verification Required
              </h3>
              <p className="text-xs text-primary/60 leading-relaxed">
                All new accounts require approval from the District Superintendent. Approval typically takes 24-48 business hours.
              </p>
            </div>
          </div>

          <div className="px-8 py-8">
            {success ? (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Registration Submitted</h3>
                <p className="mt-2 text-sm text-gray-500">Your account request has been sent to the superintendent. Redirecting to login...</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#4B5563] mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-[#FCFDFD] border border-[#E2E8F0] rounded-md text-sm px-4 py-2.5 outline-none focus:border-black transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#4B5563] mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-[#FCFDFD] border border-[#E2E8F0] rounded-md text-sm px-4 py-2.5 outline-none focus:border-black transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#4B5563] mb-2">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@district.edu"
                    className="w-full bg-[#FCFDFD] border border-[#E2E8F0] rounded-md text-sm px-4 py-2.5 outline-none focus:border-black transition-colors placeholder:text-[#9CA3AF]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#4B5563] mb-2">
                      Teacher Category
                    </label>
                    <div className="relative">
                      <select
                        value={teacherCategory}
                        onChange={(e) => setTeacherCategory(e.target.value)}
                        className="w-full bg-white border border-border rounded-md text-sm px-4 py-2.5 outline-none focus:border-primary transition-colors appearance-none pr-10 text-primary"
                        required
                      >
                        <option value="Primary Teacher">Primary Teacher</option>
                        <option value="Secondary Teacher">Secondary Teacher</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary/60">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#4B5563] mb-2">
                      Administrative Role
                    </label>
                    <div className="relative">
                      <select
                        value={administrativeRole}
                        onChange={(e) => setAdministrativeRole(e.target.value)}
                        className="w-full bg-white border border-border rounded-md text-sm px-4 py-2.5 outline-none focus:border-primary transition-colors appearance-none pr-10 text-primary"
                        required
                      >
                        <option value="Classroom Teacher">Classroom Teacher</option>
                        <option value="Site Coordinator">Site Coordinator</option>
                        <option value="Department Head">Department Head</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary/60">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#4B5563] mb-2">
                    Secure Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#FCFDFD] border border-[#E2E8F0] rounded-md text-sm px-4 py-2.5 pr-12 outline-none focus:border-black transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-4 flex items-center text-[#9CA3AF] hover:text-[#4B5563]"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-red-500 bg-red-50 p-3 rounded-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-strong text-white text-[11px] font-bold tracking-[0.15em] py-3.5 px-4 rounded-md transition-colors"
                >
                  {loading ? "CREATING..." : "CREATE ACCOUNT"}
                </button>
              </form>
            )}
          </div>

          <div className="bg-[#FFFFFF] border-t border-[#E2E8F0] px-8 py-5 text-center">
            <p className="text-[10px] text-primary/60">
              By registering, you agree to the <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a> of Architectural Ledger Systems.
            </p>
          </div>

        </div>

        <div className="mt-8 flex justify-center items-center gap-6 pb-20">
          <p className="text-xs text-primary/60">
            Already have an account?{" "}
            <Link href="/" className="font-bold text-primary hover:text-primary-strong">
              SIGN IN →
            </Link>
          </p>
          <div className="w-[1px] h-3 bg-primary/20"></div>
          <button className="text-xs font-bold text-primary/60 flex items-center gap-2 hover:text-primary">
            <div className="w-3 h-3 rounded-full bg-primary/60 text-white flex items-center justify-center text-[10px]">?</div>
            Support
          </button>
        </div>
      </div>
    </div>
  );
}
