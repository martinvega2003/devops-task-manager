import React, {useContext} from 'react'
import { AuthContext } from '../context/authContext'
import MyTeamSection from './admin/MyTeamSection'
import { Routes, Route } from 'react-router-dom'
import CalendarPage from './non_admin/CalendarPage'

const HomePage = () => {
  const {user} = useContext(AuthContext)
  return (
    <CalendarPage />
  )
}

export default HomePage
