import { Request, Response } from "express";
import { ERRORS } from "@/helper/Errors";
import { errorResponse, successResponse, signToken, hashPassword, comparePassword, jwtGenerate, decodedJWT } from "@/helper/utils";
import { createUser, getUserByEmail, updateUserByEmail, updateUserById, getUserAuth } from "@/persistence/mongodb/user.model";
import { UserTy } from "../types/user.type";

export const login = async (req: Request, res: Response) => {
  try {
    const { user_email, user_password } = req.body;

    const userData = await getUserAuth(user_email);

    if (!userData) {
      return res.json(errorResponse(204, ERRORS.TYPE.RESOURCE_NOT_FOUND, ERRORS.INCORRECT_EMAIL_OR_PASSWORD));
    }

    const isComparePassword = await comparePassword(user_password, userData.user_password);

    if (!isComparePassword) {
      return res.json(errorResponse(404, ERRORS.TYPE.RESOURCE_NOT_FOUND, ERRORS.INCORRECT_EMAIL_OR_PASSWORD));
    }

    if (!userData.is_verify) {
      return res.json(errorResponse(404, ERRORS.TYPE.BAD_REQUEST, ERRORS.EMAIL_IS_NOT_VERIFY));
    }

    const access_token = jwtGenerate(userData);

    res.send(
      successResponse({
        access_token: access_token,
      })
    );
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error));
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { user_email, user_password, user_confirm_password } = req.body;

    let users = await getUserByEmail(user_email);

    if (users) return res.json(errorResponse(404, ERRORS.TYPE.BAD_REQUEST, ERRORS.EMAIL_ALREADY_EXISTS));

    const passwordHash = await hashPassword(user_password);
    const tokenForVerify = signToken({ user_email });

    const newUser: UserTy = {
      user_email,
      user_password: passwordHash,
    };
    await createUser({ ...newUser });

    res.json(
      successResponse({
        description: "Register success. Please check your email for verify.",
        token_for_verify: tokenForVerify,
      })
    );
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error));
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { user_password, current_password } = req.body;

    const { user_email } = req.user as UserTy;

    const user = await getUserByEmail(user_email);

    const isComparePassword = await comparePassword(current_password, user.user_password);

    if (!isComparePassword) {
      return res.json(errorResponse(404, ERRORS.TYPE.RESOURCE_NOT_FOUND, "Current password is not correct"));
    }

    const id = user._id.toString();

    const passwordHash = await hashPassword(user_password);
    await updateUserById(id, {
      user_password: passwordHash,
    });

    res.json(
      successResponse({
        userId: id,
      })
    );
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error));
  }
};

export const activeUser = async (req: Request, res: Response) => {
  try {
    const code = req.params.code;

    if (!code) {
      return res.json(errorResponse(404, ERRORS.TYPE.RESOURCE_NOT_FOUND, ERRORS.CANT_VERIFY_ACCOUNT));
    }
    const { user_email } = await decodedJWT(code);

    let userData = await getUserAuth(user_email);

    if (!userData) {
      return res.json(errorResponse(404, ERRORS.TYPE.RESOURCE_NOT_FOUND, ERRORS.NOT_FOUND_USER));
    }

    if (userData.is_verify) {
      return res.json(errorResponse(404, ERRORS.TYPE.BAD_REQUEST, ERRORS.EMAIL_IS_VERIFY));
    }

    await updateUserByEmail(user_email, {
      is_verify: true,
    });

    res.json(
      successResponse({
        userId: userData.id,
      })
    );
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error));
  }
};

export const resendEmailForVerify = async (req: Request, res: Response) => {
  try {
    const { user_email }: UserTy = req.body;

    const user = await getUserByEmail(user_email);

    if (!user) {
      return res.json(
        errorResponse(404, ERRORS.TYPE.BAD_REQUEST, "We were unable to find a user with that email. Make sure your Email is correct!")
      );
    }

    if (user.is_verify) {
      return res.json(errorResponse(404, ERRORS.TYPE.BAD_REQUEST, "This email has been verify."));
    }
    const tokenForVerify = signToken({ user_email });

    // await onSendVerifyToEmail(user_email, tokenForVerify);

    res.json(
      successResponse({
        description: "Register success. Please check your email for verify.",
        token: tokenForVerify,
      })
    );
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error));
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { user_email }: UserTy = req.body;

    const user = await getUserByEmail(user_email);

    if (!user) {
      return res.json(errorResponse(404, ERRORS.TYPE.BAD_REQUEST, ERRORS.NOT_FOUND_USER));
    }

    const tokenForReset = signToken({ user_email });
    await updateUserByEmail(user.user_email, {
      token_resetpassword: tokenForReset,
    });

    res.json(
      successResponse({
        desciption: "We're send link for reset password. Plesase check your email",
        token_for_reset: tokenForReset,
      })
    );
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error));
  }
};

export const changePasswordWithCode = async (req: Request, res: Response) => {
  try {
    const code = req.params.code;

    const { user_email } = await decodedJWT(code, ERRORS.PASSWORD_RESET_LINK_INVALID);

    let user = await getUserAuth(user_email);

    console.log(user);

    if (!user.token_resetpassword) {
      return res.json(errorResponse(404, ERRORS.TYPE.BAD_REQUEST, ERRORS.LINK_HAS_BEEN_DESTROYED));
    }

    await updateUserByEmail(user_email, {
      token_resetpassword: "",
    });

    res.json(
      successResponse({
        user_email: user_email,
      })
    );
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error));
  }
};

export const userProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserTy;

    const result = await getUserByEmail(user.user_email);
    res.json(successResponse(result));
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error));
  }
};

export const changeProfile = async (req: Request, res: Response) => {
  try {
    const { user_displayname } = req.body as UserTy;
    const { _id, user_email } = req.user as UserTy;

    await updateUserByEmail(user_email, {
      user_displayname: user_displayname,
    });
    res.json(
      successResponse({
        user_email: user_email,
      })
    );
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error));
  }
};
