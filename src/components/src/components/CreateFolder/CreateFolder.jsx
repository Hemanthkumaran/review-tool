import Button from "../../UI/Button";
import Card from "../../UI/Card";
import "./CreateFolder.css";
import cancelIcon from "../../assets/icons/cancel.svg";

const CreateFolder = () => {
  return (
    <Card width="40%" padding="24px 24px">
      <div style={{ color: "white" }}>
        <div className="head">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ paddingBottom: "4px" }}>Create Folder</div>
            <img src={cancelIcon} alt="" />
          </div>
          <div>Create a dedicated workspace for your client.</div>
        </div>
        <div className="body">
          <div style={{ paddingBottom: "4px" }}>Folder name</div>
          <input
            placeholder="Enter folder name"
            style={{
              width: "92%",
              padding: "8px",
              outline: "none",
              borderRadius: "8px",
            }}
            type="text"
          />
        </div>
        <div>
          <Button
            content="Click"
            width="180px"
            textColor="white"
            bgColor="black"
            border="2px solid gray"
            marginRight="24px"
          />
          <Button
            content="Click"
            width="180px"
            textColor="black"
            bgColor="yellow"
          />
        </div>
      </div>
    </Card>
  );
};

export default CreateFolder;
