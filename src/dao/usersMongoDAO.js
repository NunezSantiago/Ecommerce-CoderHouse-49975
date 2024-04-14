import { usersModel } from "../models/users.model.js";

export class usersMongoDAO{

    constructor(){}

    async get(){
        try {
            return await usersModel.find({isDeleted: false}).lean()
        } catch (error) {
            return {error}
        }
    }

    async getByID(uid){
        try {
            return await usersModel.findOne({ _id: uid, isDeleted: false}).lean()
        } catch (error) {
            
        }
    }

    async getByEmail(email){
        try {
            return await usersModel.findOne({email: email, isDeleted: false}).lean()
        } catch (error) {
            return {error}
        }
    }
    
    async getByCartID(cid){
        try {
            return await usersModel.findOne({cart: cid, isDeleted: false}).lean()
        } catch (error) {
            
        }
    }
    
    async create(user){
        try {
            return await usersModel.create(user)
        } catch (error) {
            return {error}
        }
    }

    async update(uid, params){
        try{
            return await usersModel.updateOne({_id: uid}, params)
        } catch (error) {
            return {error}
        }
    }

    async delete(uid){
        try{
            return await usersModel.updateOne({_id: uid}, {isDeleted: true})
        } catch (error) {
            return {error}
        }
    }

}