import { Router } from "express";
import Product from "../models/Product.js";
import authMiddlware from "../middlrware/auth.js";
import userMiddlware from "../middlrware/user.js";
const route = Router()

route.get('/', async (req, res) => {
    const product = await Product.find().lean()

    res.render('index', {
        title: 'Boom shop',
        product: product.reverse(),
        userId: req.userId ? req.userId.toString() : null
    })
})
route.get('/products', async (req, res) => {
    const user = req.userId ? req.userId.toString() : null
    const myProducts = await Product.find({ user }).populate('user').lean()

    res.render('products', {
        title: 'Products',
        isProducts: true,
        myProducts: myProducts
    })
})
route.get('/add', authMiddlware, (req, res) => {
    res.render('add', {
        title: 'Add products',
        isAdd: true,
        errorAddProducts: req.flash('errorAddProducts'),
    })
})

route.get('/products/:id', async (req,res)=>{
    const id = req.params.id
    const product = await Product.findById(id).populate('user').lean()

    res.render('product',{
        product: product,
    })
})

route.get('/edit-product/:id', async (req,res)=>{
    const id = req.params.id
    const product = await Product.findById(id).populate('user').lean()

    res.render('edit-product',{
        product: product,
        errorEditProduct: req.flash('errorEditProduct'),
    })
})

route.post('/add-product', userMiddlware, async (req, res) => {
    const { title, description, image, price } = req.body

    if (!title || !description || !image || !price) {
        req.flash('errorAddProducts', 'All fields is required')
        res.redirect('/add')
        return
    }
    const prducts = await Product.create({ ...req.body, user: req.userId })
    res.redirect('/')
})

route.post('/edit-product/:id', async(req,res)=>{
    const id = req.params.id
    const { title, description, image, price } = req.body

    if (!title || !description || !image || !price) {
        req.flash('errorEditProduct', 'All fields is required')
        res.redirect(`/edit-product/${id}`)
        return
    }

    const product = await Product.findByIdAndUpdate(id, req.body, {new: true})

    res.redirect('/products')
}) 

route.post('/delete-product/:id', async(req,res)=>{
    const id = req.params.id

    await Product.findByIdAndRemove(id)

    res.redirect('/')
})

export default route