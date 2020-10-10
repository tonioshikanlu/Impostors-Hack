// import axios from "axios";
var axios = require("axios");
var express = require("express");
var unirest = require("unirest");
var router = express.Router();
const { Client } = require("@googlemaps/google-maps-services-js");

const client = new Client({});

/* GET home page. */
router.get("/", (req, res, next) => {
	res.send({ a: "b" });
});
/* GET Food carbon footprint score. */
router.get("/convertImage", function (req, res, next) {
	const { image } = req.query;
	var req = unirest("POST", "https://microsoft-computer-vision3.p.rapidapi.com/tag");

	req.query({
		"language": "en"
	});

	req.headers({
		"x-rapidapi-host": "microsoft-computer-vision3.p.rapidapi.com",
		"x-rapidapi-key": "c6747c3e79msh7a29b84d7d64199p105efdjsnd26af7a67b01",
		"content-type": "application/json",
		"accept": "application/json",
		"useQueryString": true
	});

	req.type("json");
	req.send({
		"url": `${image}`
	});
	req.end(function (response) {
		if (response.error) throw new Error(response.error);
		
		var image_details_classes = response.body;
		var image_details = image_details_classes["tags"]
		var food_dict = {
			"pork": 1612,
			"poultry": 2122,
			"beef": 1212,
			"lamb": 260,
			"goat": 260,
			"fish": 1729,
			"eggs": 816,
			"milk": 1277,
			"cheese": 1277,
			"wheat": 7155,
			"rice": 2938,
			"soybeans": 86,
			"nuts": 414,
			"fries": 122,
			"potato": 101,
			"oatmeal": 131,
			"animal": 500,
			"food": 300,
			"plant": 250,
			"bread": 400,
			"cereal": 1000,
			"fruit": 230
		}
		var top_five_image_names = []
		var top_five_image_carbon = 0
		for (i = 0; i < 5; i++) {
		  if (image_details[i]["name"].toLowerCase() in food_dict) {
		  	top_five_image_carbon = top_five_image_carbon + food_dict[image_details[i]["name"]];
		    top_five_image_names.push(image_details[i]["name"])
		  } else {
		  	top_five_image_carbon = top_five_image_carbon + 15;
		  	top_five_image_names.push(image_details[i]["name"])
		  }
		 
		}
		
		var returnJson = {"Names":top_five_image_names,"Carbon_footprint":top_five_image_carbon/5}
		res.json(returnJson);

	});

});

router.get("/getPaths", async (req, res, next) => {
	const { origin, destination } = req.query;
	// res.send({});
	var driving_time,
		rail_time,
		flight_time,
		distance,
		distance_val,
		origin_ad,
		destination_ad;

	// Examples of origin = "Boston,MA" or "Concord,MA"
	const API_KEY = "AIzaSyA7ly7P0GNHtWO-wfAR5DWrsE8qDyb_OgA";
	var url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin}&destinations=${destination}&key=${API_KEY}`;
	await axios.get(url).then(({ data }) => {
		driving_time = data.rows[0].elements[0].duration.text;
		origin_ad = data.origin_addresses[0];
		destination_ad = data.destination_addresses[0];
		distance = data.rows[0].elements[0].distance.text;
		distance_val = data.rows[0].elements[0].distance.value;
	});

	url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin}&destinations=${destination}&transmit_mode=rail&key=${API_KEY}`;
	await axios.get(url).then(({ data }) => {
		console.log(data);
		rail_time = data.rows[0].elements[0].duration.text;
	});

	const mtomilesConv = 1609.344;
	var avg_speed = 500; // mph
	flight_time = Number((distance_val / mtomilesConv / avg_speed).toFixed(1));
	flight_time_str = `${flight_time} hours`;

	const returnVal = {
		distance: distance,
		destination: destination_ad,
		origin: origin_ad,
		driving_time: driving_time,
		rail_time: rail_time,
		flight_time: flight_time_str,
	};

	res.json(returnVal);
});

module.exports = router;



