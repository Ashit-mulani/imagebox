import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { backendUrl } from "@/const/const";
import {
  setAppLoading,
  setNameAvailable,
  setNameLoading,
  setUser,
  setUserError,
  setUserLoading,
} from "@/app/slice/user-slice";
import { setFolder } from "@/app/slice/folder-slice";
import { setImage } from "@/app/slice/image-slice";
import { setTrashFolder } from "@/app/slice/trash-slice";

export default function useUserApi() {
  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  async function getUser() {
    dispatch(setAppLoading(true));
    try {
      const res = await axios.get(`${backendUrl}/get/user`, {
        withCredentials: true,
      });
      const userData = res?.data?.data;
      if (userData) {
        dispatch(setUser(userData));
        return true;
      }
    } catch (error) {
    } finally {
      dispatch(setAppLoading(false));
    }
  }

  async function singUp(data) {
    dispatch(setUserLoading(true));
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => formData.append(key, data[key]));
      const res = await axios.post(`${backendUrl}/user/singup`, formData);
      const userData = res?.data?.data;
      if (userData) {
        dispatch(setUser(userData));
        return true;
      }
    } catch (error) {
      dispatch(
        setUserError(error.response?.data?.message || "Failed to sign up user!")
      );
    } finally {
      dispatch(setUserLoading(false));
    }
  }

  async function verifyOtp(data) {
    localStorage.removeItem("reFolder");
    localStorage.removeItem("reImage");
    dispatch(setUserLoading(true));
    try {
      const res = await axios.post(
        `${backendUrl}/user/verifyOtp`,
        {
          email: user?.email,
          otp: data.otp,
        },
        { withCredentials: true }
      );
      const userData = res?.data?.data;
      if (userData) {
        dispatch(setUser(userData));
        return true;
      }
    } catch (error) {
      dispatch(
        setUserError(error.response?.data?.message || "Failed to verify OTP!")
      );
    } finally {
      dispatch(setUserLoading(false));
    }
  }

  async function login(data) {
    localStorage.removeItem("reFolder");
    localStorage.removeItem("reImage");
    dispatch(setUserLoading(true));
    try {
      const res = await axios.post(`${backendUrl}/user/login`, data, {
        withCredentials: true,
      });
      const userData = res?.data?.data;

      if (userData) {
        dispatch(setUser(userData));
        return userData;
      }
    } catch (error) {
      dispatch(
        setUserError(error.response?.data?.message || "Failed to login user!")
      );
    } finally {
      dispatch(setUserLoading(false));
    }
  }

  async function resetPassOtp(data) {
    dispatch(setUserLoading(true));
    try {
      const res = await axios.post(`${backendUrl}/user/reset-pass-otp`, data);
      const userData = res?.data?.data;
      if (userData) {
        dispatch(setUser(userData));
        return true;
      }
    } catch (error) {
      dispatch(
        setUserError(
          error.response?.data?.message || "Failed to send reset password OTP!"
        )
      );
    } finally {
      dispatch(setUserLoading(false));
    }
  }

  async function resetPass(data) {
    dispatch(setUserLoading(true));
    try {
      const res = await axios.post(`${backendUrl}/user/reset-pass`, {
        email: user?.userEmail,
        password: data.password,
        otp: data.otp,
      });
      const userData = res?.data?.data;
      if (userData) {
        dispatch(setUser(userData));
        return true;
      }
    } catch (error) {
      dispatch(
        setUserError(
          error.response?.data?.message || "Failed to reset password!"
        )
      );
    } finally {
      dispatch(setUserLoading(false));
    }
  }

  async function logout() {
    dispatch(setUser(null));
    dispatch(setFolder(null));
    dispatch(setImage(null));
    dispatch(setTrashFolder(null));
    localStorage.removeItem("reFolder");
    localStorage.removeItem("reImage");
    try {
      const res = await axios.put(
        `${backendUrl}/user/logout`,
        {},
        { withCredentials: true }
      );
      if (res.data) {
        return true;
      }
    } catch (error) {
      dispatch(
        setUserError(error.response?.data?.message || "Failed to logout user!")
      );
    }
  }

  async function userNameAvailable(name) {
    dispatch(setNameLoading(true));
    try {
      const res = await axios.get(
        `${backendUrl}/user/userNameAvailable?userName=${name}`
      );
      const userData = res?.data;
      if (userData) {
        dispatch(setNameAvailable(userData?.data));
      }
    } catch (error) {
    } finally {
      dispatch(setNameLoading(false));
    }
  }

  return {
    getUser,
    singUp,
    verifyOtp,
    login,
    resetPassOtp,
    resetPass,
    logout,
    userNameAvailable,
  };
}
