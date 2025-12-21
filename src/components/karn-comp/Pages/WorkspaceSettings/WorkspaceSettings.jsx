import "./WorkspaceSettings.css";
import close from "../../assets/icons/close.svg";
import OutlineInput from "../../../textInputs/OutlineInput";
import lock from "../../assets/icons/lock.svg";
import lockgray from "../../assets/icons/lockgray.svg";
import EditableAvatar from "../../components/EditAvatar/EditableAvatar";
import BrandColorPicker from "../../components/BrandColor/BrandColorPicker";
import Button from "../../../UI/Button";


const WorkspaceSettings = () => {
  return (
    <div>
      <div className="flex justify-between content-center">
        <div className="text-2xl font-bold pb-4 text-[#ffffff]">
          Workspace settings
        </div>
        <img width="26px" src={close} alt="" />
      </div>
      <div>Edit your workspace name and customize the tool to your brand.</div>
      <br />
      <div>
        <OutlineInput
          label="Workspace Name"
          placeholder="A2Z Studio"
          styles={{
            border: "2px solid #2a2a2a",
            width: "80%",
            padding: "24px",
          }}
        />
      </div>
      <br />

      <div className="w-[80%] pt-6 pl-6 pb-4 py-4 border-[#2a2a2a] border-2 rounded-lg bg-[#131313]">
        <div className="flex justify-between content-center mb-4">
          <div>Logo</div>
          <div className="bg-[yellow] w-fit p-1 rounded-md mr-4">
            <img height="20px" width="20px" src={lock} alt="" />
          </div>
        </div>
        <EditableAvatar />
        <br />
        <BrandColorPicker />
      </div>

      <div className="domain">
        <div className="domain-head">
          <div className="mr-4">Custom Domain</div>
          <div>
            <Button
              contentSize="18px"
              padding="2px 2px"
              content="coming soon"
              width="150px"
              bgColor="yellow"
              textColor="black"
            />
          </div>
        </div>
        <div className="mt-[-8px] relative">
          <OutlineInput
            label=""
            placeholder="www.review.A2Zstudio.com"
            styles={{
              border: "2px solid #2a2a2a",
              width: "100%",
              padding: "24px",
            }}
          />
          <img
            className=" absolute bottom-[14px] right-4"
            height="24px"
            width="22px"
            src={lockgray}
            alt=""
          />
        </div>
        <br />
        <div className="relative">
          <div className="flex absolute bottom-[-24px] right-[0px]">
            <Button
              width="120px"
              content="Cancel"
              textColor="white"
              bgColor="black"
              border="#be5353"
              marginRight="8px"
            />
            <Button
              width="120px"
              content="Save"
              textColor="black"
              bgColor="yellow"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettings;
