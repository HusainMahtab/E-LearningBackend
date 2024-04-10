import mongoose from "mongoose"

// Define schema for the course
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  categoury:{
    type:String,
    required:true
  },

  lavel:{
    type:String,
    required:true
  },

  duration: String,

  modules: [{
    title: String,
    description: String,
    lessons: [{
      title: String,
      content: String
    }]
  }],

  quizzes: [{
    title: String,
    questions: [{
      text: String,
      options: [String], // Array of strings for multiple choice options
      correctAnswer: String
    }]
  }],

  assignments: [{
    title: String,
    description: String,
    submissionDeadline: Date
  }],

  price:{
    type:Number,
    required:true
  },

  ratings:{
    type:Number,
     default:0
 },

  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Reference to another model for users
    },

    name:{
        type:String,
        required:true
    },

    rating: {
      type: Number,
      min: 1,
      max: 5
    },

    comment: String
  }],

});

// Create a Course model using the schema
export const Course = mongoose.model('Course', courseSchema);


