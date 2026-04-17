import * as Accordion from "@radix-ui/react-accordion";
import "./ProjectAccordion.css";
import { useNavigate } from "react-router-dom";
import { deleteProjectApi, updateProjectApi } from "../../services/api";
import ProjectFolder from "../ProjectFolder";
import { useWorkspace } from "../../context/WorkspaceContext";
import { getApiErrorMessage, showErrorToast, showSuccessToast } from "../../helpers/showToast";

export default function ProjectAccordion({ folder, getAllFolders }) {


  const navigate = useNavigate();
    const {
      activeWorkspace
    } = useWorkspace();
  const handleUpdateProject = async (id, payload) => {
    try {
      await updateProjectApi(id, payload);
      getAllFolders();
      showSuccessToast(payload?.status ? "Project status updated" : "Project renamed successfully");
    } catch (err) {
      console.error("Update failed", err);
      showErrorToast(getApiErrorMessage(err, "Failed to update project"));
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProjectApi(id);
      getAllFolders();
      showSuccessToast("Project deleted successfully");
    } catch (err) {
      console.error("Delete failed", err);
      showErrorToast(getApiErrorMessage(err, "Failed to delete project"));
    }
  };
    
  return (
    <>
      <Accordion.Item value={folder._id} className="acc-item">
        <Accordion.Header className="acc-header">
          <Accordion.Trigger className="acc-trigger">
            <div className="left-sec">
              <span className="chevron" />
              <span className="acc-title">{folder.name}</span>
              <span className="count-badge">{folder.projects.length}</span>
            </div>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className="acc-content">
  <div className="acc-content-inner">
    <div
      style={{ zIndex: 1000 }}
      className="grid grid-cols-5 gap-3 px-4 mb-4"
    >
      {folder.projects.map((item) => (        
        <ProjectFolder
          key={item._id}
          project={item}
          onClick={() =>
            navigate(`/video-review/${item._id}?ws=${activeWorkspace?._id}`)
          }
          onRename={(id, name) =>
            handleUpdateProject(id, { name })
          }
          onStatusChange={(id, status) =>
            handleUpdateProject(id, { status })
          }
          onDelete={handleDeleteProject}
        />
      ))}
    </div>
  </div>
</Accordion.Content>
      </Accordion.Item>
    </>
  );
}
