import React from 'react'

const ErrorContainer = ({error, setError}) => {

  return (
    <div className="absolute h-screen inset-0 z-60 flex items-center justify-center bg-transparent">
      <div className="absolute h-screen z-0 inset-0 bg-white dark:bg-black opacity-90 dark:opacity-70" />
      <div className="fixed z-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-fit flex flex-col gap-2 items-center px-6 py-4">
        <p className="w-full text-left text-body text-error dark:text-error-dark">Error:</p>
        <p className="max-w-full text-caption md:text-body text-surface-black dark:text-surface-white whitespace-break-spaces">
          {error}
        </p>
        <button onClick={() => setError(null)} className="w-full text-right text-caption text-surface-black dark:text-surface-white cursor-pointer">
          OK
        </button>
      </div>
    </div>
  )
}

export default ErrorContainer
