const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/jobboard', async (req, res) => {
    const tableContent = await appService.fetchJobBoardFromDb();
    res.json({data: tableContent});
});

router.post("/initiate-jobboard", async (req, res) => {
    const initiateResult = await appService.initiateJobBoard();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-jobboard", async (req, res) => {
    const { id, company, position, deadline, term, duration, datePosted } = req.body;
    const insertResult = await appService.insertJobBoard(id, company, position, deadline, term, duration, datePosted,"Board 1");
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// WIP
router.post('/filter-jobboard', async (req, res) => {
    const { columnName } = req.body;
    const tableContent = await appService.filterJobBoard(columnName);
    res.json({data: tableContent});
});

router.post("/remove-id-jobboard", async (req, res) => {
    const { removeID } = req.body;
    const updateResult = await appService.removeIDJobBoard(removeID);

    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-position-jobboard", async (req, res) => {
    const { targetID, newPosition } = req.body;
    const updateResult = await appService.updatePositionJobBoard(targetID, newPosition);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-jobboard', async (req, res) => {
    const tableCount = await appService.countJobBoard();
    if (tableCount >= 0) {
        res.json({
            success: true,
            count: tableCount
        });
    } else {
        res.status(500).json({
            success: false,
            count: tableCount
        });
    }
});

module.exports = router;