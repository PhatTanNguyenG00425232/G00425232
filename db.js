const { get } = require('mongoose');
const pmysql = require('promise-mysql');
const MongoClient = require('mongodb').MongoClient;

let pool; // MySQL pool


// MySQL Connection Pool Setup
pmysql.createPool({
  connectionLimit: 3, 
  host: 'localhost',
  user: 'root',
  password: 'root', 
  database: 'proj2024Mysql',
})
  .then((p) => {
    pool = p;
    console.log('MySQL pool created');
  })
  .catch((error) => {
    console.log('MySQL pool error:', error.message);
  });

// MySQL Function: Get Students
const getStudents = function () {
    return new Promise((resolve, reject) => {
      if (!pool) return reject(new Error('MySQL pool not initialized'));
      pool.query('SELECT * FROM student') // Update table name as needed
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
// MYSQL Function: Update the student information
const updateStudent = function (sid, name, age) {
    return new Promise((resolve, reject) => {
      if (!pool) return reject(new Error('MySQL pool not initialized'));
      //update query for MYSQL
      const query = 'UPDATE student SET name = ?, age = ? WHERE sid = ?';
      pool.query(query, [name, age, sid])
        .then(() => resolve('Student updated successfully'))
        .catch((error) => reject(error));
    });
  };
// MYSQL Function: Adding student  
const addStudent = function (sid, name, age) {
    return new Promise((resolve, reject) => {
      if (!pool) return reject(new Error('MySQL pool not initialized'));
      //MYSQL query
      const query = 'INSERT INTO student (sid, name, age) VALUES (?, ?, ?)';
      pool.query(query, [sid, name, age])
        .then(() => resolve('Student added successfully'))
        .catch((error) => {
          //if student ID already exist
          if (error.code === 'ER_DUP_ENTRY') {
            reject(new Error(`Student ID ${sid} already exists`));
          } else {
            reject(error);
          }
        });
    });
  };
// MYSQL Function: Get grade for grade site
const getGrades = function () {
    return new Promise((resolve, reject) => {
      if (!pool) return reject(new Error('MySQL pool not initialized'));
      //mysql query
      const query = `
        SELECT 
          student.name AS studentName,
          module.name AS moduleName,
          grade.grade AS studentGrade
        FROM student
        LEFT JOIN grade ON student.sid = grade.sid
        LEFT JOIN module ON grade.mid = module.mid
        ORDER BY student.name ASC, grade.grade ASC
      `;
  
      pool.query(query)
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
  
// Export functions
module.exports = {
  getStudents,
  updateStudent,
   addStudent,
   getGrades
};
