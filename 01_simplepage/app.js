/*
* Module dependencies
*/

var express = require('express')
	, stylus = require('stylus')
	, nib = require('nib')

var app = express()

function compile(str, path){
	return stylus(str)
		.set('filename', path)
		.use(nib());
}

//We are using jade and saving it in the views directory
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

app.use(express.logger('dev'))
//stylus middleware to compule .styl to css
app.use(stylus.middleware(
	{
		src: __dirname + '/public'
		, compile: compile
	}		
	))
//where static files will, live
app.use(express.static(__dirname + '/public'))
//Create a route, function that sends string
/*app.get('/', function(req, res){
	res.end('Hello there')

})*/

app.get('/', function (req, res) {
  res.render('index',
  { title : 'Home' }
  )
})
//listen on port 3000
app.listen(3000)









