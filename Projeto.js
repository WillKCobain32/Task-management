let data = {
    quadros:[]

};

function init(){
     loadlFromLocalStorage();
    if(data.quadros.length === 0){

        addQuadro("A fazer");

    } else{

        render();

    }

}

function salvarLocalStorage(){
    localStorage.setItem("ProjetoWeb", JSON.stringify(data));

}

function loadlFromLocalStorage(){

    const stored = localStorage.getItem("ProjetoWeb");
    if(stored){
        data = JSON.parse(stored);
    }

}

function render(){

    const container = document.getElementById('BoardContainer');
    container.innerHTML = '';

    data.quadros.forEach(quadro => {

        const quadroEL = document.createElement('div');
        quadroEL.className = 'quadro';

        quadroEL.setAttribute('ondragover', 'allowDrop(event)');
        quadroEL.setAttribute('onDrop', `drop(event, ${quadro.id})`);

        quadroEL.innerHTML =`
            <div class="board-header">
            <input type="text" class="quadro-title-input" value="${quadro.title}"  onblur="updateBoardTitle(${quadro.id}, this.value)">
            <button class="btn-danger" onclick="deleteBoard(${quadro.id})">Excluir</button> 
            </div>
                <div class="cards-list" id="board-${quadro.id}">
                    </div>
                <div class="add-card-container">
                    <button class="btn-add-card" onclick="addCard(${quadro.id})"> Adicionar </button>    
                </div>      
    `;

        const listaEL = quadroEL.querySelector('.cards-list');

        
        quadro.cards.forEach(cartao =>{
            const cartaoEL = document.createElement('div');
            cartaoEL.className = 'cartao';
            cartaoEL.draggable = true;

            cartaoEL.setAttribute('ondragstart', `drag(event, ${quadro.id}, ${cartao.id})`);

            cartaoEL.innerHTML = `
                <div class="card-content" contenteditable="true" onblur="updateCardContent(${quadro.id}, ${cartao.id}, this.innerText)">${cartao.content}</div> 
                <button class="btn-danger"  onclick="deleteCard(${quadro.id}, ${cartao.id})" style="padding: 2px 6px;">&times;</button>
                `;

            listaEL.appendChild(cartaoEL);
            

        });

        container.appendChild(quadroEL);

    });

}

function addQuadro(title){
    const novoQuadro = {
        id: Date.now(),
        title: title,
        cards: []

    };
    data.quadros.push(novoQuadro);
    saveAndRender();

}

function deleteBoard(quadroId){
    if(confirm("tem certeza que deseja excluir esse quadro?")) {
        data.quadros = data.quadros.filter (b => b.id !== quadroId);
        saveAndRender();
    }

}

function updateBoardTitle(quadroId, novoTitulo){
    const quadro = data.quadros.find(b => b.id === quadroId);
    if(quadro){
        quadro.title = novoTitulo;
        salvarLocalStorage();

    }
}

function addCard(quadroId){
    const quadro = data.quadros.find(b => b.id === quadroId);
    if(quadro){
        quadro.cards.push({
            id: Date.now(),
            content: "Nova Tarefa"

        });
        saveAndRender();

    }
}

function deleteCard(quadroId, cartaoId){
    const quadro = data.quadros.find(b => b.id === quadroId);
    if(quadro){
        quadro.cards = quadro.cards.filter(c => c.id !== cartaoId);
        saveAndRender();

    }

}

function updateCardContent(quadroId, cartaoId, newContent){
    const quadro = data.quadros.find(b => b.id === quadroId);
    if(quadro) {
        const cartao = quadro.cards.find(c => c.id === cartaoId);
        if(cartao){
        cartao.content = newContent;
        salvarLocalStorage();
    
     }

    }
}


let draggedCartaoId = null;
let sourceQuadroId = null;

function drag(event, quadroId, cartaoId){

    draggedCartaoId = cartaoId;
    sourceQuadroId = quadroId;

    event.dataTransfer.effectAllowed = "move";

}

function allowDrop(event){
    event.preventDefault();


}

function drop(event, targetQuadroId){

    event.preventDefault();

    if(sourceQuadroId === targetQuadroId) 
        return;


    const sourceQuadro = data.quadros.find(b => b.id === sourceQuadroId);
    const targetQuadro = data.quadros.find(b => b.id === targetQuadroId);

    const cartaoIndex = sourceQuadro.cards.findIndex(c => c.id === draggedCartaoId);
    if(cartaoIndex > -1){

        const [movedCartao] = sourceQuadro.cards.splice(cartaoIndex, 1);

        targetQuadro.cards.push(movedCartao);

        saveAndRender();


    }


}

function exportarData(){
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "projetoWeb.json";
    a.click();

    URL.revokeObjectURL(url);


}

function importarData(inputElement){
    const file = inputElement.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = function(e){
        try{
        const json = JSON.parse(e.target.result);
        if(json.quadros && Array.isArray(json.quadros)){
        data = json;
        saveAndRender();
        alert("Importacao realizada com sucesso");
    }
    else{
        alert("Formato de aquivo invalido");

    }
    } catch (error){
        alert("Erro ao ler o arquivo");
    }
    inputElement.value = '';
};

    reader.readAsText(file);

}

function saveAndRender(){
    salvarLocalStorage();
    render();
}

init();