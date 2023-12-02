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

async function filterJobBoard(columnName) {
    return await withOracleDB(async (connection) => {
        console.log(columnName);
        const result = await connection.execute(
                `SELECT ${columnName} FROM JOBPOSTINGOFFEREDPOSTED`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// function getUserInput(promptText) {
//     return prompt(promptText);
// }

// // WIP
// async function filterJobBoard(columnName) {
//     let input;
//     return await withOracleDB(async (connection) => {
//         if(!columnName || columnName != undefined) {
//             let result;
//             switch(columnName) {
//                 case 'ID':
//                     input = parseInt(getUserInput('Filtering for posting id:'));
//                     result = await connection.execute(`SELECT *
//                                 FROM JobPostingOfferedPosted j
//                                 WHERE j.PostingID = ${input}`)
//                     break;
//
//                 case 'Company':
//                     input = getUserInput("Filtering for company name:");
//                     result = await connection.execute(`SELECT *
//                                 FROM JobPostingOfferedPosted j
//                                 WHERE j.CompanyName = ${input}`)
//                     break;
//
//                 case 'Position':
//                     input = getUserInput("Filtering for posting position:");
//                     result = await connection.execute(`SELECT *
//                                 FROM JobPostingOfferedPosted j
//                                 WHERE j.Position = ${input}`)
//                     break;
//
//                 case 'Deadline':
//                     input = getUserInput("Filtering for posting deadline (YYYY-MM-DD HH24:MI:SS):");
//                     result = await connection.execute(`SELECT *
//                                 FROM JobPostingOfferedPosted j
//                                 WHERE j.Deadline = TO_TIMESTAMP('${input}', 'YYYY-MM-DD HH24:MI:SS')`)
//                     break;
//
//                 // case 'Term':
//                 //     input = parseInt(getUserInput('Filtering for placement term:'));
//                 //     sqlQuery = `SELECT *
//                 //                 FROM JobPostingOfferedPosted j
//                 //                 WHERE j.term = ${input}`;
//                 //     break;
//
//                 case 'Duration':
//                     input = parseInt(getUserInput('Filtering for placement duration:'));
//                     result = await connection.execute(`SELECT *
//                                 FROM JobPostingOfferedPosted j
//                                 WHERE j.Duration = ${input}`)
//                     break;
//
//                 case 'DatePosted':
//                     input = getUserInput("Filtering for posting date (YYYY-MM-DD HH24:MI:SS):");
//                     result = await connection.execute(`SELECT *
//                                 FROM JobPostingOfferedPosted j
//                                 WHERE j.TimePosted = TO_TIMESTAMP('${input}', 'YYYY-MM-DD HH24:MI:SS')`)
//                     break;
//             }
//             return result.rows;
//         }
//     })
// }

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
        const result = await connection.execute('SELECT Count(*) FROM JOBPOSTINGOFFEREDPOSTED');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

async function fetchJoinBoardFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT s.StudentID, s.Name, s.nApplications
             FROM JobPostingOfferedPosted j, ApplyTo a, AdvisedStudentAccesses s
             WHERE j.PostingID = :postingID
             AND j.PostingID = a.PostingID
             AND a.StudentID = s.StudentID`,
            [postingID]
        );

        return result.rows;
    }).catch(() => {
        return [];
    })
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
    fetchJoinBoardFromDb
};