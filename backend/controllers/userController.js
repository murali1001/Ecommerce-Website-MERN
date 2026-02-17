import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";

//creating user
// while creating user, we are also loggin in user, that is why token are used

const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body; // getting data from postman body and destructuring

  if (!username || !email || !password) {
    throw new Error("Please provide all inputs");
  }

  const userExists = await User.findOne({ email });
  if (userExists) res.status(400).send("Already");

  const salt = await bcrypt.genSalt(10); // it is used to generate random chars to pwd so that pwd cannot be guessed
  const hashedPassword = await bcrypt.hash(password, salt); // Now th salt is added to password

  const newUser = new User({ username, email, password: hashedPassword }); //password destructured

  try {
    await newUser.save(); //mongoose method to save the data
    createToken(res, newUser._id); // (res, userId)
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    });
  } catch (error) {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

//Logging the user

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (isPasswordValid) {
      createToken(res, existingUser._id);

      res.status(201).json({
        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
      });
      return;
    }
  }
});

// Logging out

const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  console.log("3w5ee654t54645y");
  const users = await User.find({});
  console.log("sdfsdgfsdfgdfsgfdgdfgdfdfs" + users);
  res.json(users);
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  console.log("tes");
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username; // If user provides any username then update it or else update with already existing username
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10); // it is used to generate random chars to pwd so that pwd cannot be guessed
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User Not found");
  }
});

const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id); // route paramaters

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error("admin Cannot be deleted");
    }

    await User.deleteOne({ _id: user._id });
    res.json({ message: "USer removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password"); // return except password

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User Not found");
  }
});

export {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
};
