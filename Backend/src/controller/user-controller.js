import User from '../models/user-model.js';
import { uploadToImageKit } from '../service/imageKit.js';
import { asyncFunc } from '../utils/asyncFunc.js';
import { apiError } from '../utils/apiError.js';
import { apiRes } from '../utils/apiRes.js';
import crypto from 'crypto';
import { sendOTP, sendResetPassOtp } from '../service/sendEmail.js';
import { cookieOption } from '../utils/cookieOption.js';
import { getTokens } from '../utils/token.js';
import { validateFields } from '../utils/validateFields.js';

const singup = asyncFunc(async (req, res) => {
  const { userName, email, password } = req.body;

  const file = req.file;

  validateFields(res, {
    userName,
    email,
    password,
  });

  const userExist = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (userExist) {
    throw new apiError(400, 'user already exist');
  }
  let profilePhoto = '';

  if (file && file.path) {
    const uploaded = await uploadToImageKit(file.path, file.originalname);
    profilePhoto = uploaded && uploaded.thumbnailUrl ? uploaded.url : '';
  }

  const otpCode = crypto.randomInt(100000, 1000000).toString();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const user = await User.create({
    userName,
    email,
    password,
    profilePhoto,
    otp: {
      code: otpCode,
      expiresAt: otpExpiresAt,
    },
  });

  if (!user) {
    throw new apiError(500, 'Failed to register, Please try again later.');
  }

  try {
    await sendOTP(user.email, otpCode, user.userName);
  } catch (error) {}

  return res
    .status(200)
    .json(
      new apiRes(
        201,
        { email: user.email },
        'User register successfuly, OTP has been sent to your email'
      )
    );
});

const verifyOtp = asyncFunc(async (req, res) => {
  const { email, otp } = req.body;

  validateFields(res, {
    email,
    otp,
  });

  const user = await User.findOne({ email }).select('-password');
  if (!user) {
    throw new apiError(404, 'user not found!');
  }

  if (
    user.otp &&
    user.otp.code == otp &&
    user.otp.expiresAt &&
    new Date(user.otp.expiresAt) > new Date()
  ) {
  } else {
    throw new apiError(401, 'Invalid or expired Otp');
  }

  const token = await getTokens(user._id);

  user.otp = undefined;
  user.isVerified = true;
  user.token = token;

  await user.save();

  return res
    .status(201)
    .cookie('token', token, cookieOption())
    .json(new apiRes(201, user, 'Email verified successfully'));
});

const login = asyncFunc(async (req, res) => {
  const { email, password } = req.body;

  validateFields(res, {
    email,
    password,
  });

  const user = await User.findOne({
    $or: [{ email }, { userName: email }],
  });

  if (!user) {
    throw new apiError(404, 'user not exist with this email');
  }

  const isPasswordMatch = await user.isPasswordCorrect(password);

  if (!isPasswordMatch) {
    throw new apiError(401, 'Invalid password');
  }

  if (!user.isVerified) {
    const otpCode = crypto.randomInt(100000, 1000000).toString();

    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    user.otp.code = otpCode;

    user.otp.expiresAt = otpExpiresAt;

    await user.save();

    try {
      await sendOTP(user?.email, otpCode, user?.userName);
    } catch (error) {}

    return res
      .status(200)
      .json(
        new apiRes(
          200,
          { isVerified: false, email: user?.email },
          'Verify your email using the OTP that we sent'
        )
      );
  }

  const token = await getTokens(user._id);

  user.token = token;

  await user.save();

  return res
    .status(200)
    .cookie('token', token, cookieOption())
    .json(new apiRes(200, user, 'Login successful'));
});

const resetPasswordOtp = asyncFunc(async (req, res) => {
  const { email } = req.body;

  validateFields(res, { email });

  const user = await User.findOne({ email });

  if (!user) {
    throw new apiError(404, 'user not exist with this email');
  }

  const otpCode = crypto.randomInt(100000, 1000000).toString();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  user.resetPasswordOtp.code = otpCode;
  user.resetPasswordOtp.expiresAt = otpExpiresAt;

  await user.save();

  try {
    await sendResetPassOtp(user.email, otpCode, user.userName);
  } catch (error) {}

  return res
    .status(200)
    .json(new apiRes(200, { userEmail: user.email }, 'otp sent successfully'));
});

const resetPassword = asyncFunc(async (req, res) => {
  const { email, password, otp } = req.body;

  validateFields(res, { email, password, otp });

  const user = await User.findOne({ email });

  if (!user) {
    throw new apiError(404, 'user not exist with this email');
  }

  if (
    user.resetPasswordOtp &&
    user.resetPasswordOtp.code == otp &&
    user.resetPasswordOtp.expiresAt &&
    new Date(user.resetPasswordOtp.expiresAt) > new Date()
  ) {
  } else {
    throw new apiError(401, 'Invalid or expired Otp');
  }

  user.password = password;

  user.resetPasswordOtp = undefined;

  await user.save();

  return res
    .status(200)
    .json(
      new apiRes(200, { userEmail: user.email }, 'password reset successfully')
    );
});

const updateUser = asyncFunc(async (req, res) => {
  const { userName } = req.body;

  const user = req.user;

  const file = req.file;

  if (!userName && !file) {
    throw new apiError(400, 'one field is required.');
  }

  const userExist = await User.findOne({ userName }).select('-password');

  if (userExist) {
    throw new apiError(400, 'user name is not available');
  }

  if (userName) user.userName = userName;

  let profilePhoto = '';

  if (file && file.path) {
    const uploaded = await uploadToImageKit(file.path, file.originalname);
    profilePhoto = uploaded && uploaded.thumbnailUrl ? uploaded.url : '';
  }

  if (file && profilePhoto) user.profilePhoto = profilePhoto;

  await user.save();

  return res
    .status(201)
    .json(new apiRes(200, user, 'user updated successfully'));
});

const logOut = asyncFunc(async (req, res) => {
  const user = req.user;
  await User.findByIdAndUpdate(user._id, {
    $set: {
      token: undefined,
    },
  });
  return res
    .status(200)
    .clearCookie('token', cookieOption())
    .json(new apiRes(200, null, 'User logout successfully'));
});

const userNameAvailable = asyncFunc(async (req, res) => {
  const { userName } = req.query;

  if (!userName) {
    return res.status(400).json(new apiRes(400, null, 'No query'));
  }
  const user = await User.findOne({ userName });
  if (user) {
    return res
      .status(200)
      .json(new apiRes(200, false, 'userName is not available'));
  } else {
    return res.status(200).json(new apiRes(200, true, 'userName is available'));
  }
});

export {
  singup,
  verifyOtp,
  login,
  resetPasswordOtp,
  resetPassword,
  updateUser,
  logOut,
  userNameAvailable,
};
