//import { productsController } from '../controller/products.controller.js'
//import { cartsController } from '../controller/carts.controller.js'
import { productsService } from '../services/products.service.js'
import { cartsService } from '../services/carts.service.js'
import { usersService } from '../services/user.service.js'

const currentUser = (session) => {
    return {
        activeSession: session.user ? true : false,
        isAdmin: session.user && session.user.role == "Admin" ? true : false,
        cartID: session.user ? session.user.cart : undefined
    }
}

export class viewsController{
    constructor(){}

    static async home(req, res){
        res.setHeader('Content-Type', 'text/html')
        res.redirect('/products')
    }

    static async products(req, res){
    
        //res.setHeader('Content-Type', 'text/html')
        
        let {limit, page, query, sort} = req.query

        let conf = {
			lean: true,
			limit: limit ? parseInt(limit) : 10,
			page : page ? parseInt(page) : 1,
		}

        if(sort && (sort === 'asc' || sort === 'desc')){
			conf.sort = {price : sort}
		}

        if(query){
			query = JSON.parse(query)
			query.isDeleted = false
		} else{
			query = {isDeleted: false}
		}

        let products = await productsService.getProducts(conf, query)

        let { totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } = products

        let user = req.session.user

        //let user = req.session.user

        //console.log( totalPages, hasPrevPage, hasNextPage, prevPage, nextPage )

        return res.status(200).render('products', {currentUser: currentUser(req.session), cartID: user.cart, products: products.docs, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage, limit, title:'Products'})
        
    }

    static async product(req, res){
        res.setHeader('Content-Type', 'text/html')

        let id = req.params.pid
    
        let product = await productsService.getProductByID(id)

        let user = req.session.user

        console.log(product)

        return res.status(200).render('product', {currentUser: currentUser(req.session), cartID: user.cart, product, title: product.title})
    }

    static async carts(req, res){
        res.setHeader('Content-Type', 'text/html')

        let carts = await cartsService.getCarts()
        res.status(200).render('carts',{currentUser: currentUser(req.session), carts, title:'Carts'})
    }

    static async cart(req, res){
        res.setHeader('Content-Type', 'text/html')

        let id = req.params.cid

        let cart = await cartsService.getCartByID(id)

        let emptyCart = cart.products.length == 0

        res.status(200).render('cart', {emptyCart, currentUser: currentUser(req.session), cart, title: `Cart ${cart._id}`})
    }

    static async login(req, res){
        
        let { error, message }  = req.query
    
        res.setHeader('Content-Type', 'text/html')
        res.status(200).render('login', {currentUser: currentUser(req.session), error, message})
    }

    static async register(req, res){
        
        let { error, message } = req.query 
    
        res.setHeader('Content-Type', 'text/html')
        res.status(200).render('register', {currentUser: currentUser(req.session), error})
    }


    static async profile(req, res){
        
        let user = req.session.user

        let { message }  = req.query

        res.setHeader('Content-Type', 'text/html')
        res.status(200).render('profile', {currentUser: currentUser(req.session), user, message})
    }

    static async pwdReset(req, res){

        let { error } = req.query

        res.setHeader('Content-Type', 'text/html')
        res.status(200).render('pwdReset', {currentUser: currentUser(req.session), error})
    }

    static async pwdUpdate(req, res){
        let { error, token } = req.query

        res.setHeader('Content-Type', 'text/html')
        res.status(200).render('pwdUpdate', {currentUser: currentUser(req.session), error, token})
    }

    static async fileUpload(req, res){
        res.setHeader('Content-Type', 'text/html')
        res.status(200).render('fileUpload', {currentUser: currentUser(req.session), uid: req.session.user._id})
    }

    static async users(req, res){
        let users = await usersService.getUsers()
        //let displayUsersOption = req.session.user && req.session.user.role == "Admin"
        res.setHeader('Content-Type', 'text/html')
        res.status(200).render('users', {currentUser: currentUser(req.session), users})
    }
    
    static async user(req, res){
        let { uid } = req.params
        let user = await usersService.getUserByID(uid)

        let isUserNotAdmin = user.role != "Admin"
        let isUserPremium = user.role == "Premium"

        //console.log(user)

        res.setHeader('Content-Type', 'text/html')
        res.status(200).render('user', {currentUser: currentUser(req.session), user, isUserNotAdmin, isUserPremium})
    }
}