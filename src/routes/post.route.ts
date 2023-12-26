import { Router } from "express";
import * as postController from "@/controllers/post.controller";
import { checkHasToken } from "@/middleware/passport";
const router = Router();

router.get("/posts", checkHasToken, postController.getPosts);
router.get("/posts/:postId", postController.getPostDetail);
router.post("/posts", postController.createPost);
router.get("/posts/like/:postId", postController.addLikeToPost);
router.get("/posts/deleteLike/:postId", postController.deleteLikeFromPost);
router.post("/posts/comment", postController.createComments);

export default router;
