import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('MongoDB is connected')
  })
  .catch((err) => {
    console.log(err)
  })

// mongodb+srv://cripintort:AKtaBtgnrd2vAeK5@mern-blog-2.zrbnuea.mongodb.net/?retryWrites=true&w=majority
// AKtaBtgnrd2vAeK5

app.listen(3000, () => {
  console.log('Server in running on port 3000!!!')
})
