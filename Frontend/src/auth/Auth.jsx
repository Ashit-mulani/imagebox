import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const Auth = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setChecking(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [user]);

  if (checking) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth/singup" replace />;
  }

  return children;
};

export default Auth;
