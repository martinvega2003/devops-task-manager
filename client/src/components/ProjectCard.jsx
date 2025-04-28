import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../API/api.interceptors';
import Button from './Button';
import { toast } from 'react-toastify';

const ProjectCard = ({ project, fetchProjects }) => {
  const navigate = useNavigate();

  const formattedCreatedDate = new Date(project.created_at).toISOString().split('T')[0];
  const formattedDeadline = new Date(project.deadline).toISOString().split('T')[0];

  const handleCardClick = () => {
    navigate(`/home/my-projects/${project.id}`);
  };

  const toggleProjectStatus = async (e) => {
    e.stopPropagation(); // Prevent the click event from propagating to the parent div onClick function

    const newStatus = project.status === 'Active' ? 'Deactive' : 'Active';
    try {
      await api.patch(`/projects/${project.id}/status`, { status: newStatus });
      fetchProjects(); // Refresh the project list after status change
    } catch (error) {
      toast.error('Failed to update project status:', error);
    }
  };

  const deleteProject = async (e) => {
    e.stopPropagation(); // Prevent the click event from propagating to the parent div onClick function
    
    try {
      await api.delete(`/projects/${project.id}`);
      fetchProjects();
      toast.success('Project deleted successfully')
    } catch (error) {
      toast.error('Failed to delete project:', error);
    }
  }

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 h-full border dark:border-surface-white shadow-md p-4 cursor-pointer`}
      onClick={project.status === "Active" ? handleCardClick : () => alert("You must activate the project to view its details.")}
    >
      <div className={`absolute z-10 inset-0 bg-white dark:bg-gray-800 ${project.status === 'Active' ? 'hidden' : 'opacity-70'}`} />
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
      <div className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-900 rounded flex items-center mt-3">
        {/* Horizontal line */}
        <span className="text-body text-gray-700 dark:text-gray-300 mr-2 whitespace-nowrap">
          {formattedCreatedDate}
        </span>
        <div className="min-w-3 min-h-3 bg-primary dark:bg-secondary rounded-full"></div>
        <div className="w-1/2 border-t border-primary dark:border-secondary"></div>
        <div className="min-w-3 min-h-3 bg-primary dark:bg-secondary rounded-full"></div>
        <span className="text-body text-gray-700 dark:text-gray-300 ml-2 whitespace-nowrap">
          {formattedDeadline}
        </span>
      </div>

      {/* Status Toggle Button */}
      <div className="mt-4 flex justify-between items-center gap-2">
        <Button
          onClick={toggleProjectStatus}
          className={project.status === 'Active' ? '' : 'relative z-20'}
        >
          {project.status === 'Active' ? 'Deactivate' : 'Activate'}
        </Button>

        <Button
          onClick={deleteProject}
          isDeleteButton={true}
          className={project.status === 'Active' ? '' : 'relative z-20'}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default ProjectCard;
