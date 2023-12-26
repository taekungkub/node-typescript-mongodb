import mongoose from "mongoose";
import { LikeTy } from "../../types/like.type";

const LikeSchema = new mongoose.Schema<LikeTy>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { collection: "like" }
);

export const LikeModel = mongoose.model("Like", LikeSchema);
