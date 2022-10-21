/*
Para usar este modulo, utilize:
 getConfiguracoes() : Retorna um dicionario com as configuracoes do programa
 
 __saveConfigs() : Salva as configuracoes do programa


 Caso seja necessario adicionar novas configuracoes, adicione nos dois dicionarios abaixo (__configsDefault e __configs)
*/

var numeroTestes = 0;

var __configsDefault = {
	"ordemBateria": ["I","F"],
	"perguntas": 6,
	"perguntasPre": 6,
	"tipoTeste": 0, //1 para tempo, 0 para perguntas
	"tempoTeste" : 5, //Segundos
	"tempoEntreTeste": 5
};

var __configs = {
	"perguntas": null,
	"perguntasPre": null,
	"ordemBateria": null,
	"tipoTeste": null,
	"tempoTeste" : null,
	"tempoEntreTeste": null,
};

function __saveConfigs(){
	for(var x in __configs){
		localStorage[x] = JSON.stringify(__configs[x]);
	}
}

function __init(){
	for(var x in __configs){
		if(localStorage[x] != undefined){
			//console.log(localStorage[x]);
			__configs[x] = JSON.parse(localStorage[x]);
		}
		else{
			__configs[x] = __configsDefault[x];
			
		}
	}
}
__init();



function getConfiguracoes(){
	return __configs;
}

function config_selectPerguntas(){
	__configs.tipoTeste = 0;
	$("#config_perguntas").css("display","inline");
	$("#config_tempo").css("display","none");
}

function config_selectTempo(){
	__configs.tipoTeste = 1;
	$("#config_tempo").css("display","inline");
	$("#config_perguntas").css("display","none");
}


function logado_config_addTeste(){
	
	var ordem = document.getElementById("logado_config_selects");
	var all = document.createElement("DIV");
	all.id = "config_select_all"+numeroTestes;
	var select = document.createElement("SELECT");
	select.id = "config_select"+numeroTestes;
	
	var option;
	option = document.createElement("option");
	option.text = "Congruente";
	option.value = "C";
	select.options.add(option);
	
	
	option = document.createElement("option");
	option.text = "Incongruente";
	option.value = "I";
	select.options.add(option);
	
	option = document.createElement("option");
	option.text = "Pre-teste Congruente";
	option.value = "pC";
	select.options.add(option);
	
	option = document.createElement("option");
	option.text = "Pre-teste Incongruente";
	option.value = "pI";
	select.options.add(option);
	
	all.appendChild(select);
	
	var buttonRemove = document.createElement("button");
	buttonRemove.type = "button";
	buttonRemove.value = numeroTestes;
	buttonRemove.innerHTML="X";
	buttonRemove.onclick = function(){
		var value = this.value;
		var all = document.getElementById("config_select_all"+value);
		
		ordem.removeChild(all);
	}
	
	
	all.appendChild(buttonRemove);
	all.appendChild(document.createElement("BR"));
	numeroTestes++;
	
	ordem.appendChild(all);
	
	return select;
}


function configuracoes(){
	paginaAtual = "config";
	document.getElementById("logado_config_selects").innerHTML = "";
	
	
	document.getElementById("logado_config_numero_perguntas").value = __configs.perguntas;
	document.getElementById("logado_config_tempoEntreTeste").value = __configs.tempoEntreTeste;
	document.getElementById("logado_config_numero_perguntas_pre").value = __configs.tempoEntreTeste;
	
	if(__configs.tipoTeste == 0){
		config_selectPerguntas();
	}
	else{
		config_selectTempo();
	}
	
	$("#logado_config_tempoDuracao").val(__configs.tempoTeste);
	
	for(var t in __configs.ordemBateria){
		if(__configs.ordemBateria[t] == "F"){
			break;
		}
		var select = logado_config_addTeste();
		
		for(var op in select.options){
			if(select.options[op].value == __configs.ordemBateria[t]){
				select.selectedIndex = op;
			}
		}
	}
	
	
	loadPage();
}

function salvaTestes(){
	localStorage.dataSet = JSON.stringify(dataSet);
}

function logado_config_salvaConfig(){
	
	if(confirm("Fazendo isso você deletará todos os testes!\nDeseja continuar?")){
		__configs.perguntas = parseInt(document.getElementById("logado_config_numero_perguntas").value);
		__configs.perguntasPre = parseInt(document.getElementById("logado_config_numero_perguntas_pre").value);
		__configs.tempoTeste = parseInt($("#logado_config_tempoDuracao").val());
		__configs.tempoEntreTeste = parseInt($("#logado_config_tempoEntreTeste").val());
		newOrdemBateria = []
		for(var i = 0; i < numeroTestes; i++){
			var select = document.getElementById("config_select"+i);
			if(select){
				var v = select.options[select.selectedIndex].value;
				newOrdemBateria.push(v);
			}
		}
		newOrdemBateria.push("F");
		__configs.ordemBateria = newOrdemBateria;
		__saveConfigs();
		dataSet = [];
		salvaTestes();
		location.reload();
		
	}
	
}

function mediaTeste(teste){
	var soma = 0;

	acertos = teste.filter(t => t.acertou)
	erros = teste.filter(t => !t.acertou)

	soma = teste.reduce((a,b) => a+parseFloat(b.tempo), 0.0)
	
	return [soma/teste.length,acertos.length,erros.length];
}

function downloadCsv() {
	var tempos = []
	for (var teste in dataSet){
		tempos.push(buscaTempoResposta(dataSet[teste].stringResposta[0]));
	}

	var csvContent = "data:text/csv;charset=utf-8,";
	
	if(dataSet.length < 1){
		alert("Não há nenhum teste registrado!");
		return;
	}

	ordemFiltrada = filtraOrdemBateria(dataSet[0].ordemBateria);
	
	var tabela = [];
	tabela.push([]);
	tabela[0][0] = "\"\"";
	
	var congruenteIndex = [];
	var incongruenteIndex = [];
	for(i in ordemFiltrada){
		if(ordemFiltrada[i] == "C"){
			congruenteIndex.push(parseInt(i));
		}
		if(ordemFiltrada[i] == "I"){
			incongruenteIndex.push(parseInt(i));
		}
	}

	tabela[0].push(`,"Tentativas","Erro C","Acertos C","Media C"`);

	tabela[0].push(`,"Erro C M","Acertos C M","Media C M"`);

	tabela[0].push(`,"Erro I","Acertos I","Media I"`);
	
	tabela[0].push(`,"Erro I M","Acertos I M","Media I M"`);
	
	var dicionario = {}

	for(var i in dataSet) {
		if(dataSet[i].nome in dicionario) {
			dicionario[dataSet[i].nome].push(dataSet[i]);
		}
		else {
			dicionario[dataSet[i].nome] = [dataSet[i]];
		}
	}
	
	var i = 1

	for(p in dicionario) {
		var line = [p];
		var pessoa = dicionario[p];
		var acertosTotais = 0, errosTotais = 0, mediaTotal = 0, tentativas = 0;

		for(b in pessoa){
			var bateria = pessoa[b];

			tentativas += bateria.stringResposta.reduce((a,b) => a+b.length, 0);

			for(var j in congruenteIndex) {
				var index = congruenteIndex[j];
				mediaTempo = mediaTeste(bateria.stringResposta[index]);

				mediaTotal = (mediaTempo[0]+mediaTotal)/2;
				acertosTotais += mediaTempo[1];
				errosTotais += mediaTempo[2]
			}
		}

		line.push(`,"${tentativas}"`)
		line.push(`,"${errosTotais}"`);
		line.push(`,"${acertosTotais}"`);
		line.push(`,"${mediaTotal}"`);

		tabela[i] = line
		i++
	}
	
	var i = 1;
	for(p in dicionario){
		var line = []
		var pessoa = dicionario[p];
		var acertosTotais = 0, errosTotais = 0, mediaTotal = 0;

		for(b in pessoa){
			var bateria = pessoa[b];
			if(bateria.grupo == 2){
				for(var j in congruenteIndex) {
					var index = congruenteIndex[j];
					mediaTempo = mediaTeste(bateria.stringResposta[index]);

					mediaTotal = (mediaTempo[0]+mediaTotal)/2;
					acertosTotais += mediaTempo[1];
					errosTotais += mediaTempo[2]
				}
			}
		}

		tabela[i].push(`,"${errosTotais}"`);
		tabela[i].push(`,"${acertosTotais}"`);
		tabela[i].push(`,"${mediaTotal}"`);
	}
	
	var i = 1;
	for(p in dicionario){
		var line = []
		var pessoa = dicionario[p];
		var acertosTotais = 0, errosTotais = 0, mediaTotal = 0;
		
		for(b in pessoa){
			var bateria = pessoa[b];
			if(bateria.grupo == 1) {
				for(var j in incongruenteIndex){
					var index = incongruenteIndex[j];
					mediaTempo = mediaTeste(bateria.stringResposta[index]);

					mediaTotal = (mediaTempo[0]+mediaTotal)/2;
					acertosTotais += mediaTempo[1];
					errosTotais += mediaTempo[2]
				}
			}
		}

		tabela[i].push(`,"${errosTotais}"`);
		tabela[i].push(`,"${acertosTotais}"`);
		tabela[i].push(`,"${mediaTotal}"`);
	}
	
	
	var i = 1;
	for(p in dicionario){
		var line = []
		var pessoa = dicionario[p];
		var acertosTotais = 0, errosTotais = 0, mediaTotal = 0;
		
		for(b in pessoa){
			var bateria = pessoa[b];

				for(var j in incongruenteIndex){
					var index = incongruenteIndex[j];
					mediaTempo = mediaTeste(bateria.stringResposta[index]);

					mediaTotal = (mediaTempo[0]+mediaTotal)/2;
					acertosTotais += mediaTempo[1];
					errosTotais += mediaTempo[2];
				}
		}

		tabela[i].push(`,"${errosTotais}"`);
		tabela[i].push(`,"${acertosTotais}"`);
		tabela[i].push(`,"${mediaTotal}"`);
	}
	
	for(var l in tabela){
		csvContent+= tabela[l].join("")+"\n";
	}

	var encodedUri = encodeURI(csvContent);
	var link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", "my_data.csv");
	document.body.appendChild(link); // Required for FF

	link.click(); // This will download the data file named "my_data.csv".
}
