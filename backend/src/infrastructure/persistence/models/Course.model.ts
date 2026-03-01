// Defines the Mongo schema for Course

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const prerequisiteSchema = new Schema(
  {
    courses: [String], //these strings will be course ids
  },
  { _id: false },
);

const courseSchema = new Schema({
  _id: { type: String, required: true },
  classname: String,
  prereqs: [prerequisiteSchema],
  credits: Number,
});

export { courseSchema };
export const CourseModel = model("Course", courseSchema);
