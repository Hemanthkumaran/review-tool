import { useMemo, useState } from 'react'
import logo from '../../assets/svgs/reviewtool-logo.svg';
import PasswordInput from '../textInputs/PasswordInput';
import PrimaryButton from '../buttons/PrimaryButton';
import { resetForgotPasswordApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../routes/paths';

function SetNewPassword({ setCurrentScreen }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // Basic canSubmit rule (adjust as needed, e.g., enforce min length)
  const canSubmit = useMemo(() => {
    return password.length >= 6 && confirmPassword.length >= 6 && passwordsMatch && !loading;
  }, [password, confirmPassword, passwordsMatch, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!canSubmit) {
      if (!passwordsMatch) setErrorMsg('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await resetForgotPasswordApi({
        password,
        confirmPassword,      
      });
      console.log(res, 'eee');
      setCurrentScreen('passwordChanged');
      localStorage.clear();
    } catch (err) {
      const apiMsg = err?.response?.data?.message || 'Failed to reset password. Please try again.';
      setErrorMsg(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <img src={logo} alt="logo" className="block mx-auto mb-6 h-12 w-auto" />

      <div style={{ fontFamily:'Gilroy-Regular', fontSize:24 }}>
        Set a New Password
      </div>

      <div className='mt-2 mb-2 text-[#BFBFBF]'>
        Lorem ipsum dolor sit amet consectetur. Sed non at imperdiet non ornare sollicitudin vel.
      </div>

      <form className="space-y-4 mt-8" onSubmit={handleSubmit}>
        <PasswordInput
          label="Set New Password"
          placeholder="Enter your password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className='mt-2' />

        <PasswordInput
          label="Confirm New Password"
          placeholder="Re-enter your password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* Error message (only when needed) */}
        {!!errorMsg && (
          <div className='mt-2 text-[#FF8F8F] text-left'>
            {errorMsg}
          </div>
        )}

        <div className='mt-8'>
          <PrimaryButton
            type='submit'
            loading={loading}
            label={'Reset password'}
            disabled={!canSubmit}
          />
        </div>
      </form>

      <p className="mt-6 text-sm text-center text-[#BFBFBF]">
        Already have an account?
        <a onClick={() => !loading && setCurrentScreen("signIn")} className="text-[#F9EF38] hover:underline cursor-pointer">
          {" "}Sign in
        </a>
      </p>
    </div>
  )
}

export default SetNewPassword;
