import { cartsModel } from "../models/carts.model.js";

export class cartsMongoDAO{
    
    constructor(){}

    // Returns all carts
    async get(){
        try {
            return await cartsModel.find({isDeleted: false}).populate('products.product').lean()
        } catch (error) {
            return {error: error}
        }
    }

    // Returns cart with provided ID
    async getByID(cid){
        try {
            return await cartsModel.findOne({_id: cid, isDeleted: false}).populate('products.product').lean()
        } catch (error) {
            return {error: error}
        }
    }

    // Creates cart with the given products
    async create(products){
        try {
            return await cartsModel.create({products})
        } catch (error) {
            return {error: error}
        }
    }

    // Updates cart with provided id
    async update(cid, products){

        let cart = []

        products = products.forEach(prod => cart.push({product: prod.product._id, quantity: prod.quantity}))

        try {
            return await cartsModel.updateOne({_id: cid}, {products: cart})
        } catch (error) {
            return {error: error}
        }
    }

    // Deletes cart with ID cid
    async delete(cid){
        try {
            return await cartsModel.updateOne({_id: cid}, {isDeleted: true})
        } catch (error) {
            return {error: error}
        }
    }
}