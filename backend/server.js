import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import aiReceptionistRouter from './routes/aiReceptionist.js'
// import cors from "cors";


// import aiBookRoutes from "./routes/aiBook.js";
//app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()
// app.use(cors({
//   origin: [
//     "http://localhost:5173",
//     "https://online-appointment-syste-f64b6.web.app"
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});
//middlewares
app.use(express.json())
app.use(cors())
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)
app.use('/api/ai', aiReceptionistRouter)
app.get('/', (req, res) => {
    res.send('API WORKING ')
})

app.listen(port, () => console.log(`Server is running on port ${port}`))