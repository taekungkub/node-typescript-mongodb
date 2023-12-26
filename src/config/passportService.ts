import passport from "passport";
import passportJWT from "passport-jwt";
import { secretJWT } from "../config/globalConfig";
import * as db from "@/persistence/mongodb/user.model";
import { UserTy } from "@/types/user.type";

const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

// passport.serializeUser((user: any, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id: any, done: any) => done(null, await db.getUserById(id)));

export class PassportService {
  static passport: typeof passport;
}

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretJWT,
};

PassportService.passport = passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload: UserTy, cb) => {
    try {
      const user = await db.getUserByEmail(jwtPayload.user_email);
      if (jwtPayload.user_email != user.user_email) return cb(null, false);
      return cb(null, user);
    } catch (error) {
      return cb(null, false);
    }
  })
);
