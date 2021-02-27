function parseText(text){
	let quotes = [];
	let parsing_quote = false;
	let cur_quote = "";
	for (let x = 0; x < text.length; x++){
		if (text[x] == '"'){
			if (parsing_quote){
				parsing_quote = false;
				quotes.push(cur_quote);
				cur_quote = "";
			}
			else{
				parsing_quote = true;
			}
		}
		else{
			if (parsing_quote){
				cur_quote += text[x];
			}
		}
	}
	return quotes;
}

function makeCitation(text){
	var node = document.createElement("blockquote");
	var textnode = document.createTextNode("P");
	textnode.textContent = text;
	node.appendChild(textnode);
	return node
}
document.getElementById("cite_button").onclick = async function(){
	let text = document.getElementById("input_field").textContent;
	let quotes = parseText(text)
	let links = await fetch('/get_links', {
		method: 'POST', 
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify(quotes),
	}).then((res) => res.json()).then(result => {
		document.getElementById("side_menu").innerHTML = "";
		for (let x = 0; x < result.length; x++){
			var curnode = makeCitation(`${result[x].title} - ${result[x].url}`);
			console.log(curnode)
			document.getElementById("side_menu").appendChild(curnode);
		}
	})
}