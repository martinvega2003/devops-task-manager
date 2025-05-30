import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import api from '../../API/api.interceptors';
import Button from '../../components/Button';
import { FaCheck, FaTrash, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';

const TaskPage = ({ taskId, fetchTasks, setSelectedTask }) => {

  const {user} = useContext(AuthContext)

  const [task, setTask] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    fetchTask();
    if (task) fetchAssets();
  }, [taskId, task]);

  // fetch and set task data
  const fetchTask = async () => {
    if (!taskId) alert("No task ID provided");
    try {
      const response = await api.get(`tasks/${taskId}/`);
      setTask(response.data);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to fetch task", {
        toastId: 'task-fetch-error'
      });
    }
  };

  // Start the closing animation with the task data (Avoid the page to go blank before closing)
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedTask(null);
      setTask(null);
      setAssets([]);
      setError(null);
      setIsClosing(false);
    }, 600);
  };

  const fetchAssets = async () => {
    if (!task.id) alert("No task ID provided");
    try {
      const response = await api.get(`tasks/${task.id}/assets/`);
      setAssets(response.data);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to fetch assets", {
        toastId: 'asset-fetch-error'
      });
    }
  };

  // Handle asset download
  const handleAssetDownload = async (fileUrl, filename) => {
    try {
      // perform the request as a blob
      const res = await api.get(fileUrl, {
        responseType: 'blob',
      });

      if (res.status !== 200) {
        throw new Error(`Unexpected HTTP ${res.status}`);
      }

      // download via object URL
      const blobUrl = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      toast.success('Asset downloaded successfully', {
        toastId: 'asset-download-success'
      });

    } catch (error) {
      toast.error(
        (error.response?.data?.msg) ||
        error.message ||
        'Failed to download asset',
        { toastId: 'asset-download-error' }
      );
    }
  };

  // Handle file upload
  const handleAssetUpload = async (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`tasks/${task.id}/assets/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("File uploaded successfully", {
        toastId: 'upload-asset-success'
      });
      // Fetch the updated list of assets
      fetchAssets();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to upload file", {
        toastId: 'upload-asset-error'
      });
    }
  };

  // Handle asset delete
  const handleAssetDelete = async (assetId) => {
    try {
      await api.delete(`tasks/${task.id}/assets/${assetId}`);
      toast.success("Asset deleted successfully", {
        toastId: 'asset-delete-success'
      });
      // Fetch the updated list of assets
      const response = await api.get(`tasks/${task.id}/assets/`);
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
      task.status === "Completed" ? status = "Pending" : status = "Completed"
      const payload = {
        status,
      }
      // Send the updated status to the server
      const response = await api.patch(`tasks/${task.id}/status`, payload);
      setTask({
        ...task,
        status: response.data.status
      });
      fetchTasks(); 
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to toggle task status", {
        toastId: 'task-status-toggle-error'
      });
    }
  }

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    date.setHours(date.getHours());
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`fixed z-60 top-0 ${
        task && !isClosing ? 'right-0' : '-right-full'
      } w-full sm:w-4/5 md:w-1/2 h-full bg-background dark:bg-background-dark px-4 sm:px-8 pb-6 sm:pb-12 overflow-y-scroll cursor-pointer transition-all duration-600`}
    >
      {task && (
        <div className="relative w-full flex flex-col justify-start items-start gap-2 pt-20">
          {/* Button Container */}
          <div className="w-full flex justify-between gap-2">
            {/* Close Button */}
            <Button onClick={handleClose} width="fit" isCloseButton={true} />
          </div>

          {/* Task Content */}
          <div className="w-full flex justify-start items-start gap-2 mt-4">
            <div className="w-full flex flex-col justify-start items-start gap-2 p-2">

              {/* Task Status */}
              <button onClick={toggleTaskStatus} className={`${task.status !== "Completed" ? 'border border-gray-700 dark:border-gray-300 text-surface-black dark:text-surface-white' : 'border-success bg-success dark:bg-success-dark text-surface-white flex items-center gap-2'} text-caption px-4 py-1 rounded-md cursor-pointer hover:scale-105 transition duration-200`}>
                {task.status} {task.status === "Completed" ? <FaCheck /> : null}
              </button>

              {/* Task Title */}
              <h3 className={`text-subheading dark:text-surface-white ${task.status === "Completed" ? 'line-through flex items-center gap-2' : ''}`}>
                {task.title} {task.status === "Completed" ? <FaCheck className='text-success dark:text-success-dark' /> : null}
              </h3>

              {/* Task Description */}
              <p className="text-body dark:text-surface-white">
                {task.description}
              </p>
              
              {/* Task Priority */}
              <div className="flex items-center justify-start gap-2">
                <p className="text-caption text-surface-black dark:text-surface-white">
                  Priority:
                </p>
                <div
                  className={`text-center text-caption text-surface-white py-1 px-3 rounded-md ${
                    task.priority === 'High'
                      ? 'bg-gradient-to-r from-red-700 to-red-500'
                      : task.priority === 'Medium'
                      ? 'bg-gradient-to-r from-yellow-700 to-yellow-500'
                      : 'bg-gradient-to-r from-blue-700 to-blue-500'
                  } hover:-translate-y-1 transition duration-200 cursor-pointer`}
                >
                  {task.priority} 
                </div>
              </div>

              {/* Task Duration */}
              <div className="min-w-full flex flex-col gap-2">
                <div className="min-w-full flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700">
                  <div className="flex flex-col items-start">
                    <span className="text-caption font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      Start Time
                    </span>
                    <span className="text-body font-medium text-surface-black dark:text-surface-white">
                      {formatTime(task.start_time)}
                    </span>
                  </div>
                  <div className="w-full mx-1 border border-dashed" />
                  <div className="flex flex-col items-start">
                    <span className="text-caption font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      End Time
                    </span>
                    <span className="text-body font-medium text-surface-black dark:text-surface-white">
                      {formatTime(task.end_time)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned Users */}
              <div className="w-full flex flex-col gap-2">
                <h4 className="text-body font-semibold dark:text-surface-white">
                  Assigned To:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {task.assigned_users[0].id !== null && task.assigned_users.map(user => (
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

                  {task.assigned_users[0].id === null && (
                    <p className="text-caption text-gray-500 dark:text-gray-400">
                      No users assigned.
                    </p>
                  )}
                </div>
              </div>

              {/* Assets Section */}
              <div className="w-full flex flex-col gap-4 mt-4">
                <h4 className="text-body font-semibold dark:text-surface-white">
                  Assets:
                </h4>
                {assets.length === 0 ? (
                  <div className="flex items-center gap-4">
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
                          >
                            <FaDownload /> 
                          </Button>
                          {(user.role === "Admin" || asset.uploaded_by.id === user.id) ? (
                            <Button
                              width="fit"
                              isDeleteButton={true}
                              onClick={() => handleAssetDelete(asset.id)}
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