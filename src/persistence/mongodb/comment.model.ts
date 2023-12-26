import mongoose from "mongoose";
import { CommentTy } from "../../types/comment.type";

const CommentSchema = new mongoose.Schema<CommentTy>(
  {
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { collection: "comment", timestamps: true }
);

export const CommentModel = mongoose.model("Comment", CommentSchema);
