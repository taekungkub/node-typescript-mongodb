import { Router } from "express";
import * as postController from "@/controllers/post.controller";
import { checkAuth, checkHasToken } from "@/middleware/passport";
const router = Router();

router.get("/posts", checkHasToken, postController.getPosts);
router.get("/posts/:postId", postController.getPostDetail);
router.post("/posts", checkAuth, postController.createPost);
router.get("/posts/like/:postId", checkAuth, postController.addLikeToPost);
router.get("/posts/deleteLike/:postId", checkAuth, postController.deleteLikeFromPost);
router.post("/posts/comment", checkAuth, postController.createComments);

export default router;
