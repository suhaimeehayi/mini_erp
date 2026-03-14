import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

function Login() {

  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleLogin = async (e) => {

    e.preventDefault();

    setLoading(true);

    // fake loading
    await new Promise((resolve)=>setTimeout(resolve,1000));

    try{

      const data = await login(username,password);

      authLogin(data);

      toast.success("Login successfully ✅");

      navigate("/",{replace:true});

    }catch(error){

      console.error("Login error:", error);
      toast.error("Login failed. Username or password incorrect ❌");

      setUsername("");
      setPassword("");

    }

    setLoading(false);

  };

  return(

    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">

      <Toaster position="top-right" />

      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Mini ERP
        </h2>

        <p className="text-center text-gray-500 mb-8">
          Login to your account
        </p>

        <form onSubmit={handleLogin} className="space-y-5">

          <input
            type="text"
            placeholder="Username"
            value={username}
            className="w-full border border-gray-300 rounded-lg p-3 text-black"
            onChange={(e)=>setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            className="w-full border border-gray-300 rounded-lg p-3 text-black"
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex justify-center transition"
          >

          {loading ? "Logging in..." : "Login"}

          </button>

        </form>

      </div>

    </div>

  );

}

export default Login;
