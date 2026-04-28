import { useState } from 'react';

import coverImg from '../../assets/svgs/onboarding-cover.svg';
import logo from '../../assets/svgs/reviewtool-logo.svg';
import shimmer from '../../assets/svgs/onboarding-shimmer.svg';
import LoginAccount from '../../components/onboarding/LoginAccount';
import CreateAccount from '../../components/onboarding/CreateAccount';
import VerifyAccount from '../../components/onboarding/VerifyAccount';
import BuildWorkspace from '../../components/onboarding/BuildWorkspace';
import ResetPassword from '../../components/onboarding/ResetPassword';
import SetNewPassword from '../../components/onboarding/SetNewPassword';
import PasswordChanged from '../../components/onboarding/PasswordChanged';


export default function Onboarding() {

  const [currentScreen, setCurrentScreen] = useState("signIn");

  return (
    <div className="fixed inset-0 grid grid-cols-1 md:grid-cols-[45%_55%]">
      <div className="relative flex flex-col justify-center items-center overflow-hidden bg-black">
        <img
          src={shimmer}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -left-44 -top-44 z-0 h-[520px] w-[520px] max-w-none opacity-90 md:-left-52 md:-top-52 md:h-[620px] md:w-[620px]"
        />
        <img
          src={logo}
          alt="Postjamm logo"
          className="absolute left-8 top-8 z-10"
        />
        <div className="relative z-10 flex w-full justify-center px-6 md:px-8">
        {
          currentScreen == "signIn" ?
          <LoginAccount setCurrentScreen={setCurrentScreen}/> :
          currentScreen == "signUp" ?
          <CreateAccount setCurrentScreen={setCurrentScreen}/> :
          currentScreen == "verifyAccount" ?
          <VerifyAccount setCurrentScreen={setCurrentScreen}/> :
          currentScreen == "resetPassword" ?
          <ResetPassword setCurrentScreen={setCurrentScreen}/> :
          currentScreen == "setNewPassword" ?
          <SetNewPassword setCurrentScreen={setCurrentScreen}/> :
          currentScreen == "buildWorkspace" ?
          <BuildWorkspace setCurrentScreen={setCurrentScreen}/> :
          <PasswordChanged setCurrentScreen={setCurrentScreen}/>
        }
        </div>
      </div>
      <div style={{ padding:15 }}>
        <img
          src={coverImg}
          alt="Login background"
          className="w-full h-full object-cover"
          style={{ borderRadius:20}}
        />
      </div>
    </div>
  )
}
