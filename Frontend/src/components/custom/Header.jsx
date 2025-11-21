import React, { useEffect, useState } from "react";
import logo from "/logo.svg";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/Services/login";
import { addUserData } from "@/features/user/userFeatures";
import ATSScoreChecker from "./ATSScoreChecker";
import { getAllResumeData } from "@/Services/resumeAPI";

function Header({user}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userResumes, setUserResumes] = useState([]);

  useEffect(() => {
    if(user){
      console.log("Printing From Header User Found");
      fetchUserResumes();
    }
    else{
      console.log("Printing From Header User Not Found");
    }
  }, [user]);

  const fetchUserResumes = async () => {
    try {
      const response = await getAllResumeData();
      if (response.statusCode === 200) {
        setUserResumes(response.data);
      }
    } catch (error) {
      console.log("Error fetching resumes:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response.statusCode == 200) {
        dispatch(addUserData(""));
        navigate("/");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div
      id="printHeader"
      className="flex justify-between px-10 py-5 shadow-md items-center"
    >
      <img src={logo} alt="logo" width={100} height={100} />
      {user ? (
        <div className="flex items-center gap-4">
          <ATSScoreChecker userResumes={userResumes} />
          <Button
            variant="outline"
            onClick={() => {
              navigate("/dashboard");
            }}
          >
            Dashboard
          </Button>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      ) : (
        <Link to="/auth/sign-in">
          <Button>Get Started</Button>
        </Link>
      )}
    </div>
  );
}

export default Header;
