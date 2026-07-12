import { useParams, Navigate } from "react-router-dom";
import { projectsData } from "./projectsData.js";
import "./ProjectDetails.css";

export default function ProjectDetails() {
  const { projectId } = useParams();
  
  const project = projectsData.find(p => p.id === projectId);
  // redirection to works if incorrect url is typed
  if (!project) return <Navigate to="/works" />;

  return (
    <section className="project-details-section">
      {/* Blurred background */}
      <div 
        className="project-bg-blur" 
        style={{ backgroundImage: `url('${project.image}')` }}
      ></div>
      
      <div className="project-gradient-overlay"></div>
      
      <div className="project-content">
        <div className="project-header">
          <h4 className="project-stage">{project.stage}</h4>
          <h1 className="project-title-large">{project.title}</h1>
        </div>

        <div className="project-body">
          {Array.isArray(project.description) ? (
            project.description.map((paragraph, index) => (
              <p key={index} className="project-desc">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="project-desc">{project.description}</p>
          )}
        </div>
      </div>
    </section>
  );
}