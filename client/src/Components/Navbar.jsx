import React from "react";
import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import logo from '../Assets/FinFinder_Logo.png';

function Navbar() {
    return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
      <Link className="navbar-brand d-flex align-items-center" to="/">
        <img src={logo} alt="Fin Finder Logo" height="30" className="me-2" />
        <strong>Fin Finder</strong>
      </Link>

      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link className="nav-link" to="/">Home</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/my-trips">My Trips</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/new-trip">New Trip</Link>
          </li>
        </ul>
        <div className="d-flex align-items-center">
          <UserButton />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
