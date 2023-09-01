/*
{
	columns: [
		{
			name: "",
			cards: [
				{
					title: ""
					content: ""
					isDone: false
				}
			]
		}
	]
}
*/

// Set up default data & its backup
// trelloData with some default data will be useful if no saved data exists in the browser,
// backupTrelloData will be useful if we want to remove our saved data and start over
let trelloData, backupTrelloData = {
	columns: [
		{
			name:"To-Do",
			cards: [
				{
					title: "Example card",
					content: "Drag this around to other columns! You may need to make another column first though.",
					timestamp: null
				}
			]
		}
	]
}

// Add an event listener to the "Create a column" form,
document.getElementById("columnForm").addEventListener('submit', (event) => {

	// It's a form, so don't let it actually reload the page.
	event.preventDefault();

	// Nifty syntax for accessing the input fields inside the form:
	let form = event.target;
	let formFields = form.elements;
	let columnNameInput = formFields.columnTitle.value;

	// Check if any columns already have that name, as that will break the card logic 
	// for moving a card from one column to another 
	if (trelloData.columns.filter(column => column.name == columnNameInput).length > 0){
		alert("Cannot make a column with a name that another column already has!")
	} else {
		trelloData.columns.push({
			name: columnNameInput,
			cards: []
		});
		renderColumns();
	}


});

// Uses trelloData and DOM functions to generate cards and columns
function renderColumns(){
	// Find our data row, which should be separate from the row of card & column forms
	let trelloColumnRootNode = document.getElementById("dataDisplayRow");
	// Wipe out all columns & cards, as that is "stale"
	// Stale meaning that we have newer, fresher data to work with
	trelloColumnRootNode.innerHTML = "";

	// For every column, generate a column in the DOM
	trelloData.columns.forEach((column) => {

		// Create our starting, root node of the column.
		let columnNode = document.createElement("div");

		// Give it a class for CSS to apply to it
		columnNode.classList.add("trelloColumn");

		// Give it events so we can drag & drop
		columnNode.addEventListener("dragover", allowDrop);
		columnNode.addEventListener("drop", dropCard);

		// Give it its heading/title content
		let columnHeading = document.createElement("h3");
		columnHeading.innerText = column.name;
		columnNode.appendChild(columnHeading);

		// And set an ID for easy modifications if we need it:
		columnNode.id = column.name;

		// Generate cards for each column too
		column.cards.forEach((card) => {
			// We don't have to make every DOM element from scratch,
			// we can clone the preview card and modify it! 
			let newCard = document.getElementById("cardPreview").cloneNode(true);

			// In this project, we're using timestamps (milliseconds) as IDs.
			// It's not realistic for a professional project, but it's a simple way
			// to "guarantee" that the cards will have unique identifiers from each other.
			if (!card.timestamp || isNaN(card.timestamp)) {
				card.timestamp = Date.now();
			}

			// When troubleshooting any errors, use console.log() to see what data is available
			// and also see how far your code got!
			// I needed this when troubleshooting some drag & drop functionality, 
			// when a dragged card was draggable into a column but not moving across to its new column 😅
			// console.log("Creating card:" + JSON.stringify(card));

			// Update the cloned card DOM element with the card data
			newCard.querySelector(".cardDisplay-title").innerText = card.title;
			newCard.querySelector(".cardDisplay-content").innerText = card.content;
			newCard.id = card.timestamp;

			// Give it an event listener so we can drag it
			newCard.addEventListener("dragstart", drag);

			// Add the card to the column
			columnNode.appendChild(newCard);
		})

		// Put the column (and its child-cards) into the DOM!
		trelloColumnRootNode.appendChild(columnNode);
	})

	// When the loop through columns is complete, all data should be in the DOM and ready to view!
}

// When we drag a DOM element around,
// it can be handy to tell the browser what exactly we're dragging.
function drag(event) {
	event.dataTransfer.setData("text", event.target.id);
	// console.log("Card event data transfer when dragging is: \n" + event.target.id);
}

// The intended way to make new cards in this project is to drag the preview card out
// and into a column, any column.
document.getElementById("cardPreview").addEventListener("dragstart", drag);

// Most HTML elements do not allow dragging.
// Disabling default behaviour allows dragging.
// You'll know if this is working if a draggable element is over an allowed drop zone, 
// because the mouse cursor will change.
function allowDrop(event){
	event.preventDefault();
}

// Logic for when an element is dropped into an element that allows dropping!
function dropCard(event){
	event.preventDefault();

	// Read what data was set, this can help us find and read the dragged element's content
	let data = event.dataTransfer.getData("text");

	// Another troubleshooting log; a couple of things could cause `data` to break:
	//		- the drag event not being attached to a card
	//		- the drag event not reading the ID of a card successfully
	//		- the event on drag or on drop being attached to the wrong element
	// ...and many more.
	// console.log("data id:" + data);

	// Find the element in the DOM tree that was just dropped onto this column:
	let oldCard = document.getElementById(data);

	// Retrieve card data from old card DOM element
	let oldCardData = {
		title: oldCard.getElementsByClassName("cardDisplay-title")[0].innerText,
		content: oldCard.getElementsByClassName("cardDisplay-content")[0].innerText,
		timestamp: oldCard.id
	}

	// Another troubleshooting log -- my original default trelloData data
	// had an incorrect title property or title class name at some point, compared to the card preview element.
	// So the app broke when I dragged the Example Card to a new column, but worked when I made new cards. Fun.
	// console.log("Old card data:" + JSON.stringify(oldCardData));

	// In most drag & drop tutorials, they just focus on dropping data on to the event element. That's fine.
	// But we're not doing that here - we are modifying trelloData instead, and re-rendering the columns
	// when data is modified.
	// It's not as simple, but it means we can do things like save our columns & cards to browser storage.
	trelloData.columns.forEach(column => {
		// Remove all cards that have the same ID/timestamp as the dropped card.
		column.cards = column.cards.filter(card => card.timestamp != oldCardData.timestamp);
		// If we didn't do the above filter, then dragging a card from one column
		// to another would duplicate it.
		// Could be fun to turn into a feature.

		// If the column that we're checking in this iteration of the loop 
		// is the one that we dragged & dropped the card into,
		// add the card to it
		if (column.name == event.target.id){
			column.cards.push(oldCardData);
		}
	})

	// Re-render the columns
	renderColumns();
}

// We could try making things more D.R.Y with functions, but eh.
// function addCardToColumnData(cardData, columnName){
// 	let targetColumn = trelloData.columns.filter(column => column.name == columnName)[0];
// 	targetColumn.cards.push(cardData);
// 	renderColumns();
// }


// Check localStorage.trelloData for any existing data.
function loadData(){
	// Retrieve the stored data.
	// This returns null if no data is available.
	let dataRetrieved = localStorage.getItem("trelloData");

	// If data is found, we must convert it from a JSON string
	// into an object.
	if (dataRetrieved){
		trelloData = JSON.parse(dataRetrieved);
		// And of course, re-render when the trelloData variable changes.
		renderColumns();
		console.log("Data loaded!");
	} else {
		trelloData = backupTrelloData;
		console.log("Data not found. Was anything saved previously?");
	}

}

// Convert trelloData to a string - a JSON string - 
// and save that string into browser storage.
function saveData(){
	let dataStringified = JSON.stringify(trelloData);
	localStorage.setItem("trelloData", dataStringified);
	alert("Data saved to local storage!");
}

// Keyboard controls to save, load and reset the trello data!!
// We need a "flag" to help us when we want to use multiple keys for once action.
let isCtrl = false;
document.addEventListener("keydown", (event) => {

	// If flag key is pressed, set flag value to true
	// event.key reference is here:
	// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values#modifier_keys
	if (event.key == "Control"){
		event.preventDefault();
		isCtrl = true;
	}

	// General keyboard keys should be pressed AT THE SAME TIME as the flag key
	// So the if statement directly below represents CTRL + S
	// event.code reference is here:
	// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values
	if (event.code == "KeyS" && isCtrl){
		// Don't let the browser run on CTRL + S, as that will save the HTML page to the computer
		event.preventDefault();

		saveData();
	}

	// Change the KeyL to whatever you want, I just figured that 
	// CTRL + L = Load
	if (event.code == "KeyL" && isCtrl){
		event.preventDefault();

		loadData();
	}

	// Same here -- CTRL + D for delete
	if (event.code == "KeyD" && isCtrl){
		event.preventDefault();

		// Note the logic for resetting the data -- 
		// we just assign the backup data to the trelloData variable.
		// Probably best to do a deep clone since it's an object but eh.
		trelloData = backupTrelloData;

		// Re-render the screen when trelloData is modified, as usual.
		renderColumns();

		// Save our changes, too.
		saveData();
	}
})

// Since keydown runs and re-runs for as long as that key is held down,
// this will only really run if we let go of all held-down keys.
// It just resets the flag, so we don't accidentally trigger some CTRL function.
document.addEventListener("keyup", (event) => {
	event.preventDefault();
	isCtrl = false;
})

// When the code loads - and ideally, after the HTML is available - 
// we want to check for any existing saved data and load it up.
loadData();


// I literally left this til last for some reason, woops!
// Our card form will apply its data to the card preview,
// and then we can drag the card preview into columns to create new cards.
document.getElementById("cardForm").addEventListener('submit', (event) => {
	
	// As usual, don't let forms submit the old-fashioned way.
	event.preventDefault();

	// Access the form with the nicer syntax:
	let form = event.target;
	let formFields = form.elements;

	// Get our data -- and yes, this could be done in fewer lines,
	// but having explicit variables can help when you need to troubleshoot things.
	// I'm a big fan of console.log(someVariable);
	let cardNameInput = formFields.cardTitle.value;
	let cardContentInput = formFields.cardContent.value;

	// Find the card preview and its relevant sub-elements
	let cardPreviewRoot = document.getElementById("cardPreview");
	let cardPreviewName = cardPreviewRoot.getElementsByClassName("cardDisplay-title")[0];
	let cardPreviewContent = cardPreviewRoot.getElementsByClassName("cardDisplay-content")[0];
	
	// Apply the card form data to the card preview elements.
	cardPreviewName.innerText = cardNameInput;
	cardPreviewContent.innerText = cardContentInput;


});