import { useState } from 'react';

import coverImg from '../assets/svgs/onboarding-cover.svg';
import ResetPassword from '../components/onboarding/ResetPassword';
import SetNewPassword from '../components/onboarding/SetNewPassword';
import PasswordChanged from '../components/onboarding/PasswordChanged';

export default function ChangePassword() {

  const [currentScreen, setCurrentScreen] = useState("resetPassword");

  return (
    <div className="fixed inset-0 grid grid-cols-1 md:grid-cols-[45%_55%]">
      <div className="flex flex-col justify-center items-center">
        {
          currentScreen == "resetPassword" ?
          <ResetPassword setCurrentScreen={setCurrentScreen} changePasswordFlow={true} /> :
          currentScreen == "setNewPassword" ?
          <SetNewPassword setCurrentScreen={setCurrentScreen} changePasswordFlow={true}/> :
          <PasswordChanged setCurrentScreen={setCurrentScreen} changePasswordFlow={true}/>
        }
      </div>
      <div style={{ padding:15 }}>
        <img
          src={coverImg}
          alt="Login background"
          className="w-full h-full object-cover"
          style={{ borderRadius:20 }}
        />
      </div>
    </div>
  )
}