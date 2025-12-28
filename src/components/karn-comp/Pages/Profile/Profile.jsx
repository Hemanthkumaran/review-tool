import OutlineInput from "../../../textInputs/OutlineInput";
import EditableAvatar from "../../components/EditAvatar/EditableAvatar";
import Button from "../../../UI/Button";
import "./Profile.css";

const Profile = () => {
  return (
    <div>
      <div className="flex justify-between content-center">
        <div className="text-2xl font-bold pb-4 text-[#ffffff]">Profile</div>
      </div>
      <div>Lorem ipsum dolor sit amet ,te eos molestiae debitis.</div>
      <br />

      <EditableAvatar />
      <br />

      <div className="profile-form">
        <div className="row">
          <OutlineInput
            label="Name "
            placeholder="John"
            name="firstName"
            styles={{ borderColor: "#2B2B2B" }}
          />
          <OutlineInput
            label=""
            placeholder="Wick"
            name="lastName"
            styles={{ borderColor: "#2B2B2B" }}
          />
        </div>

        {/* Email */}
        <OutlineInput
          label="Email"
          placeholder="johnwick@gmail.com"
          name="email"
          styles={{ borderColor: "#2B2B2B", width: "80%", padding: "20px" }}
        />
      </div>
      <br />
      <div className="h-line"></div>
      <br />
      <div>
        <div className="mb-4 text-[#ffffff]">Change Password</div>
        <div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit
          <a className="text-yellow-300 " href="#">
            {" "}
            Click here
          </a>
        </div>
      </div>
      <br />
      <br />
      <div className="flex justify-end">
        <Button
          width="120px"
          content="Cancel"
          bgColor="black"
          textColor="white"
          border="2px solid #2a2a2a"
          marginRight="6px"
        />
        <Button
          width="120px"
          content="Save"
          bgColor="yellow"
          textColor="black"
          border="2px solid #2a2a2a"
          marginRight="24px"
        />
      </div>
    </div>
  );
};

export default Profile;
