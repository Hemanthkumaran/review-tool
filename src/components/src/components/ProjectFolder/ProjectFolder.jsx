import Card from "../../UI/Card";
import dummy from "../../assets/images/dummy.svg";
import dot from "../../assets/icons/dot.svg";
import message from "../../assets/icons/message.svg";
const ProjectFolder = () => {
  return (
    <Card width="25%" padding="4px" borderRadius="18px">
      <div style={{ color: "white" }}>
        <img style={{ width: "100%" }} src={dummy} alt="" />
        <div>
          <div style={{ padding: "8px 8px" }}>Company Intro</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 8px",
            }}
          >
            <div>11 Sep 2025, 2:07pm</div>
            <img style={{ padding: "0 8px" }} src={dot} alt="" /> 
            <div style={{ display: "flex", alignItems: "center" }}>
              <img style={{ paddingRight: "4px" }} src={message} alt="" />
              <span>0</span>
            </div>
          </div>
        </div>
        <div style={{ padding: "8px 8px" }}>
          <select
            style={{
              padding: "4px 4px",
              width: "60%",
              borderRadius: "12px",
              outline: "none",
            }}
            name="cars"
            id="cars"
          >
            <option value="volvo">Yet to start</option>
            <option value="saab">Saab</option>
            <option value="mercedes">Mercedes</option>
            <option value="audi">Audi</option>
          </select>
        </div>
      </div>
    </Card>
  );
};

export default ProjectFolder;
