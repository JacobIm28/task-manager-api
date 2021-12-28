import mongoose from 'mongoose'
import validator from 'validator'

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
})

export default mongoose
