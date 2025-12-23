import { setUserError } from "@/app/slice/user-slice";
import Logo from "@/components/logo/Logo";
import { Button } from "@/components/ui/button";
import CInput from "@/components/ui/CInput";
import CLoader from "@/components/ui/CLoader";
import useUserApi from "@/hooks/api-hooks/UserApi";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm();

  const { userLoading, userError } = useSelector((state) => state.user);

  const { login } = useUserApi();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleRegister = async (data) => {
    const success = await login(data);
    if (success) {
      if (!success.isVerified) {
        navigate("/auth/Verify-otp");
        return;
      }
      dispatch(setUserError(null));
      navigate("/user/home");
    }
  };

  return (
    <div className="max-w-[330px] w-full p-4 flex flex-col overflow-hidden gap-8 items-center justify-center">
      <div className="flex flex-col gap-1 items-center">
        <Logo size="35px" />
        <span className="text-sm text-center">
          Login with your Gmail and password .
        </span>
      </div>

      <form
        onSubmit={handleSubmit(handleRegister)}
        className=" flex flex-col gap-2.5 w-full items-center"
      >
        <div className="w-full">
          <CInput
            label="UserName or Email"
            id="Email"
            type="text"
            placeholder="Enter Email or UserName . . . "
            {...register("email", {
              required: "Email or userName is required",
              validate: (value) =>
                value.trim() !== "" || "Folder name cannot be empty spaces",
            })}
          />
          {errors.email && (
            <span className="text-red-500 text-xs m-1">
              {errors.email.message}
            </span>
          )}
        </div>
        <div className="w-full">
          <CInput
            label="Password"
            id="Password"
            type="Password"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
            })}
          />
          {errors.password && (
            <span className="text-red-500 text-xs m-1">
              {errors.password.message}
            </span>
          )}
        </div>
        <div className="w-full flex flex-col gap-1 items-start">
          <Link
            to="/auth/reset-password-otp"
            className="text-xs text-zinc-500 font-medium p-1 hover:underline "
          >
            Forgot Password
          </Link>
          {userError && (
            <span className="text-red-500 text-xs ml-1">{userError}</span>
          )}
        </div>
        <Button disabled={userLoading} className="mt-2 w-[max-content]">
          {userLoading && <CLoader />} Login
        </Button>
      </form>
      <div className="text-xs flex gap-1.5 w-full justify-end items-end">
        <span className="text-zinc-500 text-xs">Create new account !</span>
        <Link
          onClick={() => dispatch(setUserError(null))}
          to="/auth/singup"
          className="hover:underline font-medium"
        >
          SingUp
        </Link>
      </div>
    </div>
  );
};

export default Login;
