import { Request, Response } from "express";
import { ERRORS } from "@/helper/Errors";
import mongoose from "mongoose";
import { errorResponse, successResponse } from "@/helper/utils";
import { UserTy } from "../types/user.type";
import { LikeModel } from "../persistence/mongodb/like.model";
import { CommentModel } from "@/persistence/mongodb/comment.model";
import { PostModel, getPostById, createMyPost } from "@/persistence/mongodb/post.model";

export const getPosts = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserTy;
    const posts = await PostModel.find().populate("user").populate("likes user");
    const userId = user ? user._id.toString() : undefined;
    const newMap = posts.map((v) => {
      const userLikedPost = v.likes.some((like) => like.user._id.toString() === userId);
      return {
        ...v.toObject(),
        is_user_like: userLikedPost,
      };
    });

    return res.json(successResponse(newMap));
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error));
  }
};
export const getPostDetail = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      throw new Error("Not found post");
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new Error("Not found post id");
    }

    const post = await getPostById(postId);

    if (!post) {
      throw new Error("Not found post");
    }

    return res.json(successResponse(post));
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error.message));
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { _id } = req.user as UserTy;
    const { title, description, content } = req.body;

    const post = await createMyPost({
      title: title,
      description: description,
      content: content,
      user: _id,
    });

    return res.json(successResponse(post));
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error));
  }
};

export const addLikeToPost = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserTy;

    const { postId } = req.params;

    if (!postId) {
      throw new Error("PostId is required");
    }

    const postExist = await PostModel.findOne({ _id: postId });

    if (!postExist) {
      throw new Error("Post not found");
    }

    const newLike = await LikeModel.create({ user: user._id, post: postId });

    await PostModel.findByIdAndUpdate(postId, { $push: { likes: newLike._id } });

    return res.json(successResponse({ id: postId }));
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error.message));
  }
};

export const deleteLikeFromPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const user = req.user as UserTy;

    if (!postId) {
      throw new Error("PostId is required");
    }

    const postExist = await PostModel.findOne({ _id: postId });

    if (!postExist) {
      throw new Error("Post not found");
    }

    const post = await PostModel.findById(postId)
      .populate("user")
      .populate({
        path: "likes",
        populate: {
          path: "user",
        },
      });

    const userLikeIndex = post.likes.findIndex((like) => like.user._id.toString() === user._id.toString());

    if (userLikeIndex != -1) {
      await LikeModel.findOneAndRemove({ user: user._id.toString() });

      post.likes.splice(userLikeIndex, 1);
      await post.save();

      return res.json(successResponse({ id: postId }));
    }

    return res.json(successResponse({ id: postId }));
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error.message));
  }
};

export const createComments = async (req: Request, res: Response) => {
  try {
    const { content, post_id, user_id } = req.body;

    if (!post_id) {
      throw new Error("postId is required");
    }
    if (!user_id) {
      throw new Error("userId is required");
    }
    if (!content) {
      throw new Error("content is required");
    }

    // Check if the post exists
    const post = await PostModel.findById(post_id);

    if (!post) {
      throw new Error("Post not found");
    }

    const newComment = await CommentModel.create({ content: content, user: user_id, post: post_id });
    await PostModel.findByIdAndUpdate({ _id: post_id }, { $push: { comments: newComment._id } });

    return res.json(
      successResponse({
        content,
        user_id,
        post_id,
      })
    );
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error.message));
  }
};
