import React from 'react'

const Button = ({children, onClick}) => {

  return (
    <button
      onClick={onClick}
      className="component-button w-full bg-primary dark:bg-secondary text-white py-2 rounded hover:bg-transparent hover:text-primary dark:hover:text-secondary transition duration-300 border-2 border-primary dark:border-secondary cursor-pointer"
    >
      {children}
    </button>
  )
}

export default Button
