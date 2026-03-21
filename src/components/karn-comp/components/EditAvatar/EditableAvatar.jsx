import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaPen } from "react-icons/fa";
import "./EditableAvatar.css";
import EditIcon from "../../assets/icons/edit.svg"

const EditableAvatar = ({ imageUrl, onImageSelect, user, addOnStatus }) => {
  const [preview, setPreview] = useState(imageUrl || null);
  
  const getInitials = (firstName = "", lastName = "") =>
  `${firstName.trim()[0] || ""}${lastName.trim()[0] || ""}`.toUpperCase();

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
      <button type="button" className="edit-btn" onClick={addOnStatus != 'active' ? null : open}>
        <img height="24px" width="20px" src={EditIcon} alt="" />
      </button>
    </div>
  );
};

export default EditableAvatar;
