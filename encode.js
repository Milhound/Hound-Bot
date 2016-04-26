var fs = require('fs');
var image = 'img/Blue-Wolf.jpg';
var imageData = fs.readFile(image, 'base64', (err, data) => {
    if (err) throw err;
    fs.writeFile('img/Blue-Wolf.txt', data, 'utf8',  (err) => {
        if (err) throw err;
        console.log('Saved to file.');
    });
});
