var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var dv = require('ndv');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function (req, res) {

	// create an incoming form object
	var form = new formidable.IncomingForm();
	var data = "";
	// specify that we want to allow the user to upload multiple files in a single request
	form.multiples = true;

	// store all uploads in the /uploads directory
	form.uploadDir = path.join(__dirname, '/uploads');

	// every time a file has been uploaded successfully,
	// rename it to it's orignal name
	form.on('file', function (field, file) {
		fs.rename(file.path, path.join(form.uploadDir, file.name));
		// console.log(file);
		var ftype = file.type;
		var img = ftype.substring(ftype.length - 3);
		if(img != "png" && img != "pdf"){
			img = "jpg";
		}
		if(ftype == "application/pdf"){
			// console.log("1");
			// require('pdf-to-png')({
			// 	input: file.path,
			// 	output: path.join(__dirname, '/uploads') + 'FinalTest12345.png'
			// });
		}else{
			var image = new dv.Image(img , fs.readFileSync(path.join(form.uploadDir, file.name)));
			var tesseract = new dv.Tesseract('eng', image);
			data = tesseract.findText('plain');
		}
	});

	// log any errors that occur
	form.on('error', function (err) {
		console.log('An error has occured: \n' + err);
	});

	// once all the files have been uploaded, send a response to the client
	form.on('end', function () {
		var array1 = data.split("\n");
		var output = "";
		var numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
		for(i=0; i<array1.length; i++){
			var str = array1[i].trim();
			var counter =1; 
			var check= 0;
			for(j = 0; j< str.length ; j++){
				console.log(str , counter , check , str[j], numbers.indexOf(str[j]))
				if(numbers.indexOf(str[j]) >= 0){
					if(counter == 5){
						break;
					}
					check++;
					if(check == 14){
						output = str.substring(0,14);
					}
					counter++;
				}else if(counter == 5){
					counter = 1;
					check++;
				}
				else{
					break;
				}
			}
		}
		console.log(array1);
		res.end(output);
	});

	// parse the incoming request containing the form data
	form.parse(req);

});

var server = app.listen(3000, function () {
	console.log('Server listening on port 3000');
});
