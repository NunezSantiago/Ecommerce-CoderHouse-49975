export class cartsMemoryDAO{
    constructor(){
        this.carts = [
            {
                "_id": 1,
                "products": [
                    {
                        "product": {
                            "_id": 2,
                            "stock": 2,
                            "price": 192
                        },
                        "quantity": 4
                    },
                    {
                        "product": {
                            "_id": 1,
                            "stock": 2,
                            "price": 192
                        },
                        "quantity": 2
                    },
                    {
                        "product": {
                            "_id": 3,
                            "stock": 2,
                            "price": 192
                        },
                        "quantity": 1
                    }
                ],
                "isDeleted": false,
                "createdAt": "2024-02-11T14:30:02.604Z",
                "updatedAt": "2024-02-11T14:30:20.011Z"
            }
        ]
    }

    async get(){
        return this.carts.filter(cart => !cart.isDeleted)
    }

    async getByID(cid){
        return this.carts.find(cart => cart._id == cid && !cart.isDeleted)
    }

    async create(products){
        let cartID = 1

        if(this.carts.length != 0){
            cartID = this.carts.length + 1
        }

        let newCart = {
            _id: cartID,
            products,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        this.carts.push(newCart)

        return newCart

    }

    async update(cid, products){

        cid = parseInt(cid)
        
        let indexOfCart = this.carts.findIndex(cart => cart._id == cid)

        this.carts[indexOfCart].products = products
        this.carts[indexOfCart].updatedAt = new Date()

        return this.carts[indexOfCart]
    }

    async delete(cid){
        indexOfCart = this.carts.indexOf(cart => cart._id = cid)

        this.carts[indexOfCart].isDeleted = true
        this.carts[indexOfCart].updatedAt = new Date()

        return true
    }


}