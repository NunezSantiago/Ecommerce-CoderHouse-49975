import { cartsService } from "../services/carts.service.js";
import { productsService } from "../services/products.service.js";
import { ticketsService } from "../services/ticket.service.js";
import { sendEmail } from "../mails/mail.js"
import { usersService } from "../services/user.service.js";

import { customError } from "../utils/customErrors.js";
import { STATUS_CODES } from "../utils/errorCodes.js";
import { INTERNAL_CODES } from "../utils/errorCodes.js";

export class cartsController{

    constructor(){}

    static async getCarts(req, res){
        res.setHeader("Content-Type", "application/json");

        let carts = await cartsService.getCarts()

        if(carts.error){
            let error = customError.customError("Database unexpected error", carts.error.message, STATUS_CODES.SERVER_ERROR, INTERNAL_CODES.DATABASE, "Database unexpected error, please, retry later")
            req.logger.error(error)
            return res.status(error.statusCode).json(error)
        } else{
            return res.status(200).json(carts)
        }

    }

    static async getCartByID(req, res){
        res.setHeader("Content-Type", "application/json");

        let cartId = req.params.cid

        let cart = await cartsService.getCartByID(cartId)

        if(cart){
            if(cart.error){
                let error = customError.customError("Database unexpected error", cart.error.message, STATUS_CODES.SERVER_ERROR, INTERNAL_CODES.DATABASE, "Database unexpected error, please, retry later")
                req.logger.error(error)
                return res.status(error.statusCode).json(error)
            } else{
                req.logger.info({message: "Cart retrieved successfully", cart})
                return res.status(200).json(cart)
            }
        } else{
            let error = customError.customError("Not found", `Cart with ID ${cartId} not found`, STATUS_CODES.NOT_FOUND, INTERNAL_CODES.ARGUMENTS, `Cart with ID ${cartId} not found`)
            req.logger.error(error)
            return res.status(error.statusCode).json(error)
        }

    }

    static async createCart(req, res){

        res.setHeader("Content-Type", "application/json");

        let { products } = req.body
    
        let cart = []
        
        if(products){
            let availableProducts = await productsService.getAllProducts()
        
            if(availableProducts.error){
                let error = customError.customError("Database unexpected error", availableProducts.error.message, STATUS_CODES.SERVER_ERROR, INTERNAL_CODES.DATABASE, "Database unexpected error, please, retry later")
                req.logger.error(error)
                return res.status(error.statusCode).json(error)
            }

            let productsIds = availableProducts.map(product => product._id.toString())
            
            products.forEach( (product) => {
                if(productsIds.includes(product)){
                    cart.push({product, quantity: 1})
                }
            })
        }

        let newCart = await cartsService.createCart(cart)

        if(newCart.error){
            let error = customError.customError("Database unexpected error", newCart.error.message, STATUS_CODES.SERVER_ERROR, INTERNAL_CODES.DATABASE, "Database unexpected error, please, retry later")
            req.logger.error(error)
            return res.status(error.statusCode).json(error)
        } else{
            req.logger.info({message: "Cart created successfully", cartID: newCart._id})
            res.status(201).json({message: "Cart added successfully", cartID: newCart._id})
        }
    }

    static async addToCart(req, res){
        
        res.setHeader("Content-Type", "application/json");
        
        let cartId = req.params.cid
        let productId = req.params.pid

        let quantity = (req.body.quantity && !isNaN(req.body.quantity)) ? req.body.quantity : 1
        quantity = parseInt(quantity)

        let existCart = await cartsService.getCartByID(cartId)
        let existProduct = await productsService.getProductByID(productId)

        if(req.session.user.role == "Premium" && existProduct.owner != req.session.user.email){
            let error = customError.customError("Cannot add product", `Premium users cannot add products owned by them to the cart`, STATUS_CODES.ERROR_AUTORIZACION, INTERNAL_CODES.PERMISSIONS, `Cannot add  product with id ${productId}`)
            req.logger.error(error)
            return res.status(error.statusCode).json(error)
        }

        if(existCart && !existCart.error){
            if(existProduct && !existProduct.error){

                let cart = existCart.products
                let productinCart = false
                
                for(let prod of cart){
                    if(prod.product._id == productId){
                        prod.quantity+=quantity
                        productinCart = true
                        break
                    }
                }

                if(!productinCart){
                    cart.push({product: {
                        _id: existProduct._id,
                        stock: existProduct.stock,
                        price: existProduct.price
                    }, quantity})
                }

                let updatedCart = await cartsService.updateCart(cartId, cart)

                if(updatedCart.error){
                    let error = customError.customError("Database unexpected error", newCart.error.message, STATUS_CODES.SERVER_ERROR, INTERNAL_CODES.DATABASE, "Database unexpected error, please, retry later")
                    req.logger.error(error)
                    return res.status(error.statusCode).json(error)
                } else{
                    req.logger.info({message: `Successfully added product ${productId} to cart ${cartId}`})
                    return res.status(201).json({message: `Successfully added product ${productId} to cart ${cartId}`})
                }

            } else{
                let error = customError.customError("Not found", `Product with ID ${productId} not found`, STATUS_CODES.NOT_FOUND, INTERNAL_CODES.ARGUMENTS, `Product with ID ${productId} not found`)
                req.logger.error(error)
                return res.status(error.statusCode).json(error)
            }
        } else{
            let error = customError.customError("Not found", `Cart with ID ${cartId} not found`, STATUS_CODES.NOT_FOUND, INTERNAL_CODES.ARGUMENTS, `Cart with ID ${cartId} not found`)
            req.logger.error(error)
            return res.status(error.statusCode).json(error)
        }

    }

    static async removeFromCart(req, res){
        
        res.setHeader("Content-Type", "application/json");

        let cartId = req.params.cid
        let productId = req.params.pid

        let existCart = await cartsService.getCartByID(cartId)
        let existProduct = await productsService.getProductByID(productId)

        if(existCart && !existCart.error){
            if(existProduct && !existProduct.error){

                let cart = existCart.products
                
                let newCart = cart.filter( p => p.product._id != productId)

                if(newCart.length === cart.length){
                    // Product was not in cart
                    res.status(400).json({error: `Product ${productId} is not in cart ${cartId}`})
                } else {
                    let updatedCart = cartsService.updateCart(cartId, newCart)
                    
                    if(updatedCart.error){
                        let error = customError.customError("Database unexpected error", newCart.error.message, STATUS_CODES.SERVER_ERROR, INTERNAL_CODES.DATABASE, "Database unexpected error, please, retry later")
                        req.logger.error(error)
                        return res.status(error.statusCode).json(error)
                    } else{
                        req.logger.info({message: `Successfully deleted product ${productId} to cart ${cartId}`})
                        return res.status(201).json({message: `Successfully deleted product ${productId} to cart ${cartId}`})
                    }
                }
            } else{
                let error = customError.customError("Not found", `Product with ID ${productId} not found`, STATUS_CODES.NOT_FOUND, INTERNAL_CODES.ARGUMENTS, `Product with ID ${productId} not found`)
                req.logger.error(error)
                return res.status(error.statusCode).json(error)
            }
        } else{
            let error = customError.customError("Not found", `Cart with ID ${cartId} not found`, STATUS_CODES.NOT_FOUND, INTERNAL_CODES.ARGUMENTS, `Cart with ID ${cartId} not found`)
            req.logger.error(error)
            return res.status(error.statusCode).json(error)
        }

    }

    static async finalizePurchase(req, res){
        
        res.setHeader("Content-Type", "application/json");

        let cartId = req.params.cid

        let cart = await cartsService.getCartByID(cartId)

        if(cart){

            let amount = 0
            let available = [] // Keep a list of the available products, to update later
            let unavailable = []

            cart.products.forEach( prod => {
                if(prod.quantity <= prod.product.stock){
                    available.push(prod)
                    amount+=(parseFloat(prod.product.price*prod.quantity))
                } else {
                    unavailable.push(prod._id)
                }
            })

            if(available.length > 0){
                
                let ticket
                let purchaser = cart._id
                let purchase_datetime = new Date()

                // Random code generator
                let code
                let unique = false

                do{
                    code = (Math.random() + 1).toString(36).substring(2) + (Math.random() + 1).toString(36).substring(2);
                    ticket = await ticketsService.getTicketByCode(code) 
                    if(!ticket){
                        unique = true
                    }
                } while(!unique)

                let cartOwner = await usersService.getUserByCartID(purchaser)

                if(cartOwner){
                    let message = `Hey ${cartOwner.first_name}, thank you for completing your purchase!`
                    message+=req.session.user._id != cartOwner._id ? " Your purchase was completed by an Administrator" : ""
                    let response = await sendEmail(cartOwner.email, "Purchase notification", message)
                }

                let result = await ticketsService.createTicket({code, purchase_datetime, amount, purchaser})

                if(result.error){
                    let error = customError.customError("Database unexpected error", newCart.error.message, STATUS_CODES.SERVER_ERROR, INTERNAL_CODES.DATABASE, "Database unexpected error, please, retry later")
                    req.logger.error(error)
                    return res.status(error.statusCode).json(error)
                }

                let newCart = cart

                let availableIDs = available.map(avail => avail.product._id)

                for(let i = newCart.products.length - 1; i >= 0; i--){
                    if(availableIDs.includes(newCart.products[i].product._id)){
                        newCart.products.splice(i, 1)
                    }
                }

                let updateCart = await cartsService.updateCart(cartId, newCart.products)
                
                available.forEach(async prod => {
                    await productsService.updateProduct(prod.product._id, {stock: prod.product.stock - prod.quantity})
                })

                req.logger.info({message: "Purchase completed successfully", ticket: result})
                res.status(200).json({message: "Purchase completed successfully", ticket: result})
            } else{
                req.logger.info({message: "Purchase was completed, but none of the selected products were available for purchase"})
                res.status(200).json({message: "Purchase was completed, but none of the selected products were available for purchase"})
            }

        } else{
            let error = customError.customError("Not found", `Cart with ID ${cartId} not found`, STATUS_CODES.NOT_FOUND, INTERNAL_CODES.ARGUMENTS, `Cart with ID ${cartId} not found`)
            req.logger.error(error)
            return res.status(error.statusCode).json(error)
        }
    }
}