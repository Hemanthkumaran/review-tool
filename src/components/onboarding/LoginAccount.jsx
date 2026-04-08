import { useState } from 'react'
import logo from '../../assets/svgs/reviewtool-logo.svg';
import OutlineInput from '../textInputs/OutlineInput';
import PasswordInput from '../textInputs/PasswordInput';
import PrimaryButton from '../buttons/PrimaryButton';
import { signinApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function LoginAccount({ setCurrentScreen }) {

  const { login } = useAuth();
  const [form, setForm] = useState({
    "email": "",
    "password": ""
  });
  const [errorMsg, setErrorMsg] = useState("");

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await signinApi(form);
    const { token, user } = res.data || res;

    if (!token) {
      throw new Error("No token received");
    }

    login(token, { onboarded: true });

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    // ❌ DO NOT navigate here
    // PublicRoute will redirect automatically

  } catch (err) {
    const backendMsg =
      err?.response?.data?.message || "Invalid email or password";

    setErrorMsg(backendMsg);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="w-full max-w-sm">
        <img src={logo} alt="logo" className="block mx-auto mb-6 h-12 w-auto" />
        <div style={{ fontFamily:'Gilroy-SemiBold', fontSize:24, textAlign:'center' }}>Hello again</div>
        <div style={{ textAlign:'center' }} className='mt-2 mb-2 text-[#BFBFBF]'>Pick up right where you left off.</div>
        <form className="space-y-4 mt-8" onSubmit={handleSubmit}>
          <OutlineInput
              label='Email'
              type='email'
              placeholder='Enter your email'
              name="email"
              value={form.email}
              onChange={handleChange}
          />
          <PasswordInput
              label="Password"
              placeholder="Enter your password"
              name="password"
              value={form.password}
              onChange={handleChange}
          />
          <div onClick={() => setCurrentScreen("resetPassword")} className='text-right text-[#F9EF38] cursor-pointer'>Forgot password?</div>
            {errorMsg && (
              <div className="text-[#FF8F8F] text-left text-sm mt-2">
                {errorMsg}
              </div>
            )}
          <div className='mt-8'><PrimaryButton type='submit' label={'Login'} loading={loading}/></div>
        </form>
        <p className="mt-6 text-sm text-center text-[#BFBFBF]">
        Don't have an account?{" "}
        <a onClick={() => setCurrentScreen("signUp")} className="text-[#F9EF38] hover:underline cursor-pointer">
            {" "}Sign up
        </a>
        </p>
    </div>
  )
}

export default LoginAccount;