import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignIn, SignUp, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { supabase } from './supabaseClient'; 

//Importing pages
import SignInPage from './SignIn';
import Dashboard from './Dashboard';
import { React, useEffect, useState } from 'react';

function App() {

  const [trips, setTrips] = useState([]);

    useEffect(() => {
        getTrips();
    }, []);

    async function getTrips() {
        const { data } = await supabase.from("fishing_trip").select();
        console.log(data)
        setTrips(data)
        
    }

  return (

    <div className="d-flex justify-content-center align-items-center vh-100">
      <SignedIn>
        <Dashboard />
      </SignedIn>

      <SignedOut>
        <SignIn />
      </SignedOut>
    </div>
  );
}

export default App;
