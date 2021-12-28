import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'imjacob933@gmail.com',
    subject: 'Thanks for joining!',
    text: `Welcome to the task app, ${name}. Let me know how like it!`,
    html: '<header>Welcome</header>'
  })
}

const sendCancelEmail = (email, name) => {
  sgMail.send({
    to: email, 
    from: 'imjacob933@gmail.com',
    subject: 'Account cancellation',
    text: `Sorry to see you go, ${name}.`
  })
}

export default {
  sendWelcomeEmail,
  sendCancelEmail
}