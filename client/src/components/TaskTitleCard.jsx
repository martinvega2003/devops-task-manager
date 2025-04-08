import React from 'react'

const TaskTitleCard = ({task, className, style, onClick = null}) => {
  return (
    <div 
      onClick={onClick}
      className={
        `text-center text-caption text-surface-white py-1 px-3 rounded-md
        ${task.status === "Completed" ? 'bg-gradient-to-r from-green-700 to-green-500' : task.priority === 'High' ? 'bg-gradient-to-r from-red-700 to-red-500' :
          task.priority === 'Medium' ? 'bg-gradient-to-r from-yellow-700 to-yellow-500' :
          'bg-gradient-to-r from-blue-700 to-blue-500'
        } hover:-translate-y-1 transition duration-200 cursor-pointer ` + className
      }
      style={style && style}
    >
      {task.title}
    </div>
  )
}

export default TaskTitleCard