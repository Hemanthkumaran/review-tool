import React, { useEffect, useState } from 'react'
import logo from '../../assets/svgs/reviewtool-logo.svg';
import OutlineInput from '../textInputs/OutlineInput';
import PrimaryButton from '../buttons/PrimaryButton';
import { forgotPasswordApi, verifyResetCodeApi, resetForgotPasswordApi } from '../../services/api';

function ResetPassword({ setCurrentScreen }) {
  const [showError, setShowError] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // stage: 'request' (send email) -> 'verify' (confirm code)
  const [stage, setStage] = useState('request'); // 'request' | 'verify'
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (stage !== 'verify') return; // start timer after email sent successfully
    setSecondsLeft(60);
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [stage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowError(false);

    if (stage === 'request') {
      if (!email) { setShowError(true); return; }
      setLoading(true);
      try {
        await forgotPasswordApi({ email });
        // success → reveal code input + change button action
        setStage('verify');
      } catch (err) {
        console.error('Forgot password error:', err?.response?.data || err.message);
        setShowError(true);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (stage === 'verify') {
      if (!code) { setShowError(true); return; }
      setLoading(true);
      try {
        const res = await verifyResetCodeApi({ email, passwordResetOTP: code });
        const { token, user } = res.data;
        localStorage.setItem('authToken', token);        
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentScreen('setNewPassword');
      } catch (err) {
        console.error('Verify code error:', err?.response?.data || err.message);
        setShowError(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || !email) return;
    try {
      setLoading(true);
      await forgotPasswordApi({ email });
      setSecondsLeft(60); // restart timer
    } catch (err) {
      console.error('Resend error:', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <img src={logo} alt="logo" className="block mx-auto mb-6 h-12 w-auto" />

      <div style={{ fontFamily:'Gilroy-Regular', fontSize:24 }}>
        Forgot password
      </div>

      <div className='mt-2 mb-2 text-[#BFBFBF]'>
        Lorem ipsum dolor sit amet consectetur. Sed non at imperdiet non ornare sollicitudin vel.
      </div>

      <form className="space-y-4 mt-8" onSubmit={handleSubmit}>
        <OutlineInput
          label='Email'
          type='email'
          placeholder='Enter your email'
          name='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Reveal verification code input only after email is sent successfully */}
        {stage === 'verify' && (
          <OutlineInput
            label='Verification code'
            type='text'
            placeholder='Enter the code'
            name='code'
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        )}

        {/* Timer + Resend */}
        {stage === 'verify' && (
          <p className="mt-2 text-sm text-left text-[#BFBFBF]">
            Time left: {secondsLeft}s
            <button
              type="button"
              onClick={handleResend}
              disabled={secondsLeft > 0 || loading}
              className={`ml-2 underline ${secondsLeft > 0 ? 'cursor-not-allowed opacity-50' : 'text-[#F9EF38] hover:opacity-80'}`}
            >
              Resend code
            </button>
          </p>
        )}

        {showError && (
          <div className='mt-2 mb-2 text-[#FF8F8F] text-left'>
            {stage === 'request'
              ? 'An account with this email does not exist, or there was an error. Please check and try again.'
              : 'Invalid or expired verification code. Please try again.'}
          </div>
        )}

        <div className='mt-6'>
          <PrimaryButton
            type='submit'
            loading={loading}
            label={stage === 'request' ? 'Send verification code' : 'Confirm verification code'}
          />
        </div>
      </form>

      <p className="mt-6 text-sm text-center text-[#BFBFBF]">
        Already have an account?
        <a onClick={() => !loading && setCurrentScreen("signIn")} className="text-[#F9EF38] hover:underline cursor-pointer">
          {' '}Sign in
        </a>
      </p>
    </div>
  )
}

export default ResetPassword;
