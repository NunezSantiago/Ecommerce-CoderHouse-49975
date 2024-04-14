import { Router } from 'express'
import { viewsController } from '../controller/views.controller.js'

export const router = Router()

// Middlewares

const auth = (req, res, next) => {
    if(!req.session.user){
        return res.redirect('/login')
    }
    next()
}

const isAdmin = (req, res, next) => {
    if(req.session.user.role != "Admin"){
        return res.redirect('/products')
    }
    next()
}
// Home
router.get('/', auth, viewsController.home)

// Product views
router.get('/products', auth, viewsController.products)
router.get('/product/:pid', auth, viewsController.product)

// Cart views
router.get('/carts', auth, viewsController.carts)
router.get('/cart/:cid', auth, viewsController.cart)

// Session views 
router.get('/login', viewsController.login)
router.get('/register', viewsController.register)
router.get('/profile', auth, viewsController.profile)

// Password reset
router.get('/pwdReset', viewsController.pwdReset)
router.get('/pwdReset02', viewsController.pwdUpdate)

// File upload
router.get('/upload', auth, viewsController.fileUpload)

// User views
router.get('/users', auth, isAdmin, viewsController.users)
router.get('/user/:uid', auth, isAdmin, viewsController.user)