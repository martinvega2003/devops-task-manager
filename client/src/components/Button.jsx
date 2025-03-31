import React from 'react'
import { FaPlus, FaTimes } from 'react-icons/fa'

const Button = ({children, onClick, isAddButton, isCloseButton, width = 'full'}) => {

  return (
    <button
      onClick={onClick}
      className={`w-${width} ${isCloseButton ? "bg-red-500 dark:bg-red-700 border-red-500 dark:border-red-700 hover:text-red-500 dark:hover:text-red-700" : "bg-primary dark:bg-secondary border-primary dark:border-secondary hover:text-primary dark:hover:text-secondary"} text-body text-white ${isAddButton || isCloseButton ? 'rounded-full p-4' : 'rounded py-2 px-4'} hover:bg-transparent transition duration-300 border-2 cursor-pointer`}
    >
      {isAddButton ? <FaPlus /> : isCloseButton ? <FaTimes /> : children}
    </button>
  )
}

export default Button
