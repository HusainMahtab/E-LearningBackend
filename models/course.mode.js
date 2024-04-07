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

  duration: String,
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor' // Reference to another model for instructors
  },

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

  prerequisites: [String],
  price: Number,

  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Reference to another model for users
    },
    
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  }],


  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  }
});

// Create a Course model using the schema
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
