import { PostTy } from "./post.type";
import { UserTy } from "./user.type";

export interface CommentTy {
  content: string;
  user: UserTy;
  post: PostTy;
}
