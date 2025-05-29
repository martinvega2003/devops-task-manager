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
        startTime: "12:00",  
        endTime: "12:15",  
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

  //Scrolling Animation for Time Picker:
  // 1. base arrays
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
   
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
 
  // 2. triple-wrap for infinite scroll
  const hours3   = [...hours, ...hours, ...hours];
  const minutes3 = [...minutes, ...minutes, ...minutes];
 
  // 3. one ref per field+type
  const hourRefs   = { startTime: useRef(null), endTime: useRef(null) };
  const minuteRefs = { startTime: useRef(null), endTime: useRef(null) };
 
  // 4. scroll handler
  const ITEM_H = 32; // must match your .py-2 line-height
  function handleWrapScroll(e, type, field) {
    const ref = e.target;
    const len = type === "hour" ? hours.length : minutes.length;
    const blockHeight = len * ITEM_H;
    // if you scroll into the first copy
    if (ref.scrollTop < ITEM_H) {
      ref.scrollTop += blockHeight;
    }
    
    // if you scroll into the last copy
    else if (ref.scrollTop > blockHeight * 2) {
      ref.scrollTop -= blockHeight;
    }
  }
 
  // 5. on mount, position each picker in the middle copy
  useEffect(() => {
    ["startTime", "endTime"].forEach((field) => {
      const { [field]: val } = taskData;
      const hour = parseInt(val.split(":")[0], 10);
      const minute = parseInt(val.split(":")[1], 10);
      const hrEl = hourRefs[field].current;
      const mnEl = minuteRefs[field].current;
      if (hrEl) hrEl.scrollTop = (hours.length + hour) * ITEM_H;
      if (mnEl) mnEl.scrollTop = (minutes.length + minute) * ITEM_H;
    });
  }, []); // run once


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
            {["startTime", "endTime"].map((field) => {
  const label = field === "startTime" ? "Start Time" : "End Time";
  const [h, m] = taskData[field].split(":");
  const hour   = parseInt(h, 10);
  const minute = parseInt(m, 10);

  return (
    <div key={field}>
      <label className="block text-gray-700 dark:text-gray-200 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-4">
        {/* Hour scrollable picker */}
        <div
          ref={hourRefs[field]}
          onScroll={(e) => handleWrapScroll(e, "hour", field)}
          className="w-16 h-32 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col items-center"
        >
          {hours3.map((hStr, idx) => (
            <div
              key={`h-${idx}`}
              onClick={() =>
                setTaskData({
                  ...taskData,
                  [field]: `${hStr}:${m.padStart(2, "0")}`,
                })
              }
              className={`w-full py-2 text-center cursor-pointer rounded ${
                parseInt(hStr, 10) === hour
                  ? "bg-primary text-white font-bold shadow"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              style={{ transition: "all 0.15s" }}
            >
              {hStr}
            </div>
          ))}
        </div>

        <span className="text-xl font-bold">:</span>

        {/* Minute scrollable picker */}
        <div
          ref={minuteRefs[field]}
          onScroll={(e) => handleWrapScroll(e, "minute", field)}
          className="w-16 h-32 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col items-center"
        >
          {minutes3.map((mStr, idx) => (
            <div
              key={`m-${idx}`}
              onClick={() =>
                setTaskData({
                  ...taskData,
                  [field]: `${h.padStart(2, "0")}:${mStr}`,
                })
              }
              className={`w-full py-2 text-center cursor-pointer rounded ${
                parseInt(mStr, 10) === minute
                  ? "bg-primary text-white font-bold shadow"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              style={{ transition: "all 0.15s" }}
            >
              {mStr}
            </div>
          ))}
        </div>
      </div>
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