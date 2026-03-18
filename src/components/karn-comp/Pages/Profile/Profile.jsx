import { useEffect, useState } from "react";
import OutlineInput from "../../../textInputs/OutlineInput";
import EditableAvatar from "../../components/EditAvatar/EditableAvatar";
import Button from "../../../UI/Button";
import "./Profile.css";
import { updateUserProfileApi } from "../../../../services/api";
import { useUser } from "../../../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../../routes/paths";
import { useWorkspace } from "../../../../context/WorkspaceContext";

const Profile = ({ onClose }) => {
  const { user, refreshUserProfile } = useUser();
  const { brandingColor } = useWorkspace();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
    });

    setAvatarUrl(user.profileImage?.url || null);
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await updateUserProfileApi(formData);

      await refreshUserProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

   const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (!user) return null;

  return (
    <div>
      <div className="flex justify-between content-center">
        <div style={{ fontFamily:'Gilroy-SemiBold', fontSize:18, }}>
          Profile settings
        </div>
      </div>
      <div style={{ color:"#BFBFBF", fontSize:14, fontFamily:'Gilroy-Light', marginTop:5 }}>Adjust your display picture, name, and password from here.</div>
      <br />
      <EditableAvatar
        imageUrl={avatarUrl}
        onImageSelect={setImageFile}
        user={user}
      />
      <br />

      <div className="profile-form">
        <div className="flex mb-4">
          <OutlineInput
            label="Name"
            placeholder="John"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            styles={{ borderColor: "#2B2B2B" }}
          />
          <OutlineInput
            label=""
            placeholder="Wick"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            styles={{ borderColor: "#2B2B2B", marginLeft:25 }}
          />
        </div>

        <OutlineInput
          label="Email"
          name="email"
          value={form.email}
          disabled={true}
          styles={{
            borderColor: "#2B2B2B",
            width: "70%",
            padding: "20px",
          }}
        />
      </div>

      <br />
      <div className="h-line"></div>
      <br />

      <div>
        <div  className="mb-4 text-[#ffffff]">Change Password</div>
        <div className="cursor-pointer">
          Set a new password for your account anytime.
          <a onClick={() => {
          // clearAuth();
          navigate(PATHS.CHANGE_PASSWORD)
        }} className="text-yellow-300">
            {" "}
            Update password
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
          onClick={onClose}
        />
        <Button
          width="120px"
          content={loading ? "Saving..." : "Save"}
          bgColor={brandingColor}
          textColor="black"
          border="2px solid #2a2a2a"
          marginRight="24px"
          onClick={handleSave}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default Profile;