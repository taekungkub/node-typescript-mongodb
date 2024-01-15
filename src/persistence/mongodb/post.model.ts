import mongoose from "mongoose";
import { PostTy } from "../../types/post.type";

const PostSchema = new mongoose.Schema<PostTy>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
    total_like: { type: Number, default: 0 },
  },
  { collection: "post", timestamps: true }
);

export const PostModel = mongoose.model("Post", PostSchema);

export const getPosts = () => PostModel.find().populate("user");

export const getPostById = (id: string) =>
  PostModel.findById({ _id: id })
    .populate("user")
    .populate({
      path: "likes",
      populate: {
        path: "user",
      },
    })
    .populate({
      path: "comments",
      populate: {
        path: "user",
      },
    });

// export const createMyPost = (values: Partial<PostTy>) =>
//   new PostModel(values).save().then((post) => PostModel.populate(post, { path: "user" }));

export const createMyPost = (values: Partial<PostTy>) => new PostModel(values).save().then((post) => post.toObject());

export const updatePostById = (id: string, likePostId: string) => PostModel.findByIdAndUpdate(id, { $push: { likes: likePostId } });
