//
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
let trelloData = {
	columns: [
		{
			name:"To-Do List",
			cards: [
				{
					title: "Example card",
					content: "Drag this around to other columns! You may need to make another column first though.",
					isDone: false
				}
			]
		}
	]
}

document.getElementById("columnForm").addEventListener('submit', (event) => {
	event.preventDefault();

	let form = event.target;
	let formFields = form.elements;

	let columnNameInput = formFields.columnTitle.value;

	trelloData.columns.push({
		name: columnNameInput,
		cards: []
	});
	renderColumns();
});

function renderColumns(){
	let trelloColumnRootNode = document.getElementById("dataDisplayRow");
	trelloColumnRootNode.innerHTML = "";

	trelloData.columns.forEach((column) => {
		let columnNode = document.createElement("div");
		columnNode.classList.add("trelloColumn");
		columnNode.addEventListener("dragover", allowDrop);
		columnNode.addEventListener("drop", dropCard);

		let columnHeading = document.createElement("h3");
		columnHeading.innerText = column.name;
		columnNode.appendChild(columnHeading);

		column.cards.forEach(card => {
			let newCard = document.getElementById("cardPreview").cloneNode(true);
			newCard.querySelector(".cardDisplay-title").innerText = card.title;
			newCard.querySelector(".cardDisplay-content").innerText = card.content;
			columnNode.appendChild(newCard);
		})

		columnNode.id = column.name;

		trelloColumnRootNode.appendChild(columnNode);
	})
}

function drag(event) {
	event.dataTransfer.setData("text", event.target.id);
	console.log("Card event data transfer when dragging is: \n" + event.target.id);
}

document.getElementById("cardPreview").addEventListener("dragstart", drag);

function allowDrop(event){
	event.preventDefault();
}

function dropCard(event){
	event.preventDefault();
	let data = event.dataTransfer.getData("text");

	let oldCard = document.getElementById(data);

	// pull out card data from old card DOM element, add to new column
	let oldCardData = {
		name: oldCard.getElementsByClassName
	}

	// find matching old card by ID in all columns, remove it
	
	
	// re-render the columns
	renderColumns();
}

function addCardToColumnData(cardData, columnName){
	let targetColumn = trelloData.columns.filter(column => column.name == columnName)[0];
	targetColumn.cards.push(cardData);

	renderColumns();
}