import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './config/connectDB.js'
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import uploadRouter from './route/upload.router.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'

// --- FIREBASE ADMIN INITIALIZATION START ---
import admin from "firebase-admin"
import { readFile } from 'fs/promises'

const initializeFirebase = async () => {
    try {
        let serviceAccount;
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            console.log("☁️ Using Firebase credentials from Env Variable");
        } else {
            serviceAccount = JSON.parse(
                await readFile(new URL('./config/serviceAccountKey.json', import.meta.url))
            );
            console.log("💻 Using Firebase credentials from local file");
        }

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
        console.log("🔥 Firebase Admin Initialized Successfully");
    } catch (error) {
        console.error("❌ Firebase Initialization Error:", error.message);
    }
};

initializeFirebase();
// --- FIREBASE ADMIN INITIALIZATION END ---

const app = express()

// FIXED CORS: Added origin cleanup and validation
const allowedOrigins = [
    process.env.FRONTEND_URL?.replace(/\/$/, ""), // Removes trailing slash
    "https://heerastore.vercel.app", // Explicitly added for safety
    "http://localhost:5173",
    "capacitor://localhost",
    "http://localhost",
    "http://localhost:8080"
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("CORS Blocked for origin:", origin); // Debugging info
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))
app.use(helmet({
    crossOriginResourcePolicy : false
}))

const PORT = process.env.PORT || 8080

app.get("/",(request,response)=>{
    response.json({
        message : "Server is running " + PORT
    })
})

app.use('/api/user',userRouter)
app.use("/api/category",categoryRouter)
app.use("/api/file",uploadRouter)
app.use("/api/subcategory",subCategoryRouter)
app.use("/api/product",productRouter)
app.use("/api/cart",cartRouter)
app.use("/api/address",addressRouter)
app.use('/api/order',orderRouter)

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running", PORT);
  });
});
