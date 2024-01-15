import { CommentTy } from "./comment.type";
import { LikeTy } from "./like.type";
import { UserTy } from "./user.type";

export interface PostTy {
  _id?: string;
  title: string;
  description: string;
  user: string | UserTy;
  content: string;
  comments?: CommentTy[];
  total_like?: number;
  likes?: LikeTy[];
}
