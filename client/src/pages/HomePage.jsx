import React, {useContext} from 'react'
import { AuthContext } from '../context/authContext'
import MyTeamSection from './admin/MyTeamSection'

const HomePage = () => {
  const {user} = useContext(AuthContext)
  return (
    <div>
      {user.role === "Admin" ? <MyTeamSection /> : <h2>Non Admin User</h2>}
    </div>
  )
}

export default HomePage
