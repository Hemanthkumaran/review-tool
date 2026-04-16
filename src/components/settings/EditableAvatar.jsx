import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import "./EditableAvatar.css";
import EditIcon from "../../assets/svgs/edit.svg";
import { getInitials } from "../../helpers/common";

const EditableAvatar = ({ imageUrl, onImageSelect, user }) => {
  const [preview, setPreview] = useState(imageUrl || null);
  

  useEffect(() => {
    setPreview(imageUrl);
  }, [imageUrl]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div className="avatar-wrapper" {...getRootProps()}>
      <input {...getInputProps()} />
      {preview ?
      <img
        src={preview}
        alt="Avatar"
        className="avatar-image"
      /> :
      <div className="d-flex justify-center align-center">
        <div style={{ fontSize:24, marginTop:-15, fontWeight:'bold' }}>{getInitials(user?.firstName, user?.lastName)}</div>
      </div>}
      <button type="button" className="edit-btn" onClick={open}>
        <img height="24px" width="20px" src={EditIcon} alt="" />
      </button>
    </div>
  );
};

export default EditableAvatar;
