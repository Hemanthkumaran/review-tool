import * as Accordion from "@radix-ui/react-accordion";
import "./AccordionStyles.css";
import ACard from "./Acard";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../../routes/paths";
import { deleteProjectApi, updateProjectApi } from "../../../../services/api";
import ProjectFolder from "../../../ProjectFolder";

export default function ProjectAccordion({ folder, getAllFolders }) {

  const navigate = useNavigate();
  console.log(folder);

  
    const handleUpdateProject = async (id, payload) => {
      try {
        await updateProjectApi(id, payload);
        getAllFolders();
      } catch (err) {
        console.error("Update failed", err);
      }
    };
  
    const handleDeleteProject = async (id) => {
      try {
        await deleteProjectApi(id);
        getAllFolders();
      } catch (err) {
        console.error("Delete failed", err);
      }
    };
    
  return (
    <Accordion.Root type="multiple" className="accordion-root">
      {/* ABC PROJECTS */}
      <Accordion.Item value="abc" className="acc-item">
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
            navigate(PATHS.VIDEO_REVIEW, {
              state: { projectId: item._id },
            })
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
    </Accordion.Root>
  );
}
