import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import api from '../../API/api.interceptors';
import Button from '../../components/Button';
import { FaCheck, FaPen, FaTrash, FaDownload, FaTimes, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';

const TaskPage = ({ selectedTask, setSelectedTask, fetchTasks }) => {

  const {user} = useContext(AuthContext)

  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [assets, setAssets] = useState([]);

  // Fetch team members for the assignedUsers editing field
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
    fetchTask()
  }, [selectedTask]);

  const fetchAssets = async () => {
    try {
      const response = await api.get(`tasks/${selectedTask.id}/assets/`);
      setAssets(response.data);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to fetch assets", {
        toastId: 'assets-fetch-error'
      });
    }
  };

  const fetchTask = () => {
    if (selectedTask) {
      // Format time
      const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      };

      const startTime = selectedTask.start_time
        ? formatTime(selectedTask.start_time)
        : "00:00"; // Default to "00:00" if start_time is invalid

      const endTime = selectedTask.end_time
        ? formatTime(selectedTask.end_time)
        : "00:00"; // Default to "00:00" if end_time is invalid

      setUpdatedTask({
        ...selectedTask,
        startTime,
        endTime,
        assignedUsers: selectedTask.assigned_users.map(user => user.id) // Initialize assignedUsers with selectedTask's assigned users IDs,
      });

      fetchAssets();
    }
  }

  const handleChange = e => {
    setUpdatedTask({
      ...updatedTask,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()

    // Combine the selected date with the times
    const dateStr = selectedTask.start_time.split('T')[0]; // e.g., "2025-06-06"
    const startTimeCombined = `${dateStr}T${updatedTask.startTime}:00`;
    const endTimeCombined = `${dateStr}T${updatedTask.endTime}:00`;

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
      ...updatedTask,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    };

    try {
      const response = await api.put('tasks/' + selectedTask.id, payload)
      setSelectedTask(response.data)
      fetchTasks();
      setIsEditing(false)
      toast.success('Task updated successfully', {
        toastId: 'task-update-success'
      })
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Could not update task', {
        toastId: 'task-update-error'
      })
    }
  }

  // Handle asset download
  const handleAssetDownload = (fileUrl, filename) => {
    try {
      const baseUrl = "http://localhost:5001"; // Replace with your server's base URL
      const fullUrl = `${baseUrl}${fileUrl}`;

      const link = document.createElement('a');
      link.target = '_blank'; // Open in a new tab
      link.href = fullUrl;
      link.download = filename; 
      link.click();
    } catch (error) {
      toast.error('Could not download Asset', {
        toastId: 'asset-download-error'
      })
    }
  };

  // Handle file upload
  const handleAssetUpload = async (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`tasks/${selectedTask.id}/assets/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("File uploaded successfully", {
        toastId: 'asset-upload-success'
      });
      // Fetch the updated list of assets
      const response = await api.get(`tasks/${selectedTask.id}/assets/`);
      setAssets(response.data);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to upload file", {
        toastId: 'asset-upload-error'
      });
    }
  };

  // Handle asset delete
  const handleAssetDelete = async (assetId) => {
    try {
      await api.delete(`tasks/${selectedTask.id}/assets/${assetId}`);
      toast.success("Asset deleted successfully", {
        toastId: 'asset-delete-success'
      });
      // Fetch the updated list of assets
      const response = await api.get(`tasks/${selectedTask.id}/assets/`);
      setAssets(response.data);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to delete asset", {
        toastId: 'asset-delete-error'
      });
    }
  };

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
      fetchTasks(); 
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to toggle task status", {
        toastId: 'task-status-toggle-error'
      });
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`tasks/${selectedTask.id}`);
      setSelectedTask(null);
      fetchTasks();
      handleClose();
      toast.success('Task deleted successfully', {
        toastId: 'task-delete-success'
      });
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to delete task", {
        toastId: 'task-delete-error'
      });
    }
  }

  return (
    <div
      className={`fixed z-60 top-0 ${
        selectedTask && !isClosing ? 'right-0' : '-right-full'
      } w-full sm:w-4/5 md:w-1/2 h-full bg-background dark:bg-background-dark px-4 sm:px-8 pb-6 sm:pb-12 overflow-y-scroll cursor-pointer transition-all duration-600`}
    >
      {selectedTask && (
        <div className="relative w-full flex flex-col justify-start items-start gap-2 pt-20">
          {/* Editing and Delete Buttons */}
          <div className="w-full flex justify-between gap-2">
            {/* Close Button */}
            {!isEditing ? (
              <Button onClick={handleClose} width="fit" isCloseButton={true} />
            ) : (
              <Button
                onClick={() => {
                  setIsEditing(false);
                  fetchTask();
                }}
                width='fit'
                className='flex items-center gap-2 text-red-500'
              >
                <FaTimes /> Cancel
              </Button>
            )}
            
            <div className='flex gap-2'>
              <Button
                onClick={isEditing ? handleSubmit : () => setIsEditing(true)}
                width="fit"
                className={`${selectedTask.status === "Completed" ? 'hidden' : ''}`}
                isTransparent={false}
              >
                <div className='flex items-center gap-2'>
                  {isEditing ? 'Save' : 'Edit '} 
                  {isEditing ? <FaSave /> : <FaPen />}
                </div>
              </Button>

              <Button
                onClick={handleDelete}
                width="fit"
                isDeleteButton={true}
                isTransparent={false}
              >
                <div className='flex items-center gap-2'>
                  Delete <FaTrash />
                </div>
              </Button>
            </div>
          </div>

          {/* Task Title and Description */}
          <div className="w-full flex justify-start items-start gap-2 mt-4">
            <div className="w-full flex flex-col justify-start items-start gap-2 p-2">

              {/* Task Status */}
              <button onClick={toggleTaskStatus} className={`${selectedTask.status !== "Completed" ? 'border border-gray-700 dark:border-gray-300 text-surface-black dark:text-surface-white' : 'border-success bg-success dark:bg-success-dark text-surface-white flex items-center gap-2'} text-caption px-4 py-1 rounded-md cursor-pointer hover:scale-105 transition duration-200`}>
                {selectedTask.status} {selectedTask.status === "Completed" ? <FaCheck /> : null}
              </button>

              {/* Task Title */}
              {/* If not editing, show the title as a heading */}
              {!isEditing ? (
                <h3 className={`text-subheading dark:text-surface-white ${selectedTask.status === "Completed" ? 'line-through flex items-center gap-2' : ''}`}>
                  {selectedTask.title} {selectedTask.status === "Completed" ? <FaCheck className='text-success dark:text-success-dark' /> : null}
                </h3>
              ) : (
                <input 
                  name='title'
                  className="w-full text-subheading font-bold text-surface-black dark:text-surface-white placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-2 outline-primary dark:outline-primary-dark rounded-md p-2" 
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
                  className="w-full h-40 text-body font-medium text-surface-black dark:text-surface-white placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-2 outline-primary dark:outline-primary-dark rounded-md p-2" 
                  placeholder='Description cannot be null...'
                  value={updatedTask.description}
                  onChange={handleChange}
                  required
                />
              )}
              
              {/* Task Priority */}
              {/* If not editing, show the priority as a badge */}
              {!isEditing ? (
                <div className="flex items-center justify-start gap-2">
                  <p className="text-caption text-surface-black dark:text-surface-white">
                    Priority:
                  </p>
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

              {/* Task Duration */}
              <div className="min-w-full flex flex-col gap-2">
                <div className={`min-w-full flex ${!isEditing ? 'items-center': 'flex-col lg:flex-row items-start lg:items-center'} gap-2 p-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700`}>
                  <div className="flex flex-col items-start">
                    <span className="text-caption font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      Start Time
                    </span>
                    {!isEditing ? (
                      <span className="text-body font-medium text-surface-black dark:text-surface-white">
                        {String(new Date(selectedTask.start_time).getHours()).padStart(2, '0')}:{String(new Date(selectedTask.start_time).getMinutes()).padStart(2, '0')}
                      </span>
                    ) : (
                      <div className="flex items-center gap-4">
                        {/* Hour scrollable picker */}
                        <div className="w-16 h-32 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col items-center">
                          {Array.from({ length: 24 }, (_, h) => (
                            <div
                              key={h}
                              onClick={() =>
                                setUpdatedTask({
                                  ...updatedTask,
                                  startTime: `${h.toString().padStart(2, "0")}:${updatedTask.startTime.split(":")[1]}`,
                                })
                              }
                              className={`w-full py-2 text-center cursor-pointer rounded ${
                                h === parseInt(updatedTask.startTime.split(":")[0], 10)
                                  ? "bg-primary text-white font-bold shadow"
                                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
                              }`}
                              style={{ transition: "all 0.15s" }}
                            >
                              {h.toString().padStart(2, "0")}
                            </div>
                          ))}
                        </div>
                        <span className="text-xl font-bold">:</span>
                        {/* Minute scrollable picker */}
                        <div className="w-16 h-32 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col items-center">
                          {Array.from({ length: 60 }, (_, m) => (
                            <div
                              key={m}
                              onClick={() =>
                                setUpdatedTask({
                                  ...updatedTask,
                                  startTime: `${updatedTask.startTime.split(":")[0]}:${m.toString().padStart(2, "0")}`,
                                })
                              }
                              className={`w-full py-2 text-center cursor-pointer rounded ${
                                m === parseInt(updatedTask.startTime.split(":")[1], 10)
                                  ? "bg-primary text-white font-bold shadow"
                                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
                              }`}
                              style={{ transition: "all 0.15s" }}
                            >
                              {m.toString().padStart(2, "0")}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="w-full mx-1 border-2 border-gray-400 dark:border-gray-500 rounded-lg" />
                  <div className="flex flex-col items-start">
                    <span className="text-caption font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      End Time
                    </span>
                    {!isEditing ? (
                      <span className="text-body font-medium text-surface-black dark:text-surface-white">
                        {String(new Date(selectedTask.end_time).getHours()).padStart(2, '0')}:{String(new Date(selectedTask.end_time).getMinutes()).padStart(2, '0')}
                      </span>
                    ) : (
                      <div className="flex items-center gap-4">
                        {/* Hour scrollable picker */}
                        <div className="w-16 h-32 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col items-center">
                          {Array.from({ length: 24 }, (_, h) => (
                            <div
                              key={h}
                              onClick={() =>
                                setUpdatedTask({
                                  ...updatedTask,
                                  endTime: `${h.toString().padStart(2, "0")}:${updatedTask.endTime.split(":")[1]}`,
                                })
                              }
                              className={`w-full py-2 text-center cursor-pointer rounded ${
                                h === parseInt(updatedTask.endTime.split(":")[0], 10)
                                  ? "bg-primary text-white font-bold shadow"
                                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
                              }`}
                              style={{ transition: "all 0.15s" }}
                            >
                              {h.toString().padStart(2, "0")}
                            </div>
                          ))}
                        </div>
                        <span className="text-xl font-bold">:</span>
                        {/* Minute scrollable picker */}
                        <div className="w-16 h-32 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col items-center">
                          {Array.from({ length: 60 }, (_, m) => (
                            <div
                              key={m}
                              onClick={() =>
                                setUpdatedTask({
                                  ...updatedTask,
                                  endTime: `${updatedTask.endTime.split(":")[0]}:${m.toString().padStart(2, "0")}`,
                                })
                              }
                              className={`w-full py-2 text-center cursor-pointer rounded ${
                                m === parseInt(updatedTask.endTime.split(":")[1], 10)
                                  ? "bg-primary text-white font-bold shadow"
                                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
                              }`}
                              style={{ transition: "all 0.15s" }}
                            >
                              {m.toString().padStart(2, "0")}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Assigned Users */}
              <div className="w-full flex flex-col gap-2">
                <h4 className="text-body font-semibold dark:text-surface-white">
                  Assigned To:
                </h4>
                {!isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.assigned_users[0].id !== null && selectedTask.assigned_users.map(user => (
                      <div
                        key={user.id}
                        className={`p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                          ${user.role === "developer" ? "bg-blue-200 dark:bg-blue-900" : 
                            user.role === "designer" ? "bg-yellow-200 dark:bg-yellow-900" : 
                            user.role === "administrative" ? "bg-green-200 dark:bg-green-900" : 
                            "bg-red-200 dark:bg-red-900"} hover:-translate-y-1 transition duration-300 cursor-pointer`
                        }
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

                    {selectedTask.assigned_users[0].id === null && (
                      <p className="text-caption text-gray-500 dark:text-gray-400">
                        No users assigned.
                      </p>
                    )}
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

              {/* Assets Section */}
              <div className="w-full flex flex-col gap-4 mt-4">
                <h4 className="text-body font-semibold dark:text-surface-white">
                  Assets:
                </h4>
                {assets.length === 0 ? (
                  <div className="flex justify-between items-center">
                    <p className="text-caption text-gray-500 dark:text-gray-400">
                      No assets available.
                    </p>
                    <Button width="fit" isAddButton={true} onClick={() => document.getElementById("fileInput").click()} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {assets.map(asset => (
                      <div
                        key={asset.id}
                        className="p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 flex flex-col justify-between"
                      >
                        <div className='mb-2'>
                          <h5 className="text-body font-semibold dark:text-surface-white truncate">
                            {asset.filename}
                          </h5>
                          <p className="text-caption dark:text-gray-300">
                            Uploaded by: {asset.uploaded_by.name} ({asset.uploaded_by.role})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            width="fit"
                            onClick={() => handleAssetDownload(asset.file_url, asset.filename)}
                            isTransparent={false}
                          >
                            <FaDownload /> 
                          </Button>
                          {(user.role === "Admin" || asset.uploaded_by.id === user.id) ? (
                            <Button
                              width="fit"
                              isDeleteButton={true}
                              onClick={() => handleAssetDelete(asset.id)}
                              isTransparent={false}
                            >
                              <FaTrash />
                            </Button>
                          ) : (
                            <div className="text-caption text-gray-500 dark:text-gray-400">
                              Cannot delete
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {assets.length > 0 && (
                  <Button width="fit" isAddButton={true} onClick={() => document.getElementById("fileInput").click()} />
                )}
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                id="fileInput"
                style={{ display: "none" }}
                onChange={handleAssetUpload}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPage;
