import express from "express";
import { create } from 'express-handlebars'
import mongoose from "mongoose";
import * as dotenv from 'dotenv';
import flash from 'connect-flash';
import session from "express-session";
import cookieParser from "cookie-parser";
import varMiddlware from "./middlrware/var.js";
import userMiddlware from "./middlrware/user.js";
import hbsHelpers from './utils/index.js'

// ROUTES
import AuthRoutes from './routes/auth.js'
import ProductRoutes from './routes/products.js'



dotenv.config()

const app = express()

const hbs = create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: hbsHelpers,
})

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(session({secret: 'qwerty', resave: false, saveUninitialized: false}));
app.use(flash());
app.use(cookieParser())
app.use(varMiddlware)
app.use(userMiddlware)

app.use(AuthRoutes)
app.use(ProductRoutes)

const startApp = () => {
    try {
        mongoose.set('strictQuery', false)
        mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
        })

        const PORT = process.env.PORT || 4100
        app.listen(PORT, () => console.log(`succes port in ${PORT}`))
    } catch (error) {
        console.log(error);
    }
}

startApp()