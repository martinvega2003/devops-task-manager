import React from 'react'

const Button = ({children, onClick, isAddButton, width = 'full'}) => {

  return (
    <button
      onClick={onClick}
      className={`w-${width} bg-primary dark:bg-secondary text-body text-white ${isAddButton ? 'rounded-full p-4' : 'rounded py-2 px-4'} hover:bg-transparent hover:text-primary dark:hover:text-secondary transition duration-300 border-2 border-primary dark:border-secondary cursor-pointer`}
    >
      {children}
    </button>
  )
}

export default Button
