export class ticketsMemoryDAO{
    constructor(){
        this.tickets = []
    }

    async getByCode(code){
        return this.tickets.find(ticket => ticket.code == code && !ticket.isDeleted)
    }

    async create(ticket){

        let ticketID = 1

        if(this.tickets.length != 0){
            ticketID = this.tickets.length + 1
        }

        ticket._id = ticketID
        ticket.isDeleted = false
        ticket.createdAt = new Date()
        ticket.updatedAt = new Date()

        this.tickets.push(ticket)
    }
}