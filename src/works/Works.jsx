import { Link } from "react-router-dom";
import { projectsData } from "./projectsData.js";
import "./Works.css";

export default function Works() {
  return (
    <section className="works-section">
      <div className="works-container">
        {projectsData.map((project) => (
          <Link 
            to={`/works/${project.id}`} 
            key={project.id} 
            className="works-card"
          >
            <div className="image-wrapper">
              <img src={project.image} alt={project.title} />
              <h2 className="project-title">{project.title}</h2>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}