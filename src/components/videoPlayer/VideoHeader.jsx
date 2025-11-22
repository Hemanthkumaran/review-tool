import StatusPill from '../buttons/StatusPill'
import VersionPill from './VersionPill'
import DownloadMenuButton from '../Buttons/DownloadMenuBtn'
import LeftArrow from '../../assets/svgs/arrow-left.svg';

function VideoHeader() {
  return (
    <div style={{ marginLeft:40}} className="flex items-center justify-between mb-6">
        <div className="flex items-center">
            <img style={{ height:20, width:20 }} src={LeftArrow} />
            <div style={{ height:20, width:0.8,  background:"#202020", margin:"0 10px" }}/>
            <div className="flex items-center">
            <div style={{ fontFamily:"Gilroy-Light" }}>
                Logo introduction video{" "}
            </div>
            <div style={{ marginLeft:10 }}><VersionPill onClick={() => console.log("version pill clicked")} /></div>
            </div>
        </div>
        <div className="flex items-center justify-between">
            <StatusPill/>                
            <div style={{ margin:"0 10px" }}><DownloadMenuButton onAction={() => null} /></div>
            <button style={{ border:"1px solid #181A1C", borderRadius:30 }} className="p-3.5 px-5 rounded-full hover:bg-white/5">
            <svg
                width="4"
                height="16"
                viewBox="0 0 4 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="2" cy="2" r="1.4" fill="#D1D5DB" />
                <circle cx="2" cy="8" r="1.4" fill="#D1D5DB" />
                <circle cx="2" cy="14" r="1.4" fill="#D1D5DB" />
            </svg>
            </button>
        </div>
    </div>
  )
}

export default VideoHeader