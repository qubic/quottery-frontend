import React from 'react'

const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-darkGunmetal">
      <div className="flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="mt-3 text-lg">Loading...</p>
      </div>
    </div>
  )
}

export { Loading }
