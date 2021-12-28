import mongoose from "mongoose"

const taskSchema = new mongoose.Schema({
  desc: {
    type: String,
    trim: true,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }, 
  owner: {
    type: mongoose.Schema.Types.ObjectID,
    required: true,
    ref:'User'
  }
}, {
  timestamps: true
})

const Task = mongoose.model('Task', taskSchema)



export default Task