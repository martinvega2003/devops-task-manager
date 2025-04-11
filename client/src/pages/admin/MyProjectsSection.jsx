import React, { useState, useEffect } from 'react';
import api from '../../API/api.interceptors';
import ProjectCard from '../../components/ProjectCard';
import Button from '../../components/Button';
import { ToastContainer, toast } from 'react-toastify';
import { FaPlus, FaCheck } from 'react-icons/fa';

const MyProjectsSection = () => {
  const [projects, setProjects] = useState([]);
  const [sortBy, setSortBy] = useState('created_at'); // Default sorting field
  const [order, setOrder] = useState('ASC'); // Default sorting order
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    deadline: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  })
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [sortBy, order]);

  const fetchProjects = async () => {
    try {
      const response = await api.get(`/projects?sortBy=${sortBy}&order=${order}`);
      if (response.data.length > 0) setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleOrderChange = (e) => {
    setOrder(e.target.value);
  };

  const handleChange = (e) => {
    setProjectData({
      ...projectData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeadlineChange = (e) => {
    const selectedDate = e.target.value; // e.g., "2025-08-01"
    // Create a Date object at local midnight for the selected date
    const date = new Date(selectedDate + "T00:00:00");
    // Convert to an ISO string (this converts local time to UTC)
    // For example, if you're in UTC-4, local midnight "2025-08-01T00:00:00" becomes "2025-08-01T04:00:00Z"
    const isoDate = date.toISOString().replace(/\.\d{3}Z$/, 'Z');
    setProjectData({ ...projectData, deadline: isoDate });
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', projectData)
      setProjectData({ name: '', description: '', deadline: '' });
      setIsModalOpen(false)
    } catch (error) {
      console.log(error)
    }
    fetchProjects();
  };

  const Modal = (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-transparent">
      <div className="absolute z-0 inset-0 bg-white dark:bg-black opacity-90 dark:opacity-70" />
      <div className="relative z-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-subheading dark:text-surface-white font-bold mb-4">Create New Project</h3>
        <form className="text-body dark:text-surface-white">
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={projectData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded"
              placeholder="Your project's name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1" htmlFor="description">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={projectData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded"
              placeholder="Your project's description"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1">
              Deadline
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={projectData.deadline ? projectData.deadline.substring(0, 10) : ''}
              onChange={handleDeadlineChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <Button
              width='fit'
              onClick={handleSubmit}
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

  return (
    <div className="bg-background dark:bg-background-dark min-h-screen">
      {isModalOpen && Modal}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No projects available.
          </p>
          <Button
            width='fit'
            isAddButton={true}
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      ) : (
        <>
          <ToastContainer position="top-right" autoClose={5000} />
          <div className="flex gap-3 justify-between items-center p-4">
            <h2 className="text-heading dark:text-surface-white font-bold">My Projects</h2>
            <Button 
              width='fit' 
              isAddButton={true} 
              onClick={() => setIsModalOpen(true)}
            />
          </div>
          <div className="flex gap-4 items-center p-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="border border-gray-300 dark:border-gray-600 p-2 rounded"
              >
                <option value="created_at">Creation Date</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Order</label>
              <select
                value={order}
                onChange={handleOrderChange}
                className="border border-gray-300 dark:border-gray-600 p-2 rounded"
              >
                <option value="ASC">Ascending</option>
                <option value="DESC">Descending</option>
              </select>
            </div>
          </div>
          <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {
              projects && projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            }
          </div>
        </>
      )}
    </div>
  );
};

export default MyProjectsSection;
