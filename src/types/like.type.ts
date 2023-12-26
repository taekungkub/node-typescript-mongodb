import mongoose, { Document } from "mongoose";
import { PostTy } from "./post.type";
import { UserTy } from "./user.type";

export interface LikeTy {
  user: UserTy;
  post: PostTy;
}
