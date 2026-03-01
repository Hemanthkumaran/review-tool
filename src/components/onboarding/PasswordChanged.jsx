import successTick from '../../assets/svgs/success-tick.svg';
import PrimaryButton from '../buttons/PrimaryButton';
import { PATHS } from '../../routes/paths';
import { useNavigate } from 'react-router-dom';

function PasswordChanged({ setCurrentScreen, changePasswordFlow = false }) {
  const navigate = useNavigate();
  return (
    <div className="w-full max-w-sm">
        <img style={{ height:96, width:96 }} src={successTick} alt="successTick" className="block mx-auto mb-6 h-12 w-auto" />
        <div style={{ fontFamily:'Gilroy-Bold', fontSize:24 }}>Password changed!</div>
        <div className='mt-2 mb-2 text-[#BFBFBF]'>Go back to signing in with your new password</div>
        <div onClick={() => {
          changePasswordFlow ?
          navigate(PATHS.ROOT) :
          setCurrentScreen('signIn')
        }} className='mt-8'>
          <PrimaryButton label={'Go to signin'}/>
        </div>
    </div>
  )
}

export default PasswordChanged;