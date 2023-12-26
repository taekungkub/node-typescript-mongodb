import { CommentTy } from "./comment.type";
import { LikeTy } from "./like.type";
import { UserTy } from "./user.type";

export interface PostTy {
  _id?: string;
  title: string;
  description: string;
  user: UserTy;
  content: string;
  comments?: CommentTy[];
  likeCount?: number;
  likes?: LikeTy[];
}
