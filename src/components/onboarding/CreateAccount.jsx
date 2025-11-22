import React, { useState } from 'react'
import logo from '../../assets/svgs/reviewtool-logo.svg';
import OutlineInput from '../textInputs/OutlineInput';
import PasswordInput from '../textInputs/PasswordInput';
import PrimaryButton from '../buttons/PrimaryButton';
import { signupApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

function CreateAccount({ setCurrentScreen }) {
    
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const res = await signupApi(form);
        const { token, user } = res.data || res;
        if (token) {
            localStorage.setItem("authToken", token);
        }
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        }
        setCurrentScreen("verifyAccount");
    } catch (err) {
      console.log("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <img src={logo} alt="logo" className="block mx-auto mb-6 h-12 w-auto" />

      <div style={{ fontFamily: "Gilroy-SemiBold", fontSize: 24 }}>
        Create your account
      </div>

      <div className="mt-2 mb-2 text-[#BFBFBF]">
        Lorem ipsum dolor sit amet consectetur. Sed non at imperdiet non ornare sollicitudin vel.
      </div>

      <form className="space-y-4 mt-8" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <OutlineInput
            label="Your name"
            placeholder="First name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
          />

          <OutlineInput
            label=""
            placeholder="Last name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
          />
        </div>

        <OutlineInput
          label="Email"
          type="email"
          placeholder="Enter your email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />

        <PasswordInput
          label="Set Password"
          placeholder="Enter your password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        <div className="mt-8">
          <PrimaryButton label={"Create Account"} type="submit" loading={loading} />
        </div>
      </form>

      <p className="mt-6 text-sm text-center text-[#BFBFBF]">
        Already have an account?
        <a
          onClick={() => !loading && setCurrentScreen("signIn")}
          className="text-[#F9EF38] hover:underline cursor-pointer"
        >
          {" "}Sign in
        </a>
      </p>
    </div>
  );
}

export default CreateAccount;