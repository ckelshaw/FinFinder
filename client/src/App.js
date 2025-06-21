import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignIn, SignUp, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { supabase } from './supabaseClient'; 

//Importing pages
import SignInPage from './SignIn';
import Dashboard from './Dashboard';
import MyTrips from './MyTrips';
import NewTrip from './NewTrip';
import { React, useEffect, useState } from 'react';

function App() {

  const [trips, setTrips] = useState([]);

    useEffect(() => {
        getTrips();
    }, []);

    async function getTrips() {
        const { data } = await supabase.from("fishing_trip").select();
        setTrips(data)
        
    }

  return (
    <Router>
      <Routes>
        {/* Root route - protected */}
        <Route
          path="/"
          element={
            <>
              <SignedIn>
                <Dashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* Sign-in and sign-up routes */}
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/my-trips" element={<MyTrips/>} />
        <Route path="/new-trip" element={<NewTrip/>} />
      </Routes>
    </Router>
  );
}

export default App;
