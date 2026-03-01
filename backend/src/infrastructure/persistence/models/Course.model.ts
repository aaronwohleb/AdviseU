// Defines the Mongo schema for Course

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const prerequisiteSchema = new Schema(
  {
    courses: [{ type: String, ref: "Course" }],
  },
  { _id: false },
);

const courseSchema = new Schema({
  _id: { type: String, required: true },
  major: String,
  //prereqs: [[{ type: String, ref: "Course" }]],
  prereqs: [prerequisiteSchema],
  credits: Number,
});

export { courseSchema };
export const CourseModel = model("Course", courseSchema);
