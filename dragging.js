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

		let columnData = trelloData.columns.filter(column => column.name == event.target.id)[0];
		columnData.cards.forEach(card => {
			// TODO
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
	if (data == "cardPreview") {
		// If card was dragged from the preview area, clone it
		// and assign it a unique ID
		let previewCardClone = document.getElementById(data).cloneNode(true);
		previewCardClone.addEventListener("dragstart", drag);
		
		let columnData = trelloData.columns.filter(column => column.name == event.target.id)[0];
		console.log(columnData);

		previewCardClone.id = `${columnNameWithCardCount.name}-${columnNameWithCardCount.cards.length}`;

		event.target.appendChild(previewCardClone);


	} else {
		let cardDragged = document.getElementById(data);
		event.target.appendChild(cardDragged);
	}
	
	
}