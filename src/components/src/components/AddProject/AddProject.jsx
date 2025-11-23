import Button from "../../UI/Button";
import Card from "../../UI/Card";
import "./AddProject.css";
import cancelIcon from "../../assets/icons/cancel.svg";
import uploadIcon from "../../assets/icons/upload.svg";

const AddProject = () => {
  return (
    <Card width="45%" padding="24px 24px">
      <div style={{ color: "white" }}>
        <div className="head">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ paddingBottom: "4px" }}>Add project</div>
            <img src={cancelIcon} alt="" />
          </div>
          <div>Give a name for the project and optionally upload the video</div>
        </div>
        <div className="body">
          <div style={{ paddingBottom: "4px" }}>Project name *</div>
          <input
            placeholder="Company Intro"
            style={{
              width: "92%",
              padding: "8px",
              outline: "none",
              borderRadius: "8px",
            }}
            type="text"
          />
        </div>
        {/* upload project file */}
        <div className="body">
          <div style={{ paddingBottom: "8px" }}>
            Upload project file (Optional)
          </div>
          <div
            style={{
              padding: "24px 0",
              border: "2px dotted gray",
              width: "95%",
              borderRadius: "8px",
              display:"flex",
              flexDirection:"column",
              alignItems:"center"
            }}
          >
            <img src={uploadIcon} alt="" />
            <div style={{marginTop:"8px"}}> <a href="#">Click to upload</a> or drag and drop</div>
          </div>
        </div>
        {}
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

export default AddProject;
