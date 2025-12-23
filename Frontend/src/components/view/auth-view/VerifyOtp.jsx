import { setUserError } from "@/app/slice/user-slice";
import Logo from "@/components/logo/Logo";
import { Button } from "@/components/ui/button";
import CInput from "@/components/ui/CInput";
import CLoader from "@/components/ui/CLoader";
import useUserApi from "@/hooks/api-hooks/UserApi";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const VerifyOtp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { user, userLoading, userError } = useSelector((state) => state.user);

  const { verifyOtp } = useUserApi();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  console.log(user);

  const handleRegister = async (data) => {
    const success = await verifyOtp(data);
    if (success) {
      dispatch(setUserError(null));
      navigate("/user/home");
    }
  };

  if (!user?.email) {
    navigate("/auth/login");
  }

  return (
    <div className="max-w-[330px] w-full p-4 flex flex-col overflow-hidden gap-8 items-center justify-center">
      <div className="flex flex-col gap-1 items-center">
        <Logo size="35px" />
        <span className="text-sm text-center">
          Verify your Gmail by OTP that we sent to your Gmail account{" "}
          <span className="text-blue-600"> {user?.userEmail}</span>
        </span>
      </div>

      <form
        onSubmit={handleSubmit(handleRegister)}
        className=" flex flex-col gap-2.5 w-full items-center"
      >
        <div className="w-full">
          <CInput
            label="OTP"
            id="otp"
            type="number"
            placeholder="Enter otp here . . ."
            {...register("otp", {
              required: "Otp is required",
            })}
          />
          {errors.otp && (
            <span className="text-red-500 text-xs m-1">
              {errors.otp.message}
            </span>
          )}
          {userError && (
            <span className="text-red-500 text-xs ml-1">{userError}</span>
          )}
        </div>
        <Button disabled={userLoading} className="mt-2 w-[max-content]">
          {userLoading && <CLoader />} Verify OTP
        </Button>
      </form>
    </div>
  );
};

export default VerifyOtp;
