import React from 'react'

const TaskTitleCard = ({task, className, style, onClick = null, timeBlockView = false}) => {
  return (
    <div 
      onClick={onClick}
      className={
        `text-center text-caption text-surface-white rounded-md
        ${timeBlockView ? 'opacity-70 rounded-sm pt-1 ' : 'py-1 px-3 '}
        ${task.status === "Completed" ? 'bg-gradient-to-r from-green-700 to-green-500 line-through opacity-70' : task.priority === 'High' ? 'bg-gradient-to-r from-red-700 to-red-500' :
          task.priority === 'Medium' ? 'bg-gradient-to-r from-yellow-700 to-yellow-500' :
          'bg-gradient-to-r from-blue-700 to-blue-500'
        } hover:-translate-y-1 transition duration-200 cursor-pointer ` + className
      }
      style={style && style}
    >
      <span className={timeBlockView ? 'w-full border-b border-gray-300 px-4' : ''}>{task.title}</span>
    </div>
  )
}

export default TaskTitleCard