import { Router } from 'express';
import * as dataController from '../acbda/controllers/dataController.js';

const router = Router();

// Data routes
router.post('/createTable', dataController.createTable);
router.post('/createData', dataController.createData);
router.post('/getData', dataController.getData);
router.put('/updateData', dataController.updateData);
router.delete('/deleteData', dataController.deleteData);
router.post('/getAllData', dataController.getAllData);
router.post('/getChildSchemaData', dataController.getChildSchemaData);
router.post('/searchChildData', dataController.searchChildData);

export default router; 