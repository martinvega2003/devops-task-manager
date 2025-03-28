import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const formattedCreatedDate = new Date(project.created_at).toISOString().split('T')[0];
  const formattedDeadline = new Date(project.deadline).toISOString().split('T')[0];

  const handleCardClick = () => {
    navigate(`/home/my-projects/${project.id}`);
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 h-full border dark:border-surface-white shadow-md p-4 cursor-pointer"
      onClick={handleCardClick}
    >
      <h3 className="text-body font-bold text-surface-black dark:text-surface-white truncate">
        {project.name}
      </h3>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="text-caption text-surface-white font-semibold py-2 px-4 rounded bg-red-700 dark:bg-red-400">
          Pending: {project.task_counts.pending}
        </span>
        <span className="text-caption text-surface-white font-semibold py-2 px-4 rounded bg-yellow-700 dark:bg-yellow-400">
          Started: {project.task_counts.in_progress}
        </span>
        <span className="text-caption text-surface-white font-semibold py-2 px-4 rounded bg-green-700 bg:text-green-400">
          Completed: {project.task_counts.completed}
        </span>
      </div>
      <div>
        <span className="text-caption font-semibold text-gray-700 dark:text-gray-300">
          Active Members: {project.active_members}
        </span>
      </div>

      {/* Timeline Section */}
      <div className="relative mt-3">
        {/* Horizontal line */}
        <div className="absolute top-1/2 w-full border-t border-gray-300 dark:border-gray-600"></div>
        {/* Start marker */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
          <div className="w-3 h-3 bg-primary dark:bg-secondary rounded-full"></div>
        </div>
        {/* End marker */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <div className="w-3 h-3 bg-primary dark:bg-secondary rounded-full"></div>
        </div>
        {/* Dates */}
        <div className="relative flex justify-between">
          <div className="bg-white dark:bg-gray-800 px-2">
            <span className="text-body text-gray-700 dark:text-gray-300">
              {formattedCreatedDate}
            </span>
          </div>
          <div className="bg-white dark:bg-gray-800 px-2">
            <span className="text-body text-gray-700 dark:text-gray-300">
              {formattedDeadline}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
