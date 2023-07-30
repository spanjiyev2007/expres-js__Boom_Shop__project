import { Router } from "express";
import User from "../models/User.js";
import { generateJWTToken } from "../services/token.js";

const route = Router()
let editEmail

route.get('/login', (req, res) => {
    if(req.cookies.token){
        res.redirect('/')
        return 
    }
    res.render('login', {
        title: 'Login',
        isLogin: true,
        loginError: req.flash('loginError'),
    })
})

route.get('/register', (req, res) => {
    if(req.cookies.token){
        res.redirect('/')
        return 
    }
    res.render('register', {
        title: 'Register',
        isRegister: true,
        registerError: req.flash('registerError'),
    })
})

route.get('/logout',(req,res)=>{
    res.clearCookie('token')
    res.redirect('/')
    editEmail = ''
})

route.post('/login', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        req.flash('loginError', 'All fields is required')
        res.redirect('/login')
        return
    }

    const existUser = await User.findOne({ email: email })
    if (!existUser) {
        req.flash('loginError', 'User not found')
        res.redirect('/login')
        return
    }
    if (password !== existUser.password) {
        req.flash('loginError', 'Password wrong')
        res.redirect('/login')
        return
    } else {
        console.log('Success');
    }
    const token = generateJWTToken(existUser._id)
    res.cookie('token',token, {secure: true})
    editEmail = email
    res.redirect('/')
})

route.post('/register', async (req, res) => {
    const { firstname, lastname, email, password } = req.body
    if(!firstname || !lastname || !email || !password){
        req.flash('registerError', 'All fields is required')
        res.redirect('/register')
        return
    }

    const candidate = await User.findOne({email})
    if(candidate){
        req.flash('registerError', 'User already exist')
        res.redirect('/register')
        return
    }

    const userData = {
        firstName: firstname,
        lastName: lastname,
        email: email,
        password: password,
    }
    const user = await User.create(userData)
    const token = generateJWTToken(user._id)
    res.cookie('token',token, {secure: true})
    editEmail = user.email
    res.redirect('/')
})

// edit acaunt 
route.get('/edit-acaunt', (req,res)=>{
    res.render('edit-acaunt', {
        title: 'Edit Acaunt',
        isEditAcaunt: true,
        editEmail: editEmail,
    })
})

route.post('/edit-acaunt', async (req, res)=>{
    const { email, oldPassword, newPassword } = req.body
    const user = await User.findOne({ email })
    if (user.password !== oldPassword) {
      return res.status(401).json({ error: 'Eski parol noto\'g\'ri' })
    }
    user.password = newPassword
    await user.save()
    res.redirect('/')
})

export default route