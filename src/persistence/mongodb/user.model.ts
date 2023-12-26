import mongoose from "mongoose";
import { UserTy } from "@/types/user.type";

// User Config
const UserSchema = new mongoose.Schema<UserTy>(
  {
    user_email: { type: String, required: true },
    user_password: { type: String, required: true, select: false },
    user_displayname: { type: String, required: false },
    is_verify: { type: Boolean, required: false, default: false, select: false },
    token_resetpassword: { type: String, required: false, select: false },
    // authentication: {
    //   password: { type: String, required: true, select: false },
    //   salt: { type: String, select: false },
    //   sessionToken: { type: String, select: false },
    // },
  },
  { collection: "user", timestamps: true }
);

export const UserModel = mongoose.model("User", UserSchema);

// User Actions
export const getUsers = () => UserModel.find();
export const getUserAuth = (email: string) =>
  UserModel.findOne({ user_email: email }).select("user_email user_password is_verify token_resetpassword");

export const getUserByEmail = (email: string) => UserModel.findOne({ user_email: email });
export const getUserBySessionToken = (sessionToken: string) => UserModel.findOne({ "authentication.sessionToken": sessionToken });
export const getUserById = (id: string) => UserModel.findById(id);
export const createUser = (values: Record<string, any>) => new UserModel(values).save().then((user) => user.toObject());
export const deleteUserById = (id: string) => UserModel.findOneAndDelete({ _id: id });
export const updateUserById = (id: string, values: Record<string, any>) => UserModel.findByIdAndUpdate(id, values);
export const updateUserByEmail = (email: string, values: Partial<UserTy>) =>
  UserModel.findOneAndUpdate(
    { user_email: email },
    {
      $set: values,
    },
    {
      new: true,
    }
  );
