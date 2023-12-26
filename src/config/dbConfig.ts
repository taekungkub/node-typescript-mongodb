import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const MongoURI =
  process.env.MONGODB_URL ||
  "mongodb://127.0.0.1:27017/my-first-db?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.0";

mongoose.set("strictQuery", false);
mongoose.Promise = Promise;

const connect = () =>
  mongoose.connect(MongoURI, {
    //@ts-ignore
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

const close = () => mongoose.connection.close();

export { connect, close };
