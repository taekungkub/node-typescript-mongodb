import { Request, Response } from "express";
import { ERRORS } from "@/helper/Errors";
import { getUsers, getUserById } from "@/persistence/mongodb/user.model";
import { errorResponse, successResponse } from "@/helper/utils";

export const getAllUser = async (req: Request, res: Response) => {
  try {
    const users = await getUsers();

    res.send(
      successResponse({
        users,
      })
    );
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error));
  }
};

export const getUsersById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.json(errorResponse(404, ERRORS.TYPE.BAD_REQUEST, "Required ID"));
    }

    const user = await getUserById(id);

    if (!user) {
      return res.json(errorResponse(404, ERRORS.TYPE.BAD_REQUEST, ERRORS.NOT_FOUND_USER));
    }

    res.send(successResponse(user));
  } catch (error) {
    return res.json(errorResponse(404, ERRORS.TYPE.SERVER_ERROR, error));
  }
};
