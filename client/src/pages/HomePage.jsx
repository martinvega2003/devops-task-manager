import React, {useContext} from 'react'
import { AuthContext } from '../context/authContext'
import MyTeamSection from './admin/MyTeamSection'
import { Routes, Route } from 'react-router-dom'

const HomePage = () => {
  const {user} = useContext(AuthContext)
  return (
    <div className='flex justify-center items-center text-7xl dark:bg-background-dark dark:text-surface-white'>
      Non Admin User
    </div>
  )
}

export default HomePage
