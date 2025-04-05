import React, { useState } from 'react';
import Button from '../../components/Button';
import { FaCheck, FaPen } from 'react-icons/fa';

const TaskPage = ({ selectedTask, setSelectedTask }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Start the closing animation with the task data (Avoid the page to go blank before closing)
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedTask(null);
      setIsClosing(false);
    }, 600);
  };

  return (
    <div
      className={`fixed z-60 top-0 ${
        selectedTask && !isClosing ? 'right-0' : '-right-full'
      } w-full sm:w-4/5 md:w-1/2 h-full bg-background dark:bg-background-dark px-4 sm:px-8 pb-6 sm:pb-12 overflow-y-scroll cursor-pointer transition-all duration-600`}
    >
      {selectedTask && (
        <div className="relative flex flex-col justify-start items-start gap-2 pt-20">
          {/* Editing Button */}
          <Button
            onClick={() => setIsEditing(!isEditing)}
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
              <h3 className="text-subheading dark:text-surface-white">
                {selectedTask.title} 
              </h3>
              <p className="text-body dark:text-surface-white">
                {selectedTask.description}
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

              {/* Task Status */}
              <button className={`${selectedTask.status !== "Completed" ? 'border border-gray-700 dark:border-gray-300 text-surface-black dark:text-surface-white' : 'border-success bg-success dark:bg-success-dark text-surface-white flex items-center gap-2'} text-caption px-4 py-1 rounded-md`}>
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
                    <span className="text-body font-medium text-surface-black dark:text-surface-white">
                      {new Date(selectedTask.start_time).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-caption font-semibold text-gray-600 dark:text-gray-400">
                      End Time
                    </span>
                    <span className="text-body font-medium text-surface-black dark:text-surface-white">
                      {new Date(selectedTask.end_time).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned Users */}
              <div className="w-full flex flex-col gap-2">
                <h4 className="text-body font-semibold dark:text-surface-white">
                  Assigned Users ({selectedTask.assigned_users_count}):
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.assigned_users.map(user => (
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
