import { useState } from "react";
import FeatureLockedModal from "./FeatureLockedModal";

export default function WorkSpaceModal() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Modal</button>

      <FeatureLockedModal
        open={open}
        onClose={() => setOpen(false)}
        onActivate={() => alert("Add-on Activated")}
      />
    </>
  );
}
