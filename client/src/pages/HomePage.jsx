import React, {useContext} from 'react'
import { AuthContext } from '../context/authContext'

const HomePage = () => {
  const {user} = useContext(AuthContext)
  return (
    <div>HomePage - {user.email} - {user.role}</div>
  )
}

export default HomePage
