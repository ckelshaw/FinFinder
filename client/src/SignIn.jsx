import React from "react";
import { SignIn } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';

const SignInPage = () => {
    const navigate = useNavigate();

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
                <h2 className="mb-4">Welcome Back</h2>

                {/* Clerk's built-in sign-in form */}
                <SignIn/>
            </div>
        </div>
    )
};

export default SignInPage;

