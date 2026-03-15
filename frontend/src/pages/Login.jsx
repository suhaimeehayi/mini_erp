import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AUTH_ERROR_MESSAGE = "Username or Password ผิดพลาด";

const initialCredentials = {
  username: "",
  password: "",
};

function ErpProjectLogo() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 shadow-[0_18px_40px_rgba(15,23,42,0.28)]">
        <div className="grid grid-cols-2 gap-1.5">
          <span className="h-4 w-4 rounded-md bg-cyan-400" />
          <span className="h-4 w-4 rounded-md bg-emerald-400" />
          <span className="h-4 w-4 rounded-md bg-amber-300" />
          <span className="h-4 w-4 rounded-md bg-rose-400" />
        </div>
        <div className="absolute -right-1 -top-1 rounded-full border border-white/40 bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
          ERP
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/90">
          ERP Project
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Mini ERP Control Center
        </h1>
      </div>
    </div>
  );
}

function Login() {
  const [credentials, setCredentials] = useState(initialCredentials);
  const [loading,setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { username, password } = credentials;

  const handleFieldChange = (field) => (event) => {
    const { value } = event.target;

    setCredentials((previousCredentials) => ({
      ...previousCredentials,
      [field]: value,
    }));
  };

  const resetCredentials = () => {
    setCredentials(initialCredentials);
  };

  const handleLogin = async (e) => {

    e.preventDefault();

    if (loading) {
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setLoginError(AUTH_ERROR_MESSAGE);
      resetCredentials();
      return;
    }

    setLoading(true);

    try{

      const data = await login(trimmedUsername, trimmedPassword);

      setLoginError("");

      authLogin(data);

      navigate("/",{replace:true});

    }catch(error){

      console.error("Login error:", error);
      setLoginError(AUTH_ERROR_MESSAGE);
      resetCredentials();

    } finally {
      setLoading(false);

    }

  };

  return(

    <div className="min-h-screen overflow-hidden bg-[#07111f] text-white">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.18),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0f172a_48%,_#10213a_100%)]" />

      <div className="absolute left-[-6rem] top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-[-5rem] right-[-4rem] h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10 lg:px-10">
        <div className="grid w-full items-stretch gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="hidden rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-8">
              <ErpProjectLogo />

              <div className="max-w-xl space-y-5">
                <h2 className="text-5xl font-semibold leading-tight tracking-tight text-white">
                  จัดการงานขาย สต็อก และบัญชีจากศูนย์กลางเดียว
                </h2>
                <p className="max-w-lg text-base leading-7 text-slate-300">
                  เข้าสู่ระบบเพื่อดูภาพรวมของ ERP Project, ควบคุม workflow สำคัญ และติดตามข้อมูลธุรกิจแบบเรียลไทม์ในหน้าจอเดียว.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                <p className="text-sm text-slate-400">Inventory</p>
                <p className="mt-2 text-2xl font-semibold text-white">Live</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                <p className="text-sm text-slate-400">Sales Flow</p>
                <p className="mt-2 text-2xl font-semibold text-white">Tracked</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                <p className="text-sm text-slate-400">Accounts</p>
                <p className="mt-2 text-2xl font-semibold text-white">Secured</p>
              </div>
            </div>
          </section>

          <section className="flex items-center">
            <div className="w-full rounded-[2rem] border border-white/10 bg-white/90 p-8 text-slate-900 shadow-[0_24px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-10">
              <div className="mb-8 lg:hidden">
                <div className="rounded-2xl bg-slate-950 p-5 text-white">
                  <ErpProjectLogo />
                </div>
              </div>

              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">
                  Welcome Back
                </p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                  Sign in to ERP Project
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  ใช้บัญชีของคุณเพื่อเข้าสู่ระบบและจัดการข้อมูลภายในระบบ Mini ERP.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    autoComplete="username"
                    aria-invalid={Boolean(loginError)}
                    className={`w-full rounded-xl border px-4 py-3 text-slate-950 outline-none transition ${loginError ? "border-red-400 bg-red-50 ring-4 ring-red-100" : "border-slate-200 bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"}`}
                    onChange={handleFieldChange("username")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    autoComplete="current-password"
                    aria-invalid={Boolean(loginError)}
                    className={`w-full rounded-xl border px-4 py-3 text-slate-950 outline-none transition ${loginError ? "border-red-400 bg-red-50 ring-4 ring-red-100" : "border-slate-200 bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"}`}
                    onChange={handleFieldChange("password")}
                  />
                </div>

                {loginError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  {loading ? "Logging in..." : "Login"}
                </button>

                <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                  <span className="font-medium text-slate-700">Secure access:</span> ระบบจะตรวจสอบสิทธิ์ผู้ใช้ก่อนเข้าถึงข้อมูล Accounts, Sales, Purchase และ Inventory.
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>

    </div>

  );

}

export default Login;
