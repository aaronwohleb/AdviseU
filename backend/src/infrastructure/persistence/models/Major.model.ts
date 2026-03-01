import mongoose from "mongoose";
const { Schema, model } = mongoose;

const requirementSchema = new Schema(
  {
    courses: [String], //course ids
    num: Number,
  },
  { _id: false },
);

const trackSchema = new Schema({
  reqs: [requirementSchema],
  name: String,
  college: String,
});

const majorSchema = new Schema({
  tracks: [trackSchema],
  reqs: [requirementSchema],
  name: String,
  college: String,
});

export const MajorModel = model("Major", majorSchema);
