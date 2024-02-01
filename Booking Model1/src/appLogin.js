const express = require('express');
const path = require('path');
const db = require('./dataBase');
const appLogin = express();

appLogin.set('views', path.join(__dirname, 'views')); 
appLogin.set('view engine', 'ejs');
appLogin.use(express.urlencoded({ extended: true }));
appLogin.use(express.static(path.join(__dirname, '..', 'public')));

appLogin.post('/login', (req, res) => {
  const { username, password, role } = req.body;

  let query;
  let redirectPath;

  if (role === 'admin') {
    query = 'SELECT * FROM admins WHERE username = ?';
    redirectPath = '/admin';
  } else if (role === 'mechanic') {
    query = 'SELECT * FROM mechanics WHERE username = ?';
    redirectPath = '/mechanic-home';
  } else {
    res.status(401).send('Invalid role');
    return;
  }

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    if (results.length === 0) {
      res.status(401).send('Invalid username');
      return;
    }

    const user = results[0];
    if (password === user.password) {
      res.redirect(redirectPath);
    } else {
      res.status(401).send('Invalid password');
    }
  });
});

appLogin.get('/mechanic-home', (req, res) => {
  res.render('mechanic-home'); 
});
appLogin.get('/mechanic-orders', (req, res) => {
  const query = 'SELECT * FROM appointments WHERE mechanic_id = 1'; // Replace '?' with the actual mechanic ID

  db.query(query, [1], function(err, orders) {
      if (err) {
          console.error('Database error:', err);
          res.status(500).send('Internal Server Error');
      } else {
          res.render('mechanic-orders', { orders: orders });
      }
  });
});

appLogin.get('/search-appointments', (req, res) => {
  const mechanicId = req.query.mechanic_id;

  const query = 'SELECT * FROM appointments WHERE mechanic_id = ?';
  db.query(query, [mechanicId], (err, orders) => {
      if (err) {
          console.error('Database error:', err);
          res.status(500).send('Internal Server Error');
      } else {
          // Pass the orders to the same 'orders' view
          db.query('SELECT mechanic_id, name FROM mechanic WHERE availability = TRUE', (err, mechanics) => {
              if (err) {
                  console.error('Database error for mechanics:', err);
                  res.status(500).send('Internal Server Error');
              } else {
                  res.render('mechanic-orders', { orders, mechanics });
              }
          });
      }
  });
});

appLogin.get('/', (req, res) => {
  res.render('login'); 
});

appLogin.get('/admin', (req, res) => {
  res.render('admin'); 
});
appLogin.get('/add-mechanic', (req, res) => {
  res.render('addmechanic');
});

appLogin.post('/add-mechanic', (req, res) => {
  const mechanicName = req.body.mechanicName;
  const serviceName = req.body.serviceName;
  const availability = req.body.availability === 'true';
  const insertQuery = 'INSERT INTO mechanic (name, type, availability) VALUES (?, ?, ?)';
  db.query(insertQuery, [mechanicName, serviceName, availability], (err, results) => {
    if (err) {
        console.error('Error occurred while adding mechanic:', err);
        res.status(500).send('Error occurred while adding mechanic');
    } else {
        res.redirect('/mechanic'); 
    }
});
});


appLogin.get('/Service', (req, res) => {
  const query = 'SELECT * FROM services';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving services:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.render('Service', { services: results });
  });
});


appLogin.post('/Service', (req, res) => {
  const serviceName = req.body.serviceName;
  const serviceAvailability = req.body.serviceAvailability === 'true';

  const query = 'INSERT INTO services (service_name, service_availability) VALUES (?, ?)';
  const values = [serviceName, serviceAvailability];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error adding service:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.redirect('/Service'); 
  });
});


appLogin.get('/customers', (req, res) => {
  const query = 'SELECT * FROM customers';
  db.query(query, function(err, customers) {
      if (err) {
          console.error('Database error:', err);
          res.status(500).send('Internal Server Error');
      } else {
          console.log(customers);
          res.render('customers', { customers });
      }
  });
});
appLogin.get('/mechanic', (req, res) => {
  const query = 'SELECT * FROM mechanic';
  db.query(query, function(err, mechanic) {
      if (err) {
          console.error('Database error:', err);
          res.status(500).send('Internal Server Error');
      } else {
          res.render('mechanic', { mechanic });
      }
  });
});

// appLogin.post('/mechanics/drop/:mechanic_id', (req, res) => {
//   const mechanicId = req.params.mechanic_id;

//   // SQL query to delete the mechanic with the given mechanicId
//   const deleteQuery = 'DELETE FROM mechanic WHERE mechanic_id = ?';

//   // Execute the query using a prepared statement
//   db.query(deleteQuery, [mechanicId], (err, result) => {
//       if (err) {
//           // Handle error
//           console.error('Error occurred while deleting mechanic:', err);
//           res.status(500).json({ success: false, error: 'Internal Server Error' });
//       } else {
//           // If the deletion was successful, send a JSON response
//           res.json({ success: true });
//       }
//   });
// });
appLogin.get('/orders', (req, res) => {
  const queryOrders = 'SELECT id, owner_name, appointment_date FROM appointments';
 
  const queryMechanics = 'SELECT mechanic_id, name FROM mechanic WHERE availability = TRUE';


  db.query(queryOrders, function(err, orders) {
      if (err) {
          console.error('Database error for orders:', err);
          res.status(500).send('Internal Server Error');
      } else {
         
          db.query(queryMechanics, function(err, mechanics) {
              if (err) {
                  console.error('Database error for mechanics:', err);
                  res.status(500).send('Internal Server Error');
              } else {
                  // Render the 'orders' template and pass both orders and mechanics
                  res.render('orders', { orders: orders, mechanics: mechanics });
              }
          });
      }
  });
});

appLogin.post('/assign-mechanic', (req, res) => {
  const orderId = req.body.order_id;
  const mechanicId = req.body.mechanic_id;

  // Begin a transaction to ensure both operations complete
  db.beginTransaction(function(err) {
      if (err) { throw err; }

      const updateAppointmentQuery = 'UPDATE appointments SET mechanic_id = ? WHERE id = ?';

      db.query(updateAppointmentQuery, [mechanicId, orderId], function(err, result) {
          if (err) {
              return db.rollback(function() {
                  console.error('Error updating appointment:', err);
                  res.status(500).send('Internal Server Error');
              });
          }

          const updateMechanicAvailabilityQuery = 'UPDATE mechanic SET availability = FALSE WHERE mechanic_id = ?';

          db.query(updateMechanicAvailabilityQuery, [mechanicId], function(err, result) {
              if (err) {
                  return db.rollback(function() {
                      console.error('Error updating mechanic availability:', err);
                      res.status(500).send('Internal Server Error');
                  });
              }

              db.commit(function(err) {
                  if (err) {
                      return db.rollback(function() {
                          console.error('Error committing transaction:', err);
                          res.status(500).send('Internal Server Error');
                      });
                  }
                  console.log('Successfully assigned mechanic and updated availability.');
                  res.redirect('/orders');
              });
          });
      });
  });
});

appLogin.listen(3001, () => {
  console.log('Login server running at http://localhost:3001');
});