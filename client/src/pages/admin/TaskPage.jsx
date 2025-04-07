import React, { useEffect, useState } from 'react';
import api from '../../API/api.interceptors';
import Button from '../../components/Button';
import ErrorContainer from '../../components/ErrorContainer';
import { FaCheck, FaPen } from 'react-icons/fa';

const TaskPage = ({ selectedTask, setSelectedTask }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  // Fetch team members for the assignedUsers editing field
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

  // Start the closing animation with the task data (Avoid the page to go blank before closing)
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedTask(null);
      setIsClosing(false);
    }, 600);
  };

  // Handle input changes for editing

  // Initialize updatedTask with selectedTask or default values
  // If selectedTask is null, set default values
  const [updatedTask, setUpdatedTask] = useState({...selectedTask})

  useEffect(() => {
    if (selectedTask) {
      // Extract the local time for startTime and endTime
      const startTime = new Date(selectedTask.start_time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const endTime = new Date(selectedTask.end_time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      setUpdatedTask({
        ...selectedTask,
        startTime,
        endTime,
        assignedUsers: selectedTask.assigned_users.map(user => user.id) // Initialize assignedUsers with selectedTask's assigned users IDs,
      });
    }
  }, [selectedTask]);

  const handleChange = e => {
    setUpdatedTask({
      ...updatedTask,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()

    // Combine the selected date with the times
    alert(selectedTask.start_time)
    const dateStr = selectedTask.start_time.split('T')[0]; // e.g., "2025-06-06"
    const startTimeCombined = `${dateStr}T${updatedTask.startTime}:00`;
    const endTimeCombined = `${dateStr}T${updatedTask.endTime}:00`;

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
      ...updatedTask,
      startTime: startTimeCombined,
      endTime: endTimeCombined,
    };
  
    alert(JSON.stringify(payload)); // Debugging

    try {
      const response = await api.put('tasks/' + selectedTask.id, payload)
      console.log("project updated")
      setSelectedTask(response.data)
      setIsEditing(false)
      alert('Task updated successfully')
    } catch (error) {
      alert(error)
    }
  }

  const toggleTaskStatus = async () => {
    try {
      let status;
      selectedTask.status === "Completed" ? status = "Pending" : status = "Completed"
      const payload = {
        status,
      }
      // Send the updated status to the server
      const response = await api.patch(`tasks/${selectedTask.id}/status`, payload);
      setSelectedTask({
        ...selectedTask,
        status: response.data.status
      });
    } catch (error) {
      setError(error.response?.data?.msg || "Failed to toggle task status");
    }
  }

  return (
    <div
      className={`fixed z-60 top-0 ${
        selectedTask && !isClosing ? 'right-0' : '-right-full'
      } w-full sm:w-4/5 md:w-1/2 h-full bg-background dark:bg-background-dark px-4 sm:px-8 pb-6 sm:pb-12 overflow-y-scroll cursor-pointer transition-all duration-600`}
    >
      {error && <ErrorContainer error={error} setError={setError} />}
      {selectedTask && (
        <div className="relative flex flex-col justify-start items-start gap-2 pt-20">
          {/* Editing Button */}
          <Button
            onClick={isEditing ? handleSubmit : () => setIsEditing(true)}
            width="fit"
          >
            <div className={`${isEditing ? '' : 'flex items-center gap-2'}`}>
              {isEditing ? 'Save' : 'Edit '}
              {isEditing ? '' : <FaPen />}
            </div>
          </Button>

          {/* Task Title and Description */}
          <div className="w-full flex justify-start items-start gap-2 mt-4">
            <div className="flex flex-col justify-start items-start gap-2 p-2">

              {/* Task Title */}
              {/* If not editing, show the title as a heading */}
              {!isEditing ? (
                <h3 className="text-subheading dark:text-surface-white">
                  {selectedTask.title} 
                </h3>
              ) : (
                <input 
                  name='title'
                  className="w-fit text-subheading font-bold text-surface-black dark:text-surface-white placeholder:text-gray-400 dark:placeholder:text-gray-600" 
                  placeholder='Title cannot be null...'
                  value={updatedTask.title}
                  onChange={handleChange}
                  required
                />
              )}

              {/* Task Description */}
              {/* If not editing, show the description as a paragraph */}
              {!isEditing ? (
                <p className="text-body dark:text-surface-white">
                  {selectedTask.description}
                </p>
              ) : (
                <textarea 
                  name='description'
                  className="w-full text-body font-medium text-surface-black dark:text-surface-white placeholder:text-gray-400 dark:placeholder:text-gray-600" 
                  placeholder='Description cannot be null...'
                  value={updatedTask.description}
                  onChange={handleChange}
                  required
                />
              )}
              
              {/* Task Priority */}
              {/* If not editing, show the priority as a badge */}
              {!isEditing ? (
                <div
                  className={`text-center text-caption text-surface-white py-1 px-3 rounded-md ${
                    selectedTask.priority === 'High'
                      ? 'bg-gradient-to-r from-red-700 to-red-500'
                      : selectedTask.priority === 'Medium'
                      ? 'bg-gradient-to-r from-yellow-700 to-yellow-500'
                      : 'bg-gradient-to-r from-blue-700 to-blue-500'
                  } hover:-translate-y-1 transition duration-200 cursor-pointer`}
                >
                  {selectedTask.priority} 
                </div>
              ) : (
                <div className='flex flex-wrap items-center gap-2'>
                  {[
                    { priority: 'Low', bg: 'bg-gradient-to-r from-blue-700 to-blue-500' },
                    { priority: 'Medium', bg: 'bg-gradient-to-r from-yellow-700 to-yellow-500' },
                    { priority: 'High', bg: 'bg-gradient-to-r from-red-700 to-red-500' },
                  ].map((card, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setUpdatedTask({ ...updatedTask, priority: card.priority })}
                      className={`text-caption text-surface-white py-1 px-3 rounded-sm ${card.bg} hover:scale-105 ${card.priority === updatedTask.priority ? "scale-105" : ""} cursor-pointer`}
                    >
                      <div className="flex flex-nowrap gap-2 items-center">
                        {card.priority}
                        {card.priority === updatedTask.priority ? <FaCheck /> : null}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Task Status */}
              <button onClick={toggleTaskStatus} className={`${selectedTask.status !== "Completed" ? 'border border-gray-700 dark:border-gray-300 text-surface-black dark:text-surface-white' : 'border-success bg-success dark:bg-success-dark text-surface-white flex items-center gap-2'} text-caption px-4 py-1 rounded-md cursor-pointer hover:scale-105 transition duration-200`}>
                {selectedTask.status} {selectedTask.status === "Completed" ? <FaCheck /> : null}
              </button>

              {/* Task Duration */}
              <div className="w-full flex flex-col gap-2">
                <h4 className="text-body font-semibold dark:text-surface-white">
                  Duration:
                </h4>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                  <div className="flex flex-col items-start">
                    <span className="text-caption font-semibold text-gray-600 dark:text-gray-400">
                      Start Time
                    </span>
                    {!isEditing ? (
                      <span className="text-body font-medium text-surface-black dark:text-surface-white">
                        {new Date(selectedTask.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    ) : (
                      <input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={updatedTask.startTime}
                        onChange={handleChange}
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded"
                        required
                      />
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-caption font-semibold text-gray-600 dark:text-gray-400">
                      End Time
                    </span>
                    {!isEditing ? (
                      <span className="text-body font-medium text-surface-black dark:text-surface-white">
                        {new Date(selectedTask.end_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    ) : (
                      <input
                        type="time"
                        id="endTime"
                        name="endTime"
                        value={updatedTask.endTime}
                        onChange={handleChange}
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded"
                        required
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Assigned Users */}
              <div className="w-full flex flex-col gap-2">
                <h4 className="text-body font-semibold dark:text-surface-white">
                  Assigned Users ({selectedTask.assigned_users_count}):
                </h4>
                {!isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.assigned_users[0].id !== null && selectedTask.assigned_users.map(user => (
                      <div
                        key={user.id}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700"
                      >
                        <p className="text-body font-semibold dark:text-surface-white">
                          {user.name}
                        </p>
                        <p className="text-caption dark:text-gray-300">{user.email}</p>
                        <p className="text-caption italic dark:text-gray-400">
                          Role: {user.role}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map((member, i) => {
                      const isSelected = updatedTask.assignedUsers.includes(member.user_id);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setUpdatedTask({
                                ...updatedTask,
                                assignedUsers: updatedTask.assignedUsers.filter(id => id !== member.user_id)
                              });
                            } else {
                              setUpdatedTask({
                                ...updatedTask,
                                assignedUsers: [...updatedTask.assignedUsers, member.user_id]
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
                )}
              </div>

              {/* Close Button */}
              <Button onClick={handleClose} width="fit" isCloseButton={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPage;
