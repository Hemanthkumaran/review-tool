import React, { useEffect, useState } from 'react'
import logo from '../../assets/svgs/reviewtool-logo.svg';
import OutlineInput from '../textInputs/OutlineInput';
import PasswordInput from '../textInputs/PasswordInput';
import PrimaryButton from '../buttons/PrimaryButton';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../routes/paths';
import { signinApi } from '../../services/api';

function LoginAccount({ setCurrentScreen }) {

  const navigate = useNavigate();
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
        console.log(res, 'res');
        
        const { token, user } = res.data || res;
        if (token) {
            localStorage.setItem("authToken", token);
        }
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        }
        navigate(PATHS.DASHBOARD);
    } catch (err) {
          const backendMsg =
          err?.response?.data?.message || "Invalid email or password";

        setErrorMsg(backendMsg);
      console.log("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full max-w-sm">
        <img src={logo} alt="logo" className="block mx-auto mb-6 h-12 w-auto" />
        <div style={{ fontFamily:'Gilroy-SemiBold', fontSize:24 }}>Login to your account</div>
        <div className='mt-2 mb-2 text-[#BFBFBF]'>Lorem ipsum dolor sit amet consectetur. Sed non at imperdiet non ornare sollicitudin vel.</div>
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
          <div onClick={() => setCurrentScreen("resetPassword")} className='text-right text-[#F9EF38] cursor-pointer'>Forget password</div>
            {errorMsg && (
              <div className="text-[#FF8F8F] text-left text-sm mt-2">
                {errorMsg}
              </div>
            )}
          <div className='mt-8'><PrimaryButton type='submit' label={'Sign in'} loading={loading}/></div>
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