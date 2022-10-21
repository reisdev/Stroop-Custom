
var dataSet = [];
var localStoreLigado = false;
if (typeof(Storage) !== "undefined") {


  localStoreLigado=true;


  if(localStorage.getItem("dataSet") != null){
  	dataSet = JSON.parse(localStorage.dataSet);
  }

}

//Mantem em "cache" o login e senha
var login = null;
var senha = null;

//Contem a estrutura de todos as informacoes necessarias para o professor (array de baterias de testes)
var dados = dataSet;
//console.log(dados);

var objeto_ativo = null; //Objeto (HTML) ativo na gerencia de testes



/*
Informa a interface do html:
"main"      : interface de login ou de gráficos
"gerenciar" : interface de gerencia de testes (excluir, ver resultados)
*/
var paginaAtual = "main";





//Tenta logar com os valores dos inputs do formulario HTML

function loadPage(){
	document.getElementById("logado_main").style.display = "none";
	document.getElementById("logado_gerenciar").style.display = "none";
	document.getElementById("logado_config").style.display = "none";
	document.getElementById("logado_"+paginaAtual).style.display = "inline";
}

loadPage();

//Requisita os testes ligado a esse professor ao servidor e armazena a resposta em dados
//Obs: É assíncrono
function buscaTestes(){
		dados = dataSet;

			geraGraficos();

		geraDadosGerenciar();
		loadPage();

}

//Função chamada para carregar a aba de gerencia de testes
function geraDadosGerenciar(){
	if(paginaAtual == "gerenciar"){
		document.getElementById("gerencia_testes").innerHTML="";
		for(var i = 0; i < dados.length; i++){
			document.getElementById("gerencia_testes").innerHTML+=
			"<span class='pure-button pure-button-primary' onClick=abre_informacao_teste(this); id_teste="+i+">"+dados[i].nome+"</span> <span class='pure-button pure-button-primary exclueTeste' onClick='exclueTeste("+i+");'>X</span><br><br>";
		}
	}
}

//Requisita ao servidor para excluir determinado teste do professor logado
function exclueTeste(index){
	dataSet.splice(index,1);
	buscaTestes();
	salvaTestes();
}


//Desativa a interface ativada (main ou gerencia de testes)
function desativa_objeto_ativo(){
	if(!objeto_ativo)
		return;

	objeto_ativo.innerHTML = dados[1*objeto_ativo.getAttribute("id_teste")].nome;

	objeto_ativo = null;
}



//Retorna array com C e I na ordem original (somente os testes "validos")
function filtraOrdemBateria(array){
	return array.filter(function(element){
		return element !== "pC" && element !== "pI" && element !== "F";
	});
}





//Imprime na tela o conteúdo referente a aba de gerencia de testes
function abre_informacao_teste(obj){

  
	if(objeto_ativo == obj){
		desativa_objeto_ativo();
		return;
	}


	obj.innerHTML = "<center>";
	/* Percorre a estrutura de dados que é definida no script.js que contém todas as informações referentes a 1 teste*/
	obj.innerHTML+= dados[1*obj.getAttribute("id_teste")].nome+"<br>";
	obj.innerHTML+= "Grupo "+dados[1*obj.getAttribute("id_teste")].grupo+"<br>";
	ordemFiltrada = filtraOrdemBateria(dados[1*obj.getAttribute("id_teste")].ordemBateria);
	

	//Para cada resposta de cada teste
	for(var i = 0; i < dados[1*obj.getAttribute("id_teste")].stringResposta.length; i++){
		obj.innerHTML+="<br>"

		if(ordemFiltrada[i] == "C")
			obj.innerHTML+="Congruente";
		if(ordemFiltrada[i] == "I")
			obj.innerHTML+="Incongruente";

		obj.innerHTML+="<br>";
		var mediaC=0;
		var mediaI=0;
		var acertos = 0;
		for(var j = 0; j < dados[1*obj.getAttribute("id_teste")].stringResposta[i].length; j++){
			/*Escreve na tela ( em forma de botões ) se a pessoa acertou, e o seu tempo, alterando a classe de cada uma para :
				- spanAcertou
				- spanErrou
			 */

			if(dados[1*obj.getAttribute("id_teste")].stringResposta[i][j].acertou == "1"){
				obj.innerHTML += "<span class=spanAcertou>" + dados[1*obj.getAttribute("id_teste")].stringResposta[i][j].tempo+"</span><br>";
				if(ordemFiltrada[i] == "C"){
				  mediaC = parseFloat(mediaC) + parseFloat(dados[1*obj.getAttribute("id_teste")].stringResposta[i][j].tempo);
				}
				else{
					mediaI = parseFloat(mediaI) + parseFloat(dados[1*obj.getAttribute("id_teste")].stringResposta[i][j].tempo);
				}
				acertos++;
			}
			else{
				obj.innerHTML += "<span class=spanErrou>" + dados[1*obj.getAttribute("id_teste")].stringResposta[i][j].tempo+"</span><br>";
			}
      
    }
    if(mediaI == 0)
    {
      obj.innerHTML += "<br>Média Congruente<br>";
      mediaC = parseFloat(mediaC) / acertos;
      obj.innerHTML += "<span class=spanAcertou>" + parseFloat(mediaC.toFixed(2))+"</span><br>";
    }
    else {
      obj.innerHTML += "<br>Média Incongruente<br>";
      mediaI = parseFloat(mediaI) / acertos;
      obj.innerHTML += "<span class=spanAcertou>" + parseFloat(mediaI.toFixed(2))+"</span><br>";
    }
    desvioPadrao = 0;
    for(var j = 0; j < dados[1*obj.getAttribute("id_teste")].stringResposta[i].length; j++){
      if(mediaI == 0)
      {
        quadrado = (( parseFloat(dados[1*obj.getAttribute("id_teste")].stringResposta[i][j].tempo) ) - parseFloat(mediaC)) * (parseFloat( parseFloat(dados[1*obj.getAttribute("id_teste")].stringResposta[i][j].tempo) - parseFloat(mediaC)));
        desvioPadrao = parseFloat(desvioPadrao) + quadrado;
      }
      else {
        desvioPadrao = parseFloat(desvioPadrao) + ( (parseFloat( parseFloat(dados[1*obj.getAttribute("id_teste")].stringResposta[i][j].tempo)) - parseFloat(mediaI)) * (parseFloat( parseFloat(dados[1*obj.getAttribute("id_teste")].stringResposta[i][j].tempo) ) - parseFloat(mediaI)) );
      }
    }
    desvioPadrao = parseFloat(desvioPadrao) / parseFloat(dados[1*obj.getAttribute("id_teste")].stringResposta[i].length);
    desvioPadrao = parseFloat(Math.sqrt(parseFloat(desvioPadrao)) );
    obj.innerHTML += "<br>Desvio Padrão<br>";
    obj.innerHTML += "<span class=spanAcertou>" + parseFloat(desvioPadrao.toFixed(2))+"</span><br>";

	if(j < dados[1*obj.getAttribute("id_teste")].stringResposta[i].length-1)
		obj.innerHTML +="<br>";
	}


	obj.innerHTML += "</center>";


	objeto_ativo = obj;


}



/*Função que plota o gráfico de qualquer teste

parametros:
* indice = indice do teste que se deseja plotar (int)
* idHTML = Nome que se dará ao gráfico (string)

Ex1 : Congruente 1
Ex2 : Incongruente 1
Obs: Se dados for nulo, não sera pplotado nenhum gráfico
*/

function range(x){
	var ret = [];
	for(var i = 1; i <= x; i++){
		ret.push(i);
	}

	return ret;
}

function plotaGraficoX(/*vetX,vetY */indice,idHTML, grafico){
	var vetLinhas = [];
	var j;

	for(var i = 0; i < dados.length; i++){
		//Linhas
		var auxVetY = [];
		var auxVetX = [];
		var rgb = [];
		// var colorAux = 10;
		for(j = 0; j < dados[i].stringResposta[indice].length; j++){
			if(dados[i].stringResposta[indice][j].acertou){ // Acertou
				auxVetX.push(j+1);
				auxVetY.push(dados[i].stringResposta[indice][j].tempo);
				rgb.push('rgb(31,119,180)');
			} else {
				auxVetX.push(j+1);
				auxVetY.push(dados[i].stringResposta[indice][j].tempo);
				rgb.push('rgb(180,30,31)');
			}
		}
		vetLinhas[vetLinhas.length] = {
		  x: auxVetX,
		  y: auxVetY,
		  type: 'bar',
		  marker: { color: rgb },
		  name: dados[i].nome
		};

	}
	
	
	var layout = {
	  title: idHTML,
	  xaxis: {
		  title:"Pergunta",
		  tickfont: {
		  size: 14,
		  color: 'rgb(107, 107, 107)'
		}},
	  yaxis: {
		title: 'Tempo',
		titlefont: {
		  size: 16,
		  color: 'rgb(107, 107, 107)'
		},
		tickfont: {
		  size: 14,
		  color: 'rgb(107, 107, 107)'
		}
	  },
	  legend: {
		x: 0,
		y: 1.0,
		bgcolor: 'rgba(255, 255, 255, 0)',
		bordercolor: 'rgba(255, 255, 255, 0)'
	  },
	  barmode: 'group',
	  bargap: 0.15,
	  bargroupgap: 0.1,
	  showlegend: false
	};


	var node = document.createElement("CENTER");
	node.id = idHTML;
	//document.getElementById("logado_main").innerHTML += "<center>"+idHTML+"</center>";
	document.getElementById("logado_main").appendChild(node);//idHTML+"<br><center id='"+idHTML+"'></center>"
	Plotly.newPlot(idHTML, vetLinhas,layout);
	vetLinhas = [];
	auxVetY = [];
	auxVetX = [];
	rgb = [];

}

function plotaGraficoMedia(graficoGlobal, indice,idHTML, grafico){

	var vetLinhas = [];

	var media = [];
	var acertos = [];
	var acertosAbsolutos=0;
	var quantidadePergunatasAbsolutas =0;
	var quantidadeTestes= 0;
	var quantidadePerguntas =0;
	quantidadePerguntas = graficoGlobal[0].length;
	quantidadeTestes = graficoGlobal.length/indice;


	for(var i=0; i< quantidadePerguntas; i++){
			media[i] = 0;
			acertos[i] =0;
	}


	for(var i = 0; i < graficoGlobal.length; i++){
			var tempos = buscaTempoResposta(graficoGlobal[i]);
			for(var j=0; j< tempos.length; j++){
				if(graficoGlobal[i][j].acertou)
				{
					 media[j] = parseFloat(media[j]) + parseFloat(tempos[j]);
					 acertos[j] +=1;
					 acertosAbsolutos+=1;
				}
				quantidadePergunatasAbsolutas+=1;

			}
		}
	for(var i=0; i< tempos.length; i++){
		if(acertos[i] != 0)
		{
			media[i] = parseFloat(media[i])/parseFloat(acertos[i]);
		}

	}
	vetLinhas[vetLinhas.length] = {
		  x: range(media.length),
		  y: media,
		  type: 'bar',
		  //mode:'lines+markers',
		  name: "media"

	};
    var layout = {
	  title: idHTML,
	  xaxis: {
		  title:"Pergunta",
		  tickfont: {
		  size: 14,
		  color: 'rgb(107, 107, 107)'
		}},
	  yaxis: {
		title: 'Tempo',
		titlefont: {
		  size: 16,
		  color: 'rgb(107, 107, 107)'
		},
		tickfont: {
		  size: 14,
		  color: 'rgb(107, 107, 107)'
		}
	  },
	  legend: {
		x: 0,
		y: 1.0,
		bgcolor: 'rgba(255, 255, 255, 0)',
		bordercolor: 'rgba(255, 255, 255, 0)'
	  },
	  barmode: 'group',
	  bargap: 0.15,
	  bargroupgap: 0.1,
	  showlegend: false,
	  annotations: [ {
		xref: 'paper',
		yref: 'paper',
		x: 1,
		xanchor: 'bottom',
		y: 1.1,
		yanchor: 'right',
			text: 'Quantidade total: '+quantidadePergunatasAbsolutas+' Quantidade acertos: '+acertosAbsolutos,
		showarrow: false
	  }]
	};


	var node = document.createElement("CENTER");
	node.id = idHTML;
	node.class = "divGrafico";
	document.getElementById("logado_main").appendChild(node);
	Plotly.newPlot(idHTML, vetLinhas, layout);

	vetLinhas = [];
}




//Percorre os testes do professor e os plota de acordo com a congruencia
function geraGraficos(){
	if(!dados)
		return;

	$("#logado_main center" ).remove();
	if(!dados.length)
	{
		//alert("Não há nenhum teste registrado!");
		return;
	}

	var congruentes = 0;
	var incongruentes = 0;
	var graficoGlobalC = [];
	var graficoGlobalI = [];
	var grupos = [];

	for(var i=0; i < dados.length; i++)
	{
		if(grupos.indexOf(dados[i].grupo) < 0 )
		{
			grupos.push(dados[i].grupo);
		}
	}

for(var m=0; m<grupos.length; m++)
{
	for(var j =0; j <dados.length; j++){
		if(dados[j].grupo == grupos[m])
		{
    congruentes = 0;
    incongruentes = 0;
			for( var i = 0; i < dados[0].ordemBateria.length; i++){
				if(dados[0].ordemBateria[i] == "C"){
					graficoGlobalC.push(dados[j].stringResposta[congruentes+incongruentes]);
					congruentes++;
				}
				if(dados[0].ordemBateria[i] == "I"){
					graficoGlobalI.push(dados[j].stringResposta[congruentes+incongruentes]);
					incongruentes++;
				}
			}
		}
	}

	if(congruentes)
	 plotaGraficoMedia(graficoGlobalC, congruentes,"Media Congruente do grupo "+(grupos[m]), "graficoCMedia");
	if(incongruentes)
		plotaGraficoMedia(graficoGlobalI, incongruentes,"Media Incongruente do grupo "+(grupos[m]), "graficoIMedia");

		congruentes = 0;
		incongruentes = 0;
		graficoGlobalC=[];
		graficoGlobalI=[];
}




	for( var i = 0; i< dados[0].ordemBateria.length; i++){
		if(dados[0].ordemBateria[i] == "C"){
			plotaGraficoX(congruentes+incongruentes,"Congruente "+(congruentes+1), "graficoC");
			congruentes++;
		}

		if(dados[0].ordemBateria[i] == "I"){
			plotaGraficoX(congruentes+incongruentes,"Incongruente "+(incongruentes+1), "graficoI");
			incongruentes++;
		}
	}

}




/*
Puxa somente o tempo das respostas de um vetor de respostas (um unico teste)
Foi criado pois o tempo é um dos campos de cada resposta

Retorna um array
*/
function buscaTempoResposta(vetorResposta){
	var retorno = [];
	for(var i = 0; i < vetorResposta.length; i++){
		retorno[retorno.length] = vetorResposta[i].tempo;
	}
	return retorno;
}


//Chamado ao clicar no botao da aba de gerenciar
function gerenciarTestes(){
	paginaAtual = "gerenciar";
	buscaTestes();
	loadPage();
}


//Chamado ao clicar no botao do inicio
function inicioTestes(){
	paginaAtual = "main";
	buscaTestes();

}
