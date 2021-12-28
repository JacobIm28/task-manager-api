import express from 'express'
import Task from '../models/task.js'
import auth from '../middleware/auth.js'
const router = express.Router()


// GET /tasks?completed=false
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
  const match = {}
  const sort = {}
  
  if(req.query.completed){
    match.completed = req.query.completed === 'true'
  }

  if(req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
  }

  try {
    // const tasks = await Task.find({owner: req.user._id})
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    })
    res.send(req.user.tasks)
  } catch (e) {
    res.status(500).send()
  }

  //  Task.find({})
  //     .then((tasks) => {
  //        res.send(tasks)
  //     })
  //     .catch((e) => {
  //        res.status(500).send()
  //     })
})

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
    // const task = await Task.findById(_id)

    const task = await Task.findOne({ _id, owner: req.user._id })

    if (!task) {
      return res.status(404).send()
    }

    res.send(task)
  } catch (e) {
    res.status(500).send()
  }

  //  Task.findById(_id)
  //     .then((task) => {
  //        if (!task) {
  //           return res.status(404).send()
  //        }
  //        res.send(task)
  //     })
  //     .catch((e) => {
  //        res.status(500).send()
  //     })
})

router.post('/tasks', auth, async (req, res) => {
  // const task = new Task(req.body)
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  })

  try {
    await task.save()
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }

  //  task
  //     .save()
  //     .then(() => {
  //        res.status(201).send(task)
  //     })
  //     .then((e) => {
  //        res.status(400).send(e)
  //     })
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['desc', 'completed']
  const isValid = updates.every((update) => allowedUpdates.includes(update))

  if (!isValid) {
    return res.status(400).send({ error: 'Updates are not valid!' })
  }

  try {
    // const task = await Task.findById(req.params.id)
    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

    if (!task) {
      return res.status(404).send()
    }
    updates.forEach((update) => (task[update] = req.body[update]))
    await task.save()

    res.send(task)
  } catch (e) {
    res.status(400).send()
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    // const task = await Task.findByIdAndDelete(req.params.id)

    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id}) //req.user._id is the current user

    if (!task) {
      return res.status(404).send()
    }

    res.send(task)
  } catch (e) {
    res.status(500).send()
  }
})

export default router
