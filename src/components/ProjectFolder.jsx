import Card from "./UI/Card";
import dummy from "../assets/images/dummy.svg";
import dot from "../assets/svgs/dot.svg";
import message from "../assets/svgs/message.svg";

const formatDateTime = (isoString) => {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getTotalComments = (project) => {
  if (!project?.versions?.length) return 0;
  return project.versions.reduce(
    (sum, v) => sum + (v.comments?.length || 0),
    0
  );
};

const STATUS_OPTIONS = [
  { value: "yet to start", label: "Yet to start" },
  { value: "in progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

const ProjectFolder = ({ project, onStatusChange, onClick }) => {
  const createdAtLabel = formatDateTime(project.createdAt);
  const commentCount = getTotalComments(project);

  return (
      <div style={{ color: "white", cursor:'pointer', border:"1px solid #1F1F21", padding:5, borderRadius:25 }}>
        {/* thumbnail */}
        <img onClick={onClick} style={{ width: "100%" }} src={dummy} alt={project.name} />
        {/* title + meta */}
        <div style={{ padding:"2px 5px" }}>
          <div style={{ padding: "0px 8px", marginTop:8, fontFamily:'Gilroy-SemiBold', textTransform:'capitalize' }}>{project.name}</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 8px",
              fontSize: 12,
              color: "#BFBFBF",
            }}
          >
            <div>{createdAtLabel}</div>
            <img style={{ padding: "0 8px" }} src={dot} alt="" />
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                style={{ paddingRight: "4px" }}
                src={message}
                alt="comments"
              />
              <span>{commentCount}</span>
            </div>
          </div>
        </div>
        {/* status */}
        <div style={{ padding: "8px 8px" }}>
          <select
            style={{
              padding: "4px 8px",
              width: "40%",
              borderRadius: "12px",
              outline: "none",
              border: "1px solid #2B2B2B",
              background: "#101013",
              color: "#fff",
              fontFamily: "Gilroy-Regular",
              fontSize: 14,
            }}
            value={project.status}
            onChange={(e) =>
              onStatusChange?.(project._id, e.target.value)
            }
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
  );
};

export default ProjectFolder;
