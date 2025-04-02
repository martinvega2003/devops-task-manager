import React, {useState, useEffect} from "react";
import api from "../API/api.interceptors";
import Button from "./Button";
import { FaCheck } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import ErrorContainer from "./ErrorContainer";

const AddTaskForm = ({ project_id, setIsTaskFormOpen, modalCell, fetchTasks }) => {
  // modalCell is assumed to contain the selected date (a Date object)
  // Initialize startTime and endTime as "HH:MM" strings (24-hour format)
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: "Low",
    status: "Pending",
    projectId: project_id,
    startTime: "12:00",  
    endTime: "12:15",  
    assignedUsers: []
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [error, setError] = useState(null)

  // Fetch team members for the assignedUsers field
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const res = await api.get('team/team-members');
        setTeamMembers(res.data.teamMembers);
      } catch (error) {
        setError(error.response?.data?.msg || "Failed to fetch team members");
      }
    };
    fetchTeamMembers();
  }, []);

  const handleChange = (e) => {
    setTaskData({
      ...taskData,
      [e.target.name]: e.target.value,
    });
  };

  // Validation and submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modalCell) {
      setError("No Date Selected");
      return;
    }
    // Combine the selected date with the times
    const dateStr = modalCell.date.toISOString().split('T')[0]; // e.g., "2025-06-06"
    const startTimeCombined = `${dateStr}T${taskData.startTime}:00`;
    const endTimeCombined = `${dateStr}T${taskData.endTime}:00`;

    // Validate duration: at least 15 minutes, no more than 8 hours (480 minutes)
    const start = new Date(startTimeCombined);
    const end = new Date(endTimeCombined);
    const diffMinutes = (end - start) / (1000 * 60);
    if (diffMinutes < 15) {
      setError("Task duration must be at least 15 minutes.");
      return;
    }
    if (diffMinutes > 480) {
      setError("Task duration cannot exceed 8 hours.");
      return;
    }

    // Prepare data to send
    const payload = {
      ...taskData,
      startTime: startTimeCombined,
      endTime: endTimeCombined,
    };

    try {
      await api.post('/tasks', payload);
      setTaskData({
        title: '',
        description: '',
        priority: "Low",
        status: "Pending",
        projectId: project_id,
        startTime: "12:00",  
        endTime: "12:15",  
        assignedUsers: []
      });
      fetchTasks()
      setIsTaskFormOpen(false);
    } catch (error) {
      setError(error.response?.data?.msg || "Failed to Add Task");
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-transparent">
      {error && <ErrorContainer error={error} setError={setError} />}
      <div className="absolute z-0 inset-0 bg-white dark:bg-black opacity-90 dark:opacity-70" />
      <div className="relative z-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[60%] aspect-square overflow-auto">
        <h3 className="text-subheading dark:text-surface-white font-bold mb-4">Add New Task</h3>
        <form className="text-body dark:text-surface-white">
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={taskData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded"
              placeholder="Task title"
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
              value={taskData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded"
              placeholder="Task description"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1" htmlFor="priority">
              Priority
            </label>
            <div className="flex flex-wrap justify-start items-center gap-2 p-2 pl-0">
              {[
                { priority: 'Low', bg: 'bg-gradient-to-r from-blue-700 to-blue-500' },
                { priority: 'Medium', bg: 'bg-gradient-to-r from-yellow-700 to-yellow-500' },
                { priority: 'High', bg: 'bg-gradient-to-r from-red-700 to-red-500' },
              ].map((card, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTaskData({ ...taskData, priority: card.priority })}
                  className={`text-caption py-2 px-4 rounded-sm ${card.bg} hover:scale-105 ${card.priority === taskData.priority ? "scale-105" : ""} cursor-pointer`}
                >
                  <div className="flex flex-nowrap gap-2 items-center">
                    {card.priority}
                    {card.priority === taskData.priority ? <FaCheck /> : null}
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* Start Time Field (only hours and minutes) */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1" htmlFor="startTime">
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={taskData.startTime}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded"
              required
            />
          </div>
          {/* End Time Field (only hours and minutes) */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1" htmlFor="endTime">
              End Time
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={taskData.endTime}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded"
              required
            />
          </div>
          {/* Assigned Users Section */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1">
              Assign Users
            </label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member, i) => {
                const isSelected = taskData.assignedUsers.includes(member.user_id);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setTaskData({
                          ...taskData,
                          assignedUsers: taskData.assignedUsers.filter(id => id !== member.user_id)
                        });
                      } else {
                        setTaskData({
                          ...taskData,
                          assignedUsers: [...taskData.assignedUsers, member.user_id]
                        });
                      }
                    }}
                    className={`text-caption py-2 px-4 rounded-sm ${isSelected ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'} hover:scale-105 cursor-pointer`}
                  >
                    {member.username}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              width="fit"
              onClick={() => setIsTaskFormOpen(false)}
              isCloseButton={true}
            >
              Cancel
            </Button>
            <Button
              width="fit"
              isAddButton={true}
              onClick={handleSubmit}
            >
              Add Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskForm