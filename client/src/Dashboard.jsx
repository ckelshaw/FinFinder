import logo from './logo.svg';
import './App.css';
import { useUser } from '@clerk/clerk-react';
import { React, useEffect } from 'react';
import axios from 'axios';

//Importing pages
import { SignOutButton } from '@clerk/clerk-react';

function Dashboard() {

  const {user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if(isLoaded && isSignedIn){
      console.log("useEffect ran!")
      console.log(user)
      axios.post('/api/users', {
        id: user.id,
        username: user.primaryEmailAddress.emailAddress,
        first_name: user.firstName,
        last_name: user.lastName
      }).catch(err => {
        console.error('Failed to sync user to backend: ', err);
      });
    }
  }, [isLoaded, isSignedIn, user]);

  return (
    <div className="Dash">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <SignOutButton></SignOutButton>
    </div>
  );
}

export default Dashboard;