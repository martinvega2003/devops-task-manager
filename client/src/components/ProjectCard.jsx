import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 h-full border shadow-md p-4 cursor-pointer"
      onClick={handleCardClick}
    >
      <h3 className="text-subheading font-bold text-surface-black dark:text-surface-white truncate">
        {project.name}
      </h3>
      <p className="line-clamp-3 text-body text-gray-600 dark:text-gray-400">
        {project.description}
      </p>
      <p className="mt-2 text-caption font-semibold text-gray-700 dark:text-gray-300">
        Tasks:
      </p>
      <div className="flex gap-2">
        <span className="text-caption font-semibold text-red-700 dark:text-red-400">
          Pending: {project.task_counts.pending}
        </span>
        <span className="text-caption font-semibold text-yellow-700 dark:text-yellow-400">
          Active: {project.task_counts.in_progress}
        </span>
        <span className="text-caption font-semibold text-green-700 dark:text-green-400">
          Completed: {project.task_counts.completed}
        </span>
      </div>
      <div>
        <span className="text-caption font-semibold text-gray-700 dark:text-gray-300">
          Active Members: {project.active_members}
        </span>
      </div>
      {/* Timeline component can be added here */}
    </div>
  );
};

export default ProjectCard;
