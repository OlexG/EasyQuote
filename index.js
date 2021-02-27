const http = require('http');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
var Crawler = require("crawler");
const Cite = require('citation-js')
const normalize = require('normalize-text')
var crawler = new Crawler()
const server = http.createServer(app);
const clientPath = `${__dirname}/client`;
const search = require('google-it')

app.use(express.static(clientPath));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function getLink(quote){
	const response = await search({
		'query': quote,
		'limit': 50
	});
	let new_quote = normalize.normalizeText(quote);
	//check each website and scan for the needed quote
	for (var x = 0; x < response.length; x++){
		let link = response[x].link;
		var crawler_promise = await (new Promise((resolve,reject)=>{
			crawler.direct({
				uri: link,
				skipEventRequest: false, // default to true, direct requests won't trigger Event:'request'
				callback: function(error, res) {
					if(error) {
						console.log(error)
					} else {
						var $ = res.$;
						let all_text = normalize.normalizeText($("body").text());
						if (all_text.includes(new_quote)){
							resolve({url:link, title:$("title").text()});
						}
						else{
							resolve({url:"invalid", title:"invalid"});
						}
					}
				}
			});
		}))
		if (crawler_promise !== "invalid"){
			return crawler_promise;
		}
	}
	return {url:"invalid", title:"invalid"};
}

function isInside(arr, obj){
	for (let x = 0; x < arr.length; x++){
		if (arr[x].url === obj.url){
			return true;
		}
	}
	return false;
}

//get the list of quotes from the client
app.post('/get_links', async (req, res) => {
	let results = []
	for (let x = 0; x < req.body.length; x++){
		let link = await getLink(req.body[x])
		if (link.url !== "invalid" && !isInside(results, link)){
			results.push(link)
		}
	}
	
	res.end(JSON.stringify(results));
});



server.listen(9191, () =>{
	console.log(`Server started on ${9191}`);
});
