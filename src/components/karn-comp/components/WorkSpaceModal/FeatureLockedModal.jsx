import React from "react";
import "./FeatureLockedModal.css";
import FeatureIcon from "../../assets/icons/feature.svg"

const FeatureLockedModal = ({ open, onClose, onActivate }) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <div>
          <img className=" m-auto" src={FeatureIcon} alt="" />
        </div>

        <h2 className="title">Feature locked</h2>

        <p className="description">
          Custom branding is part of a $5/month add-on. Once added, you can
          upload a logo and change accent colors instantly.
        </p>

        <button className="cta-btn" onClick={onActivate}>
          Activate add-on
        </button>
      </div>
    </div>
  );
};

export default FeatureLockedModal;
