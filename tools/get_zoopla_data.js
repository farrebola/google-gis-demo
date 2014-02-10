var http = require("http-request");
var fs = require("fs");
var parser = require('xml2json');
var ent = require('ent'); 

header = null;
rows = [];
max_requests = 20;
excluded_columns = ["description"];

function loadPage (num) {
	http.get(
	"http://api.zoopla.co.uk/api/v1/property_listings.xml?area=london&page_size=100&api_key=6sjqhfkfn9enb6b5tjcpu975&page_number="+num,
	function(err, response){
		if(err) {
			console.log("Error retrieving data!");
			console.log(err);

			loadPage(num);''
			return;
		}
		console.log("data retrieved for page "+num);
		var json = parser.toJson(response.buffer.toString(), {object: true});
		var results = json.response.listing;
		console.log(results.length);	
		// We build the header.
		var row;
		if(!header) {
			// We didn't add a header yet.
			header = [];
			for(var h in results[0]) {
				if(excluded_columns.indexOf(h)==-1){
					header.push(h);	
				}
			}
			rows.push(header.join(";"));
		}
		for(var i=0; i<results.length; i++) {
			row = [];
			var result = results[i];		
			console.log(result);
			console.log(rows[0]);
			// We get the values as per the header	
			for(var j=0; j < header.length; j++) {
				var value = result[header[j]];
				if(value===null) {
					value="";
				}
				if(typeof value == "string"){
					while(value != ent.decode(value)){
						value = ent.decode(value);
					}
					value = value.replace(/;/g, ",");
				}
				row.push(value);
			}
			var a = row.join(";");
			console.log(a);
			rows.push(a);	
		}

		if(num == max_requests) {			
			// We've got all the requests we want.

			fs.writeFile("results/london_houses.csv", rows.join("\n"), function(err) {
				if(err) {
					console.log("error saving csv file: "+ err);
					return;
				}
				console.log("csv file saving success!");
		
			});
		} else {

			// Recursion to retrieve next page.
			setTimeout(function() {
				loadPage(num+1);
			}, 100);
		}

		
	});
	
}

loadPage(1);


