/*
Para usar este modulo, utilize:
 getConfiguracoes() : Retorna um dicionario com as configuracoes do programa
 
 __saveConfigs() : Salva as configuracoes do programa


 Caso seja necessario adicionar novas configuracoes, adicione nos dois dicionarios abaixo (__configsDefault e __configs)
*/

var numeroTestes = 0;

var __configsDefault = {
	"ordemBateria": ["I", "F"],
	"tipoInicioInpacs": "I",
	"perguntasINPACS": 75,
	"perguntas": 6,
	"perguntasPre": 6,
	"tipoTeste": 0, //1 para tempo, 0 para perguntas
	"tempoTeste": 5, //Segundos
	"tempoEntreTeste": 5,
};

var __configs = {
	"tipoInicioInpacs": null,
	"perguntasINPACS": null,
	"perguntas": null,
	"perguntasPre": null,
	"ordemBateria": null,
	"tipoTeste": null,
	"tempoTeste": null,
	"tempoEntreTeste": null,
};

function __saveConfigs() {
	for (var x in __configs) {
		localStorage[x] = JSON.stringify(__configs[x]);
	}
}

function __init() {
	for (var x in __configs) {
		if (localStorage[x] != undefined) {
			__configs[x] = JSON.parse(localStorage[x]);
		}
		else {
			__configs[x] = __configsDefault[x];
		}
	}
}
__init();

function getConfiguracoes() {
	return __configs;
}

function config_selectPerguntas() {
	__configs.tipoTeste = 0;
	$("#config_perguntas").css("display", "inline");
	$("#config_tempo").css("display", "none");
}

function config_selectTempo() {
	__configs.tipoTeste = 1;
	$("#config_tempo").css("display", "inline");
	$("#config_perguntas").css("display", "none");
}


function logado_config_addTeste() {

	var ordem = document.getElementById("logado_config_selects");
	var all = document.createElement("DIV");
	all.id = "config_select_all" + numeroTestes;
	var select = document.createElement("SELECT");
	select.id = "config_select" + numeroTestes;

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
	buttonRemove.innerHTML = "X";
	buttonRemove.onclick = function () {
		var value = this.value;
		var all = document.getElementById("config_select_all" + value);

		ordem.removeChild(all);
	}


	all.appendChild(buttonRemove);
	all.appendChild(document.createElement("BR"));
	numeroTestes++;

	ordem.appendChild(all);

	return select;
}


function configuracoes() {
	paginaAtual = "config";
	document.getElementById("logado_config_selects").innerHTML = "";

	document.getElementById("logado_config_numero_perguntas").value = __configs.perguntas;
	document.getElementById("logado_config_tempoEntreTeste").value = __configs.tempoEntreTeste;
	document.getElementById("logado_config_numero_perguntas_pre").value = __configs.tempoEntreTeste;

	if (__configs.tipoTeste == 0) {
		config_selectPerguntas();
	}
	else {
		config_selectTempo();
	}

	$("#logado_config_tempoDuracao").val(__configs.tempoTeste);

	for (var t in __configs.ordemBateria) {
		if (__configs.ordemBateria[t] == "F") {
			break;
		}
		var select = logado_config_addTeste();

		for (var op in select.options) {
			if (select.options[op].value == __configs.ordemBateria[t]) {
				select.selectedIndex = op;
			}
		}
	}

	loadPage();
}

function salvaTestes() {
	localStorage.dataSet = JSON.stringify(dataSet);
}

function logado_config_salvaConfig() {

	if (confirm("Fazendo isso você deletará todos os testes!\nDeseja continuar?")) {
		__configs.perguntas = parseInt(document.getElementById("logado_config_numero_perguntas").value);
		__configs.perguntasPre = parseInt(document.getElementById("logado_config_numero_perguntas_pre").value);
		__configs.tempoTeste = parseInt($("#logado_config_tempoDuracao").val());
		__configs.tempoEntreTeste = parseInt($("#logado_config_tempoEntreTeste").val());
		newOrdemBateria = []
		for (var i = 0; i < numeroTestes; i++) {
			var select = document.getElementById("config_select" + i);
			if (select) {
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

function mediaTeste(teste) {
	acertos = teste.filter(t => t.acertou).length
	erros = teste.length - acertos
	mediaTempo = teste.reduce((a, b) => a + parseFloat(b.tempo), 0.0) / teste.length

	return [mediaTempo, acertos, erros];
}

function downloadCsv() {
	if (dataSet.length < 1) {
		alert("Não há nenhum teste registrado!");
		return;
	}
	
	var tabelaStroop = [[`"Tempo médio","Erros","Acertos"`]];
	var tabelaInpacsPre = [[`"Tipo","Tempo médio","Erros","Acertos"`]];
	var tabelaInpacsPos = [[`"Tipo","Tempo médio","Erros","Acertos"`]];

	var dicionario = {}

	for (var i in dataSet) {
		if (dataSet[i].nome in dicionario) {
			dicionario[dataSet[i].nome].push(dataSet[i]);
		}
		else {
			dicionario[dataSet[i].nome] = [dataSet[i]];
		}
	}

	// Gera csv INPACS Pre
	for (p in dicionario) {
		var pessoa = dicionario[p];
		var acertosTotais = 0, errosTotais = 0, mediaTotal = 0;

		pessoa.forEach((bateria) => {
			bateria.respostaInpacsPre.forEach(bloco => {
				let [tempoParcial, acertoParcial, erroParcial] = mediaTeste(bloco)
				
				mediaTotal = mediaTotal == 0 ? tempoParcial : (tempoParcial + mediaTotal) / 2;
				acertosTotais += acertoParcial;
				errosTotais += erroParcial;

				tabelaInpacsPre.push([`"${bloco[0].tipo}"`,`"${tempoParcial.toFixed(2)}"`,`"${erroParcial}"`,`"${acertoParcial}"`])
			})
		});

		tabelaInpacsPre.push([`"Geral"`,`"${mediaTotal.toFixed(2)}"`,`"${errosTotais}"`,`"${acertosTotais}"`])
	}

	let conteudoTabelaInpacsPre = tabelaInpacsPre.join("\n") + "\n";

	geraCsv(conteudoTabelaInpacsPre, "INPACS-PRE.csv");

	// Gera csv Stroop
	for (p in dicionario) {
		var pessoa = dicionario[p];
		var acertosTotais = 0, errosTotais = 0, mediaTotal = 0;

		pessoa.forEach((bateria) => {
			let [tempoParcial, acertoParcial, erroParcial] = bateria.respostaStroop.reduce((a,b) => {
				[tParcial ,aParcial, eParcial] = mediaTeste(b);
				return [a[0]+tParcial,a[1]+aParcial,a[2]+eParcial]
			}, [0,0,0]);

			mediaTotal += mediaTotal == 0 ? tempoParcial : (tempoParcial + mediaTotal) / 2;
			acertosTotais += acertoParcial;
			errosTotais += erroParcial;
		});

		tabelaStroop.push([`"${mediaTotal.toFixed(2)}"`,`"${errosTotais}"`,`"${acertosTotais}"`])
	}

	let conteudoTabelaStroop = tabelaStroop.join("\n") + "\n";

	geraCsv(conteudoTabelaStroop, "STROOP.csv");

	// Gera csv INPACS Pós
	for (p in dicionario) {
		var pessoa = dicionario[p];
		var acertosTotais = 0, errosTotais = 0, mediaTotal = 0;

		pessoa.forEach((bateria) => {
			bateria.respostaInpacsPos.forEach(bloco => {
				let [tempoParcial, acertoParcial, erroParcial] = mediaTeste(bloco)
	
				mediaTotal = mediaTotal == 0 ? tempoParcial : (tempoParcial + mediaTotal) / 2;
				acertosTotais += acertoParcial;
				errosTotais += erroParcial;

				tabelaInpacsPos.push([`"${bloco[0].tipo}"`,`"${tempoParcial.toFixed(2)}"`,`"${erroParcial}"`,`"${acertoParcial}"`])
			})
		});

		tabelaInpacsPos.push([`"Geral"`,`"${mediaTotal.toFixed(2)}"`,`"${errosTotais}"`,`"${acertosTotais}"`])
	}

	let conteudoTabelaInpacsPos = tabelaInpacsPos.join("\n") + "\n";

	geraCsv(conteudoTabelaInpacsPos, "INPACS-POS.csv");
}

function geraCsv(conteudo, nome) {
	let csvContent = "data:text/csv;charset=utf-8,";
	let encodedUri = encodeURI(csvContent + conteudo);
	let link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", nome);
	document.body.appendChild(link); // Required for FF

	link.click();

	document.body.removeChild(link);
}
