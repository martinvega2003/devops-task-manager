import React, { useState } from 'react'
import Button from '../components/Button'

const TaskPage = ({selectedTask, setSelectedTask}) => {
  const [isClosing, setIsClosing] = useState(false);

  // Start the closing animation with the task data (Avoid the page to go blank before closing)
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedTask(null); 
      setIsClosing(false);
    }, 600); 
  };

  return (
    <div className={`fixed z-60 top-0 ${selectedTask && !isClosing ? 'right-0' : '-right-full'} w-full sm:w-4/5 md:w-1/2 h-full bg-background dark:bg-background-dark px-4 sm:px-8 pb-6 sm:pb-12 pt-20 overflow-y-scroll transition-all duration-600`}>
      {selectedTask &&
        <div className="relative flex flex-col justify-start items-start gap-4">
          <div className="w-full flex justify-start items-start gap-2 mt-20 border-2 dark:border-surface-white">
            <div className="flex flex-col justify-start items-start gap-2 p-2 whitespace-nowrap overflow-x-auto">
              <h3 className="text-subheading dark:text-surface-white">{selectedTask.title}</h3>
              <p className="text-body dark:text-surface-white">{selectedTask.description}</p>
              <p className="text-body dark:text-surface-white">{selectedTask.priority}</p>
            </div>
          </div>
          <Button onClick={handleClose} width='fit' isCloseButton={true} />
        </div>
      }
    </div>
  )
}

export default TaskPage
