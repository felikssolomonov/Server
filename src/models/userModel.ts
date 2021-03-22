import { Schema, model, Document } from "mongoose";

interface userType extends Document {
  name: String;
  email: String;
  confirmed: Boolean;
  token: String | null;
  password: String;
  hashPassword: String;
}

const userModel: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  confirmed: Boolean,
  token: String,
  password: String,
  hashPassword: String,
});

export default model<userType>("User", userModel);
