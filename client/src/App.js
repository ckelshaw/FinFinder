import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignIn, SignUp, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

//Importing pages
import SignInPage from './SignIn';
import Dashboard from './Dashboard';
import MyTrips from './features/MyTrips';
import NewTrip from './features/NewTrip';
import Trip from './features/Trip';
import { React, useEffect, useState } from 'react';

function App() {

  //const [trips, setTrips] = useState([]);

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
        <Route path='/trip/:tripId' element={<Trip/>} />
      </Routes>
    </Router>
  );
}

export default App;
