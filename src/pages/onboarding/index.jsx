import { useState } from 'react';

import coverImg from '../../assets/svgs/onboarding-cover.svg';
import LoginAccount from '../../components/onboarding/LoginAccount';
import CreateAccount from '../../components/onboarding/CreateAccount';
import VerifyAccount from '../../components/onboarding/VerifyAccount';
import BuildWorkspace from '../../components/onboarding/BuildWorkspace';
import ResetPassword from '../../components/onboarding/ResetPassword';
import SetNewPassword from '../../components/onboarding/SetNewPassword';
import PasswordChanged from '../../components/onboarding/PasswordChanged';
import ChoosePlan from '../chooseplan';
import FreeTrialModal from '../../components/modals/FreetrialModal';


export default function Onboarding() {

  const [currentScreen, setCurrentScreen] = useState("signIn");

  // return <ChoosePlan/>

  // return <FreeTrialModal
  //   open={true}
  // />

  return (
    <div className="fixed inset-0 grid grid-cols-1 md:grid-cols-[45%_55%]">
      <div className="flex flex-col justify-center items-center">
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