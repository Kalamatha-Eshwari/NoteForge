const Note = require('../models/Notes');
const mongoose = require('mongoose');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadPath = path.join(__dirname, 'uploads');

const { v4: uuidv4 } = require('uuid');

const userId = new mongoose.Types.ObjectId();
//console.log(userId);

exports.dashboard = async (req, res) => {
    
    let perpage=8;
    let page = parseInt(req.query.page) || 1; 
    
    const locals = {
        title: "DashBoard",  // Ensure title is set here
        description: "Free NodeJS Notes App.",
    };

    try{
        const notes = await Note.find({})
            .skip(perpage * (page - 1))  // Skip the notes already displayed
            .limit(perpage);  // Limit to perPage notes per request

        // Count the total number of notes
        const count = await Note.countDocuments();
        


 
        res.render('dashboard/index', {
          ...locals,
          notes, 
          layout: '../views/layouts/dashboard',
          current: page,
          pages: Math.ceil(count / perpage), //  // Make sure layout is set correctly
      });

} catch (error){
console.error(error);
res.status(500).send('Something went wrong!');
}

};

/**
 * GET /
 * View Specific Note
 * */
 
 
exports.dashboardViewNote = async (req, res) => {
  try {
      const note = await Note.findById(req.params.id).lean();

      if (note) {
          // Pass 'title' along with other variables
          res.render("dashboard/view-note", {
              noteID: req.params.id,
              note,
              title: "View Note",  // Set the title here
              layout: "../views/layouts/dashboard",
              
          });
      } else {
          res.status(404).send("Note not found.");
      }
  } catch (error) {
      console.error(error);
      res.status(500).send("Error occurred.");
  }
};
  
  /**
   * PUT /
   * Update Specific Note
   */
  exports.dashboardUpdateNote = async (req, res) => {
    try {
      await Note.findOneAndUpdate(
        { _id: req.params.id },
        { title: req.body.title, body: req.body.body, updatedAt: Date.now() }
      );
      res.redirect("/dashboard");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error occurred while updating the note.");
    }
  };
  
  
  /**
   * DELETE /
   * Delete Note
   */

exports.dashboardDeleteNote = async (req, res) => {
    try {
        const { id } = req.params;  // Get the ID from the request parameters
        
        // Find and delete the note by its ID
        await Note.findByIdAndDelete(id);
        
        // Redirect to the dashboard after deletion
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting note');
    }
};



  

  
  /**
   * GET /
   * Add Notes
   */
  exports.dashboardAddNote = async (req, res) => {
    res.render("dashboard/add", {
        layout: "../views/layouts/dashboard",
        title: "Add New Note",  // Pass title to the layout
    });
};

  
  /**
   * POST /
   * Add Notes
   
  exports.dashboardAddNoteSubmit = async (req, res) => {
    try {
        // Generate a random user ID (for testing purposes)
       // const randomUserId = uuidv4();  // Creates a unique user ID (for testing)

        await Note.create({
          title: req.body.title,
          body: req.body.body,
          createdAt: new Date(),
          user: userId, 
        });

        res.redirect("/dashboard");  // Redirect to the dashboard after adding the note
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong!');
    }
};
  */

exports.dashboardSearch = async (req, res) => {
  try {
    res.render("dashboard/search", {
      searchResults: "",
      title: "Search Dashboard", // Add the title here
      layout: "../views/layouts/dashboard",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred during search page rendering.");
  }
};

exports.dashboardSearchSubmit = async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const searchResults = await Note.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChars, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChars, "i") } },
      ],
    });

    res.render("dashboard/search", {
      searchResults,
      title: "Search Results", // Add the title here
      layout: "../views/layouts/dashboard",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred during search.");
  }
};




// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath); // Use the dynamic path
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});


// Filter to ensure only PDFs are uploaded
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only PDF files are allowed'), false); // Reject the file
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Max file size: 10MB
    }
}).single('file'); // Use 'file' as the field name for the uploaded file


// POST / Add Notes (with file upload)

// controllers/dashboardController.js

exports.dashboardAddNoteSubmit = async (req, res) => {
  upload(req, res, async (err) => {
      if (err) {
          // Handle file upload errors (e.g., too large, invalid format)
          return res.status(500).send('Error uploading file');
      }

      try {
          const newNote = await Note.create({
              title: req.body.title,
              body: req.body.body,
              createdAt: new Date(),
              user: userId, 
              file: req.file ? {
                data: fs.readFileSync(req.file.path), // Read the PDF file as binary
                contentType: req.file.mimetype, // Content type of the file (e.g., application/pdf)
              } : null,
          });

          res.redirect("/dashboard");
      } catch (error) {
          console.error(error);
          res.status(500).send('Error saving note');
      }
  });
};


// Serve the PDF file from the uploads directory
exports.dashboardGetFile = async (req, res) => {
  try {
      const note = await Note.findById(req.params.id); // Find the note by its ID
      if (!note || !note.file) {
          return res.status(404).send('File not found');
      }

      res.contentType(note.file.contentType); // Set the content type to PDF
      res.send(note.file.data); // Send the PDF content
  } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching the file');
  }
};