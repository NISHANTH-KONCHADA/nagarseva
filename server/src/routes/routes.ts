import { Router } from 'express'
import { getSafeRoute } from '../controllers/routes.js'

const router = Router()

router.get('/safe', getSafeRoute)

export default router
