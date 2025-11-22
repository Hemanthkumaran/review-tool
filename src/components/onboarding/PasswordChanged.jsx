import React from 'react';
import successTick from '../../assets/svgs/success-tick.svg';
import OutlineInput from '../textInputs/OutlineInput';
import PasswordInput from '../textInputs/PasswordInput';
import PrimaryButton from '../buttons/PrimaryButton';

function PasswordChanged({ setCurrentScreen }) {
  return (
    <div className="w-full max-w-sm">
        <img style={{ height:96, width:96 }} src={successTick} alt="successTick" className="block mx-auto mb-6 h-12 w-auto" />
        <div style={{ fontFamily:'Gilroy-Bold', fontSize:24 }}>Password changed!</div>
        <div className='mt-2 mb-2 text-[#BFBFBF]'>Go back to signing in with your new password</div>
        <div onClick={() => setCurrentScreen('signIn')} className='mt-8'><PrimaryButton label={'Go to signin'}/></div>
    </div>
  )
}

export default PasswordChanged;