import { JwtPayload } from "jsonwebtoken";

export interface UserTy {
  _id?: string;
  user_email: string;
  user_password: string;
  user_displayname?: string;
  is_verify?: boolean;
  token_resetpassword?: string;
}

export interface UserJwtTy extends JwtPayload, UserTy {}
