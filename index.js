const express = require('express');
const bodyParser = require('body-parser');
const { getStudents,  updateStudent, addStudent, getGrades } = require('./db'); // Import DAO functions

const app = express();
const PORT = 3004;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

// Home Route
app.get('/', (req, res) => {
  res.send(`
    <h1>G00425232</h1>
    <ul>
      <li><a href="/students">Students</a></li>
      <li><a href="/grades">Grades</a></li>
      <li><a href="/lecturers">Lecturers</a></li>
    
    </ul>
  `);
});

// Go to student site
app.get('/students', (req, res) => {
  getStudents()
    .then((students) => {
      res.render('students', { students });
    })
    .catch((error) => {
      console.error('Error fetching students:', error.message);
      res.status(500).send('Error fetching students: ' + error.message);
    });
});
// Go to Student ID site
app.get('/students/edit/:sid', (req, res) => {
  const { sid } = req.params;

  getStudents()
    .then((students) => {
      const student = students.find((s) => s.sid === sid);
      if (student) {
        res.render('editStudent', { student });
      } else {
        res.status(404).send('Student not found');
      }
    })
    .catch((error) => {
      console.error('Error fetching students:', error.message);
      res.status(500).send('Error fetching students: ' + error.message);
    });
});
//update student after editted
app.post('/students/edit/:sid', (req, res) => {
  const { sid } = req.params;
  const { name, age } = req.body;

  // Validation
  if (!name || name.length < 2) {
    return res.status(400).send('Student Name must be at least 2 characters.');
  }
  if (!age || age < 18) {
    return res.status(400).send('Student Age must be at least 18.');
  }

  updateStudent(sid, name, parseInt(age, 10))
    .then(() => res.redirect('/students'))
    .catch((error) => {
      console.error('Error updating student:', error.message);
      res.status(500).send('Error updating student: ' + error.message);
    });
});

//add student site
app.get('/students/add', (req, res) => {
  res.render('addStudent', { errors: [], sid: '', name: '', age: '' });
});

//update student site after added
app.post('/students/add', (req, res) => {
  const { sid, name, age } = req.body;

  // Validation logic
  const errors = [];
  if (!sid || sid.length !== 4) errors.push('Student ID should be 4 characters');
  if (!name || name.length < 2) errors.push('Student Name should be at least 2 characters');
  if (!age || age < 18) errors.push('Student Age should be at least 18');

  if (errors.length > 0) {
    // Return errors along with previous data
    return res.render('addStudent', { errors, sid, name, age });
  }

  // Add student to the database
  addStudent(sid, name, parseInt(age, 10))
    .then(() => res.redirect('/students')) // Redirect on success
    .catch((error) => {
      // Handle database errors (e.g., duplicate ID)
      res.render('addStudent', { errors: [error.message], sid, name, age });
    });
});
// Students Route (MySQL)
app.get('/grades', (req, res) => {
  getGrades() // Call the DAO function to fetch grades
    .then((grades) => {
      // Render the "grades" EJS view, passing the "grade" data
      res.render('grades', { grades });
    })
    .catch((error) => {
      console.error('Error fetching grades:', error.message);
      res.status(500).send('Error fetching grades: ' + error.message);
    });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
