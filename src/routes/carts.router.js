import { Router } from 'express';
import { cartsController } from "../controller/carts.controller.js";

export const router = Router()

// Middlewars

const ownCart = (req, res, next) => {
    if(!req.session.user){
        return res.status(403).json("Please, login to add products to your cart")
    } else if(req.session.user.role == "Admin" || req.session.user.cart == req.params.cid){
        next()       
    } else {
        return res.status(403).json("Unauthorized. You can only modify your own cart.")
    }
}

router.get('/', cartsController.getCarts)
router.get('/:cid', cartsController.getCartByID)

router.post('/', cartsController.createCart)
router.post('/:cid/product/:pid', ownCart, cartsController.addToCart)
router.post('/:cid/purchase', ownCart, cartsController.finalizePurchase)

router.delete('/:cid/product/:pid', cartsController.removeFromCart)