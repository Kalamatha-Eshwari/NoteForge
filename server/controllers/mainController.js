exports.homepage = async (req, res) => {
    const locals = {
        title: "NodeJs Notes",  // Ensure title is set here
        description: "Free NodeJS Notes App."
    };
    
    // Spread locals to make sure title and description are passed properly
    res.render('index', {
        locals,
        layout: '../views/layouts/font-page'  // Make sure layout is set correctly
    });
};


exports.about = async (req, res) => {
    const locals = {
        title: "NodeJs About Notes",
        description: "Free NodeJS Notes App."
    };
    res.render('about', locals);  // Render about.ejs with locals
};

