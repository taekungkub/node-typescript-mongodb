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
    const { title, description, content, user_id } = req.body;

    const post = await createMyPost({
      title: title,
      description: description,
      content: content,
      user: user_id,
    });

    return res.json(successResponse(post));
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error));
  }
};

export const addLikeToPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const { user_id } = req.body;

    if (!postId) {
      throw new Error("postId is required");
    }

    if (!user_id) {
      throw new Error("user is required");
    }

    const newLike = await LikeModel.create({ user_id, post: postId });
    await PostModel.findByIdAndUpdate(postId, { $push: { likes: newLike._id }, $inc: { likeCount: +1 } });
    return res.json(successResponse({ id: postId }));
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error.message));
  }
};

export const deleteLikeFromPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const { like_id } = req.body;

    if (!postId) {
      throw new Error("postId is required");
    }

    if (!like_id) {
      throw new Error("likeId is required");
    }

    // Remove the like from the LikeModel
    await LikeModel.findByIdAndDelete(like_id);

    // Remove the likeId from the likes array in the PostModel
    await PostModel.findByIdAndUpdate(postId, { $pull: { likes: like_id }, $inc: { likeCount: -1 } });

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
