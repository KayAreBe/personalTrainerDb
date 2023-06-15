const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'users',
  password: 'Letsdoit!',
  port: 5433,
})

const getUsers = (request, response) => {
    pool.query('SELECT * FROM Persons ORDER BY id ASC', (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows)
    })
}

const getAdmin = (request, response) => {
  pool.query('SELECT * FROM admin ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows)
  })
}

const getUserById = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('SELECT * FROM Persons WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
}

const createUser = async (request, response) => {
    const { first_name, last_name, email, mobile, weight, height, bmi, bmi_result, gender, require_trainer, important, have_gym_before, package, enquiry_date} = request.body

    

     // Hash the password
    //  const hashedPassword = await bcrypt.hash(password, 10);
  
    pool.query('INSERT INTO Persons (first_name, last_name, email, mobile, weight, height, bmi, bmi_result, gender, require_trainer, important, have_gym_before, package, enquiry_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *', [first_name, last_name, email, mobile, weight, height, bmi, bmi_result, gender, require_trainer, important, have_gym_before, package, enquiry_date], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(`User added with ID: ${results.rows[0].id}`)
    })
}

const createAdmin = (request, response) => {
  const { username, email, password } = request.body

  pool.query('INSERT INTO admin (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, password], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Admin added with ID: ${results.rows[0].id}`)
  })
}

const updateUser = (request, response) => {
    const id = parseInt(request.params.id)
    const {first_name, last_name, email, mobile, weight, height, bmi, bmi_result, gender, require_trainer, important, have_gym_before, package, enquiry_date} = request.body
  
    pool.query(
      'UPDATE Persons SET first_name = $1, last_name = $2, email = $3, mobile = $4, weight = $5, height = $6, bmi = $7, bmi_result = $8, gender = $9, require_trainer $10, important = $11, have_gym_before = $12, package = $13, enquiry_date = $14 WHERE id = $15',
      [first_name, last_name, email, mobile, weight, height, bmi, bmi_result, gender, require_trainer, important, have_gym_before, package, enquiry_date, id],
      (error, results) => {
        if (error) {
          throw error
        }
        response.status(200).send(`Person modified with ID: ${id}`)
      }
    )
}

const updateAdmin = (request, response) => {
  const id = parseInt(request.params.id)
  const { username, email, password} = request.body

  pool.query(
    'UPDATE admin SET username = $1, email = $2, password = $3 WHERE id = $4',
    [username, email, password, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

const deleteUser = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User deleted with ID: ${id}`)
    })
}

const deleteAdmin = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM admin WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Admin deleted with ID: ${id}`)
  })
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by username in the database
    const query = 'SELECT * FROM admin WHERE email = $1';
    const values = [email];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Authentication failed' });
      return;
    }

    // Verify the password
    const admin = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Authentication failed' });
      return;
    }

    // Generate a JWT token
    const token = jwt.sign({ adminId: admin.id }, 'your_secret_key');

    // Return the token to the client
    res.json({ token });
    if(token){
      console.log('Admin logged in');
    }
  } catch (error) {
    console.error('Error creating token:', error);
    res.status(500).json({ error: 'Error creating token' });
  }
}

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAdmin,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    login
}