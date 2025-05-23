import React from 'react'
import { FaArrowLeft, FaPlus, FaTimes } from 'react-icons/fa'

const Button = ({children, onClick, isAddButton, isCloseButton, isDeleteButton, isTransparent = true, width = 'full', className}) => {

  return (
    <button
      onClick={onClick}
      className={`
        w-${width} 
        ${isCloseButton || isDeleteButton ? 
          isTransparent ? "bg-transparent text-red-500 dark:text-red-700 border-none hover:scale-110" :
          "bg-red-500 dark:bg-red-700 border-red-500 dark:border-red-700 hover:text-red-500 dark:hover:text-red-700 text-white" : 
          isTransparent ? "bg-transparent text-primary dark:text-secondary border-none hover:scale-100" :
          "bg-primary dark:bg-secondary border-primary dark:border-secondary hover:text-primary dark:hover:text-secondary text-white"} text-body 
        ${isAddButton || isCloseButton ? 
          "rounded-full p-4" : "rounded py-2 px-4"} 
        hover:bg-transparent transition duration-300 border-2 cursor-pointer ` + className}
    >
      {isAddButton ? <span className="flex gap-2 items-center"><FaPlus /> Add</span> : isCloseButton ? <span className="flex gap-2 items-center"><FaArrowLeft /> Back</span> : children}
    </button>
  )
}

export default Button
