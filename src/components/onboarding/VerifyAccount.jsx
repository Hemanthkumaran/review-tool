import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoSmall from '../../assets/svgs/logo-small.svg'
import OutlineInput from '../textInputs/OutlineInput'
import PrimaryButton from '../buttons/PrimaryButton'
import { PATHS } from '../../routes/paths'
import { resendEmailVerificationApi, emailVerificationApi } from '../../services/api'

function VerifyAccount({ setCurrentScreen }) {
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(60)

  // start / restart countdown on mount
  useEffect(() => {
    setSecondsLeft(60)
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(t); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!code) {
      setErrorMsg('Please enter the verification code.')
      return
    }

    try {
      setLoading(true)
      // Adjust payload keys to match your backend:
      await emailVerificationApi({ emailVerificationOTP: code })

      // If you already have a token from signup, go straight to dashboard.
      const token = localStorage.getItem('authToken')
      if (token) {
        setCurrentScreen('buildWorkspace')
      } else {
        // Otherwise take the user to sign-in.
        setCurrentScreen ? setCurrentScreen('signIn') : navigate(PATHS.SIGN_IN)
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid verification code. Please try again.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (secondsLeft > 0 || loading) return
    try {
      setLoading(true)
      await resendEmailVerificationApi()
      setSecondsLeft(60) // restart timer
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to resend code. Please try again.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm relative">
      {/* top-left logo */}
<img
  src={logoSmall}
  alt="logo"
  className="fixed top-10 left-10 z-50 pointer-events-none h-12 w-auto"
/>


      <div style={{ fontFamily: 'Gilroy-SemiBold', fontSize: 24 }} className="mt-20">
        Verify Email
      </div>

      <div className="mt-2 mb-8 text-[#BFBFBF]">
        We’ve sent a verification code to <span className="text-white/90">{'your email'}</span>.
        Please enter it below to confirm your email.
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <OutlineInput
          label="Verification code"
          type="text"
          placeholder="Enter the code"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

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

        {errorMsg && (
          <div className="mt-2 text-[#FF8F8F] text-left">
            {errorMsg}
          </div>
        )}

        <div className="mt-8">
          <PrimaryButton
            type="submit"
            label="Confirm verification code"
            loading={loading}
          />
        </div>
      </form>
    </div>
  )
}

export default VerifyAccount
