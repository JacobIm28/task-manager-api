import express from 'express'
import User from '../models/user.js'
import auth from '../middleware/auth.js'
import emails from '../emails/account.js'
import multer from 'multer'
import sharp from 'sharp'
const router = new express.Router()

router.get('/test', (req, res) => {
  res.send('From a new file')
})

router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    emails.sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }

  //  user
  //     .save()
  //     .then(() => {
  //        res.status(201).send(user)
  //     })
  //     .catch((error) => {
  //        res.status(400).send(error)
  //     })
})

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (e) {
    res.status(400).send()
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
    await req.user.save()

    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.status(200).send()
  } catch (e) {
    res.status(500).send()
  }
})

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)

  //  User.find({})
  //     .then((users) => {
  //        res.send(users)
  //     })
  //     .catch((error) => {
  //        res.status(500).send()
  //     })
})

// router.get('/users/:id', async (req, res) => {
//   const _id = req.params.id //gets id from the url

//   try {
//     const user = await User.findById(_id)
//     if (!user) {
//       return res.status(404).send()
//     }
//     res.send(user)
//   } catch (e) {
//     res.status(500).send()
//   }

//    User.findById(_id)
//       .then((user) => {
//          if (!user) {
//             return res.status(404).send()
//          }
//          res.send(user)
//       })
//       .catch((e) => {
//          res.status(500).send()
//       })
// })

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValid = updates.every((update) => allowedUpdates.includes(update))

  if (!isValid) {
    return res.status(400).send({ error: 'Invalid Updates' })
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]))
    await req.user.save()
    res.send(req.user)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id)

    // if (!user) {
    //   return res.status(404).send()
    // }

    await req.user.remove()
    emails.sendCancelEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch (e) {
    res.status(500).send()
  }
})

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
      return cb(new Error('Upload a png, jpeg, or jpg'))
    }
    cb(undefined, true)
  },
})

router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
  },
  (e, req, res, next) => {
    res.status(400).send({ error: e.message })
  },
)

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user || !user.avatar) {
      throw new Error()
    }

    res.set('Content-type', 'image/png')
    res.send(user.avatar)
  } catch (e) {
    res.status(404).send()
  }
})

export default router
