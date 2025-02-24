import { Router } from 'express';
import * as schemaController from '../acbda/activities/DataManagmentService/schemaServiceActivity.js';

const router = Router();

// Schema routes
router.post('/createSchema', schemaController.createSchema);
router.post('/getSchema', schemaController.getSchema);
router.get('/getAllSchemas', schemaController.getAllSchemas);
router.put('/updateSchema', schemaController.updateSchema);
router.delete('/deleteSchema', schemaController.deleteSchema);
router.put('/updateSchemaTableRef', schemaController.updateSchemaTableRef);



export default router;
