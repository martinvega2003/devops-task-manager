import React, {useState, useEffect, useRef} from "react";
import api from "../API/api.interceptors";
import Button from "./Button";
import { FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";

const AddTaskForm = ({ project_id, setIsTaskFormOpen, modalCell, fetchTasks }) => {
  // modalCell is assumed to contain the selected date (a Date object)
  // Initialize startTime and endTime as "HH:MM" strings (24-hour format)
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: "Low",
    status: "Pending",
    projectId: project_id,
    startTime: "00:00",  
    endTime: "00:00",  
    assignedUsers: []
  });

  const [teamMembers, setTeamMembers] = useState([]);

  // Fetch team members for the assignedUsers field
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const res = await api.get('team/team-members');
        setTeamMembers(res.data.teamMembers);
      } catch (error) {
        toast.error(error.response?.data?.msg || "Failed to fetch team members", {
          toastId: 'team-members-fetch-error'
        });
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
      toast.error("No Date Selected", {
        toastId: 'no-date-error'
      });
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
      toast.error("Task duration must be at least 15 minutes.", {
        toastId: 'task-min-duration-error'
      });
      return;
    }
    if (diffMinutes > 480) {
      toast.error("Task duration cannot exceed 8 hours.", {
        toastId: 'task-max-duration-error'
      });
      return;
    }

    // Prepare data to send
    const payload = {
      ...taskData,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    };

    try {
      await api.post('/tasks', payload);
      setTaskData({
        title: '',
        description: '',
        priority: "Low",
        status: "Pending",
        projectId: project_id,
        startTime: "00:00",  
        endTime: "00:00",  
        assignedUsers: []
      });
      fetchTasks()
      setIsTaskFormOpen(false);
      toast.success('Task added successfully', {
        toastId: 'task-submit-success'
      })
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to Add Task", {
        toastId: 'task-submit-error'
      });
    }
  };

  // Handle task time block input
  
  // 1 Local state for each two-digit field
  const [startHour, setStartHour] = useState('00');
  const [startMin,  setStartMin]  = useState('00');
  const [endHour,   setEndHour]   = useState('00');
  const [endMin,    setEndMin]    = useState('00');
  
  // 2 Validation helper
  function validate(part, val) {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0) return false;
    if (part === 'hour' && num > 23) {
      toast.error('Hour must be between 00 and 23');
      return false;
    }
    if (part === 'min' && num > 59) {
      toast.error('Minute must be between 00 and 59');
      return false;
    }
    return true;
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-transparent">
      <div className="relative z-10 bg-white dark:bg-gray-800 p-6 pb-24 sm:pb-6 rounded-lg shadow-lg w-full h-full overflow-auto">
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

          <div className="mb-4 flex flex-col md:flex-row md:justify-between lg:justify-evenly gap-4">
            {/* Custom Time Picker */}
            {["startTime", "endTime"].map((field, i) => {
              const label = field === "startTime" ? "Start Time" : "End Time";
              const [h, m] = taskData[field].split(":");

              return (
                <div key={i} className="flex items-center gap-2">
                  {/* Hour */}
                  <input
                    type="text"
                    className="w-12 text-center rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-1"
                    maxLength={2}
                    value={field === "startTime" ? startHour : endHour}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '');
                      if (v.length <= 2 && validate('hour', v)) field === "startTime" ? setStartHour(v).padStart(2, '0') : setEndHour(v).padStart(2, '0')
                    }}
                    onBlur={() => {
                      let v = field === "startTime" ? startHour : endHour;
                      if (v === '') v = '00';
                      else if (v.length === 1) v = v.padStart(2, '0');
                      if (!validate('hour', v)) v = field === "startTime" ? startHour.padStart(2, '0') : endHour.padStart(2, '0');
                      field === "startTime" ? setStartHour(v).padStart(2, '0') : setEndHour(v).padStart(2, '0')
                      setTaskData({
                        ...taskData,
                        [field]: `${v}:${field === "startTime" ? startMin : endMin}`,
                      });
                    }}
                  />

                  <span className="text-xl font-bold">:</span>

                  {/* Minute */}
                  <input
                    type="text"
                    className="w-12 text-center rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-1"
                    maxLength={2}
                    value={field === "startTime" ? startMin : endMin}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '');
                      if (v.length <= 2 && validate('min', v)) field === "startTime" ? setStartMin(v).padStart(2, '0') : setEndMin(v).padStart(2, '0')
                    }}
                    onBlur={() => {
                      let v = field === "startTime" ? startMin : endMin;
                      if (v === '') v = '00';
                      else if (v.length === 1) v = v.padStart(2, '0');
                      if (!validate('min', v)) v = field === "startTime" ? startMin.padStart(2, '0') : endMin.padStart(2, '0')
                      field === "startTime" ? setStartMin(v).padStart(2, '0') : setEndMin(v).padStart(2, '0')
                      setTaskData({
                        ...taskData,
                        [field]: `${field === "startTime" ? startHour : endHour}:${v}`,
                      });
                    }}
                  />
                </div>
              );
            })}
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
          <div className="flex justify-end space-x-2 pb-8 sm:pb-0">
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