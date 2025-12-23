import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaPen } from "react-icons/fa";
import "./EditableAvatar.css";
import EditIcon from "../../assets/icons/edit.svg"

const EditableAvatar = () => {
  const [image, setImage] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setImage(preview);
    }
  }, []);

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

      <img
        src={
          image || "https://via.placeholder.com/300x300.png?text=Upload+Image"
        }
        alt="Avatar"
        className="avatar-image"
      />

      <button
        type="button"
        className="edit-btn"
        onClick={open}
        aria-label="Edit image"
      >
        <img height="24px" width="20px" src={EditIcon} alt="" />
      </button>
    </div>
  );
};

export default EditableAvatar;
