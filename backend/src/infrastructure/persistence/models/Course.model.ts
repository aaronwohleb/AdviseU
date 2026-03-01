// Defines the Mongo schema for Course

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const courseSchema = new Schema({
  coursecode: { type: String, required: true },
  major: String,
  prereqs: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  credits: Number,
});

export { courseSchema };
export const CourseModel = model("Course", courseSchema);
