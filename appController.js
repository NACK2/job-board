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
router.get('/students-board', async (req, res) => {
    const tableContent = await appService.fetchStudentsBoardFromDb();
    res.json({data: tableContent});
});
router.get('/applicationsboard', async (req, res) => {
    const tableContent = await appService.fetchApplicationsBoardFromDb();
    res.json({data: tableContent});
});
router.get('/divide-jobboard', async (req, res) => {
    const tableContent = await appService.fetchDivideBoardFromDb();
    res.json({data: tableContent});
});
router.get("/initiate-jobboard", async (req, res) => {
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
router.post("/insert-student", async (req, res) => {
    const { studentid, name, email, standing, napplications, advisorid} = req.body;
    const insertResult = await appService.insertStudent(studentid, name, email, standing, napplications,"Board 1", advisorid);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});
router.post("/insert-application", async (req, res) => {
    const { studentid,postingid} = req.body;
    const insertResult = await appService.insertApplication(studentid,postingid);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post('/filter-jobboard', async (req, res) => {
    const { columnNames } = req.body;
    const tableContent = await appService.filterJobBoard(columnNames);
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

router.post("/update-jobboard", async (req, res) => {
    const { targetID, targetColumn, newValue } = req.body;
    const updateResult = await appService.updateJobBoard(targetID, targetColumn, newValue);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-jobboard', async (req, res) => {
    const tableContent = await appService.countJobBoard();
    res.json({data: tableContent});
});

router.post('/counthaving-jobboard', async (req, res) => {
    const { months } = req.body;
    const tableContent = await appService.countHavingJobBoard(months);
    res.json({data: tableContent});
});

router.post('/join-jobboard', async (req, res) => {
    const { postingID } = req.body;
    const result = await appService.fetchJoinBoardFromDb(postingID);
    res.json({data: result});
})

router.post('/search-jobboard', async (req, res) => {
    const { query } = req.body;
    const result = await appService.searchJobBoardFromDb(query);
    res.json({data: result});
})

router.get('/advisorsboard', async (req, res) => {
    const tableContent = await appService.fetchAdvisorsBoardFromDb();
    res.json({data: tableContent});
});

router.get('/nestedGroup-jobboard', async (req, res) => {
    const tableContent = await appService.countNestedGroup();
    res.json({data: tableContent});
});

module.exports = router;