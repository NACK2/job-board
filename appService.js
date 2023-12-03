const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`
};


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function fetchJobBoardFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT PostingID, CompanyName, Position, Deadline, Term, Duration, DatePosted
            FROM JOBPOSTINGOFFEREDPOSTED`);
        return result.rows;
    }).catch(() => {
        return [];
    });
}
async function fetchStudentsBoardFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT STUDENTID,NAME,EMAIL,STANDING,NAPPLICATIONS,ADVISORID
            FROM ADVISEDSTUDENTACCESSES`);
        return result.rows;
    }).catch(() => {
        return [];
    });
}
async function fetchApplicationsBoardFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT STUDENTID,POSTINGID
            FROM APPLYTO`);
        return result.rows;
    }).catch(() => {
        return [];
    });
}
async function fetchDivideBoardFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT Name
             FROM AdvisedStudentAccesses A
             WHERE NOT EXISTS (
                 (SELECT PostingID
                  FROM JobPostingOfferedPosted)
                 MINUS
                 (SELECT PostingID
                 FROM ApplyTo AP
                 WHERE AP.StudentID = A.StudentID)
                       )`);
        return result.rows;
    }).catch(() => {
        return [];
    });
}
async function initiateJobBoard() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE JOBPOSTINGOFFEREDPOSTED`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        return true;
    }).catch(() => {
        return false;
    });
}

async function insertJobBoard(id, company, position, deadline, term, duration, datePosted, boardTitle) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO JOBPOSTINGOFFEREDPOSTED (postingid, companyname, position, deadline, term, duration, datePosted, boardtitle) VALUES (:id, :company, :position, :deadline, :term, :duration, :datePosted, :boardTitle)`,
            [id, company, position, deadline, term, duration, datePosted, boardTitle],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}
async function insertApplication(studentID,postingID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO APPLYTO (studentid,postingid) VALUES (:studentID, :postingID)`,
            [studentID,postingID],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function filterJobBoard(columnNames) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
                `SELECT ${columnNames} FROM JOBPOSTINGOFFEREDPOSTED`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function removeIDJobBoard(removeID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM JOBPOSTINGOFFEREDPOSTED WHERE postingid=:removeID`,
            [removeID],
            {autoCommit: true}
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updatePositionJobBoard(targetID, newPosition) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE JOBPOSTINGOFFEREDPOSTED SET position=:newPosition where PostingID=:targetID`,
            [newPosition, targetID],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function countJobBoard() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT CompanyName, COUNT(*) AS TotalJobsOffered FROM JobPostingOfferedPosted GROUP BY CompanyName');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchJoinBoardFromDb(postingID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT s.StudentID, s.Name, s.nApplications
             FROM JOBPOSTINGOFFEREDPOSTED j, APPLYTO a, ADVISEDSTUDENTACCESSES s
             WHERE j.PostingID = :postingID AND j.PostingID = a.PostingID AND a.StudentID = s.StudentID`,
            { postingID });

        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchAdvisorsBoardFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT AdvisorID, AdvisorName, AdvisorEmail, DeptName
             FROM EMPLOYEDCOOPADVISOR`);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

module.exports = {
    testOracleConnection,
    fetchJobBoardFromDb,
    initiateJobBoard,
    insertJobBoard,
    filterJobBoard,
    removeIDJobBoard,
    updatePositionJobBoard,
    countJobBoard,
    fetchStudentsBoardFromDb,
    fetchApplicationsBoardFromDb,
    fetchDivideBoardFromDb,
    insertApplication,
    fetchJoinBoardFromDb,
    fetchAdvisorsBoardFromDb
};