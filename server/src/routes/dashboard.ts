import { Router } from 'express'
import { getWardDashboardStats } from '../controllers/dashboard.js'

const router = Router()

router.get('/wards', getWardDashboardStats)

export default router
