import { dataService } from '../activities/DataManagmentService/dataServiceActivity.js';

export const createTable = async (req, res, next) => {
    try {
        const { schemaId } = req.body;
        if (!schemaId) {
            res.status(400).json({ error: 'Schema ID is required' });
            return;
        }

        const tableRef = await dataService.createTable(schemaId);
        res.status(201).json({ tableRef });
    } catch (error) {
        next(error);
    }
};

export const createData = async (req, res, next) => {
    try {
        const { schemaId, data } = req.body;
        if (!schemaId || !data) {
            res.status(400).json({ error: 'Schema ID and data are required' });
            return;
        }

        const createdData = await dataService.createData(schemaId, data);
        res.status(201).json(createdData);
    } catch (error) {
        next(error);
    }
};

export const getData = async (req, res, next) => {
    try {
        const { schemaId, uuid } = req.body;
        if (!schemaId || !uuid) {
            res.status(400).json({ error: 'Schema ID and data UUID are required' });
            return;
        }

        const data = await dataService.getData(schemaId, uuid);
        if (!data) {
            res.status(404).json({ error: 'Data not found' });
            return;
        }
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

export const updateData = async (req, res, next) => {
    try {
        const { schemaId, uuid, data } = req.body;
        if (!schemaId || !uuid || !data) {
            res.status(400).json({ error: 'Schema ID, data UUID, and update data are required' });
            return;
        }

        const updatedData = await dataService.updateData(schemaId, uuid, data);
        res.status(200).json(updatedData);
    } catch (error) {
        next(error);
    }
};

export const deleteData = async (req, res, next) => {
    try {
        const { schemaId, uuid } = req.body;
        if (!schemaId || !uuid) {
            res.status(400).json({ error: 'Schema ID and data UUID are required' });
            return;
        }

        await dataService.deleteData(schemaId, uuid);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const getAllData = async (req, res, next) => {
    try {
        const { schemaId } = req.body;
        if (!schemaId) {
            res.status(400).json({ error: 'Schema ID is required' });
            return;
        }

        const allData = await dataService.getAllData(schemaId);
        res.status(200).json(allData);
    } catch (error) {
        next(error);
    }
};

export const getChildSchemaData = async (req, res, next) => {
    try {
        const { parentSchemaId, childSchemaId } = req.body;
        if (!parentSchemaId || !childSchemaId) {
            res.status(400).json({ error: 'Parent and child schema IDs are required' });
            return;
        }

        const childData = await dataService.getChildSchemaData(parentSchemaId, childSchemaId);
        res.status(200).json(childData);
    } catch (error) {
        next(error);
    }
};

export const searchChildData = async (req, res, next) => {
    try {
        const { childSchemaId, query } = req.body;
        if (!childSchemaId || !query) {
            res.status(400).json({ error: 'Child schema ID and search query are required' });
            return;
        }

        const data = await dataService.searchChildData(childSchemaId, query);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}; 