import { useNavigate } from 'react-router-dom';
import notFound from '../assets/svgs/404.svg';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { PATHS } from '../routes/paths';
import { usePageTitle } from '../hooks/usePageTitle';


export default function NotFound() {
const navigate = useNavigate();
usePageTitle("Page Not Found");

  return (
    <div className="fixed inset-0 grid grid-cols-1 md:grid-cols-[45%_55%]">
      <div className="flex flex-col justify-center items-center">
        <div className="w-full max-w-sm text-center">
            {/* <img style={{ height:96, width:96 }} src={successTick} alt="successTick" className="block mx-auto mb-6 h-12 w-auto" /> */}
            <div style={{ fontFamily:'Gilroy-SemiBold', fontSize:24 }}>Uhoh!</div>
            <div style={{ fontFamily:'Gilroy-SemiBold', fontSize:24 }}>We don't think this page exists.</div>
            <div className='mt-6 mb-2 text-[#BFBFBF]'>You can try going back to our homepage</div>
            <div onClick={() => navigate(PATHS.ROOT)} className='mt-8'>
                <PrimaryButton label={'Go back home'}/>
            </div>
        </div>
      </div>
      <div style={{ padding:15 }}>
        <img
          src={notFound}
          alt="Login background"
          className="w-full h-full object-cover"
          style={{ borderRadius:20}}
        />
      </div>
    </div>
  )
}
