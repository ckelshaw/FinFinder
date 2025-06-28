import './App.css';
import { useUser } from '@clerk/clerk-react';
import { React, useEffect } from 'react';
import axios from 'axios';
import logo from './assets/FinFinder_Logo.png';

//Importing pages
import Navbar from './components/Navbar';

function Dashboard() {

  const {user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if(isLoaded && isSignedIn){
      axios.post('/api/users', {
        clerk_user_id: user.id,
        username: user.primaryEmailAddress.emailAddress,
        first_name: user.firstName,
        last_name: user.lastName
      }).catch(err => {
        console.error('Failed to sync user to backend: ', err);
      });
    }
  }, [isLoaded, isSignedIn, user]);

  return (
    <>
    <Navbar/>
    <div className='container mt-4'>
      <img src={logo} alt="Fin Finder Logo"></img>
      <h1>Cool stuff will go here.</h1>
    </div>
    </>
  );
}

export default Dashboard;