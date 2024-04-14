import { Router } from 'express';
import { usersController } from '../controller/users.controller.js';
import { upload } from '../utils.js'
export const router = Router()

const isAdmin = (req, res, next) => {
    if(!req.session.user){
        return res.status(403).json({error: "Please, login as an administrator"})
    } else if(req.session.user.role != 'Admin'){
        return res.status(403).json({error: "Unauthorized. Your account does not have enough privileges to access this resource."})
    }
    next()
}

router.get('/', usersController.getUsers) // Get all users
//router.get('/:email', usersController.getUserByEmail)

router.post('/', usersController.createUser) // Create one user
router.post('/premium/:uid', usersController.updateRole)

// Password reset
router.post('/pwdReset01', usersController.pwdReset01)
router.get('/pwdReset02', usersController.pwdReset02)
router.post('/pwdReset03', usersController.pwdReset03)

// File upload
router.post('/:uid/documents', upload.fields([{name: "identificacion"}, {name: "comprobante_domicilio"}, {name: "estado_de_cuenta"}]), usersController.fileUpload)

router.post("/:uid/delete", isAdmin, usersController.deleteUser)
router.delete('/', isAdmin, usersController.deleteUsers)