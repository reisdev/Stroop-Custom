var dataSet = [];
var localStoreLigado = false;


if (typeof(Storage) !== "undefined") {
    localStoreLigado = true;
    if (localStorage.getItem("dataSet") != null) {
        dataSet = JSON.parse(localStorage.dataSet);
    }

}


function enviarDados(dados) {
    dataSet.push(dados);
    localStorage.dataSet = JSON.stringify(dataSet);
}

function limparDados() {
    if (localStorage.getItem("dataSet") != null) {
        localStorage.removeItem("dataSet")
    }
}

var configs = getConfiguracoes();


var NUM_DE_PERGUNTAS = 99999;//configs.perguntas;
var NUM_DE_PERGUNTAS_PRE = 99999;//configs.perguntasPre;
var ordemBateria = configs.ordemBateria;

var contaPerguntas = 0;
var ultimoCerto = 0;
var t = 0;
var resposta;
var data = {};

data.stringResposta = [];

var testeAtual = 0; //Indica quantos testes ja foram feitos no total
var testesSalvos = 0; //Indica quantos testes ja foram feitos e salvos ('C' e I)

var tempoRepouso = configs.tempoEntreTeste;

var tempoRestanteRepouso = tempoRepouso;

var intervalTempo; // Guarda o setInterval do tempo

const teclasTeclado = {
    "1": "vermelho", "2": "azul", "3": "verde", "4": "roxo", "5": "preto"
}

document.addEventListener('keydown', function(event) {
    if (ordemBateria[testeAtual] != "F") {
        let cor = teclasTeclado[event.key]

        if(cor !== null) {
            clicou(cor)
        }
    }
});

function forceFim() {
	document.getElementById("label").innerHTML = "Fim";
	document.getElementById("conta").innerHTML = "...";

	document.getElementById("conta").innerHTML = "";
	document.getElementById("voltar").style.display = "inline";

	var cont = 0;
	var achados = 0;

	while (ordemBateria[cont] != "F") {
		if (ordemBateria[cont] == "C" || ordemBateria[cont] == "I") {
			achados++;
		}
		cont++;
	}

	data.ordemBateria = ordemBateria;
	enviarDados(data);
	document.getElementById("botoes").innerHTML = "";
	console.log("Fim");
}

function repouso() {
    if (tempoRestanteRepouso > 0) {
        var teste; // Nome do teste
        if (ordemBateria[testeAtual] == "pC") {
            teste = "Treino congruente";
        } else if (ordemBateria[testeAtual] == "C") {
            teste = "Congruente";
        } else if (ordemBateria[testeAtual] == "pI") {
            teste = "Treino incongruente";
        } else if (ordemBateria[testeAtual] == "I") {
            teste = "Incongruente";
        } else {
            teste = "Fim";
        }
        document.getElementById("label").innerHTML = teste;
        document.getElementById("conta").innerHTML = "...";
        setTimeout("repouso();", 1000);
    } else {
        mudaCor(ordemBateria[testeAtual]);
        intervalTempo = setInterval("tempo();", 10);
        var string = "";
        document.getElementById("botoes").style.display = "block";
        document.getElementById("countdown").style.display = "none";
        document.getElementById("conta").innerHTML = "Questão " + (contaPerguntas + 1);
    }
    tempoRestanteRepouso -= 1;
}

function iniciar() {
    document.getElementById("FormularioTutorial").style.display = "none";
    document.getElementById("corpo").style.display = "inline";
    data.nome = document.getElementById("nome").value;

    var grupo = "Sem Grupo";
    if (document.getElementById("grupo_1").checked) {
        grupo = 1;
    }
    if (document.getElementById("grupo_2").checked) {
        grupo = 2;
    }

    data.grupo = grupo;
    document.getElementById("countdown").style.display = "block";
    setTimeout("contagem();", 0);
    repouso();
}

function tutorial() {
    document.getElementById("FormularioNome").style.display = "none";
    document.getElementById("FormularioTutorial").style.display = "inline";
    document.getElementById("labelTutorialCongruente").style.color = "#11aa11";
    document.getElementById("labelTutorialCongruente").innerHTML = "Verde";
    document.getElementById("labelTutorialIncongruente").style.color = "#ff0000";
    document.getElementById("labelTutorialIncongruente").innerHTML = "Verde";
    document.getElementById("respostaC").innerHTML = "Clique na resposta certa";
    document.getElementById("respostaI").innerHTML = "Clique na resposta certa";
}

function tempo() {
    t += 0.01;
}

function clicouTutorialC(cor) {
    if (cor == "verde") {
        document.getElementById("respostaC").innerHTML = "Resposta certa";
    } else {
        document.getElementById("respostaC").innerHTML = "Resposta errada";
    }

}

function clicouTutorialI(cor) {
    if (cor == "vermelho") {
        document.getElementById("respostaI").innerHTML = "Resposta certa";
    } else {
        document.getElementById("respostaI").innerHTML = "Resposta errada";
    }

}

function clicou(cor) {
    if (tempoRestanteRepouso <= -1) {
		if (contaPerguntas == 0) {
			console.log("Começou");
			setTimeout("forceFim();", 20 * 60 * 1000);
		}
        contaPerguntas++; //COMECA DO 1
        document.getElementById("conta").innerHTML = "Questão " + (contaPerguntas + 1);

        var limitePerguntas = NUM_DE_PERGUNTAS;
        if (ordemBateria[testeAtual] == "pI" || ordemBateria[testeAtual] == "pC") {
            limitePerguntas = NUM_DE_PERGUNTAS_PRE;
        }

        if (contaPerguntas <= limitePerguntas) { //Se o teste ainda nao acabou
            if (ordemBateria[testeAtual] == "I" || ordemBateria[testeAtual] == "C") {
                var acertou = 0;
                if (cor == resposta)
                    acertou = 1;
                else
                    acertou = 0;


                var t_resp = t - ultimoCerto;
                ultimoCerto = t;

                if (data.stringResposta[testesSalvos] == null)
                    data.stringResposta[testesSalvos] = [];

                data.stringResposta[testesSalvos][contaPerguntas - 1] = {};
                data.stringResposta[testesSalvos][contaPerguntas - 1].acertou = acertou;
                data.stringResposta[testesSalvos][contaPerguntas - 1].tempo = t_resp.toFixed(2);

            }
            mudaCor(ordemBateria[testeAtual]);
        }

        if (contaPerguntas >= limitePerguntas) {
            if (ordemBateria[testeAtual] == "I" || ordemBateria[testeAtual] == "C")
                testesSalvos++;
            testeAtual++;
            if (ordemBateria[testeAtual] == "F") { //Se a bateria acabou

                document.getElementById("conta").innerHTML = "";
                document.getElementById("voltar").style.display = "inline";


                var cont = 0;
                var achados = 0;

                while (ordemBateria[cont] != "F") {
                    if (ordemBateria[cont] == "C" || ordemBateria[cont] == "I") {
                        achados++;
                    }
                    cont++;
                }

                data.ordemBateria = ordemBateria;
                enviarDados(data);
                document.getElementById("botoes").innerHTML = "";
            } else {
                clearInterval(intervalTempo);
                document.getElementById("label").style.color = "000000";

                contaPerguntas = 0;
                ultimoCerto = 0;
                t = 0;
                resposta = "";
                tempoRestanteRepouso = tempoRepouso;
                document.getElementById("countdown").style.display = "block";
                setTimeout("contagem();", 0);
                repouso();
            }
        }
    }
}

var lastChoice = -1;

function mudaCor(c_i) {
    var rand;
    var rand2;
    if (c_i == "C" || c_i == "pC") { // PRIMEIRA METADE É CONGRUENTE
        rand = Math.floor(Math.random() * 5);
        if (rand == lastChoice) {
            rand = (rand + 1) % 5;
        }
        lastChoice = rand;
        switch (rand) {
            case 0: // VERMELHO
                document.getElementById("label").style.color = "#ff0000";
                document.getElementById("label").innerHTML = "Vermelho";
                resposta = "vermelho";
                break;
            case 1: //VERDE
                document.getElementById("label").style.color = "#11aa11";
                document.getElementById("label").innerHTML = "Verde";
                resposta = "verde";
                break;
            case 2: // AZUL
                document.getElementById("label").style.color = "#0000ee";
                document.getElementById("label").innerHTML = "Azul";
                resposta = "azul";
                break;
            case 3: // ROXO
                document.getElementById("label").style.color = "#8F3099";
                document.getElementById("label").innerHTML = "Roxo";
                resposta = "roxo";
                break;
            case 4:
                document.getElementById("label").style.color = "#000000";
                document.getElementById("label").innerHTML = "Preto";
                resposta = "marrom";
                break;
        }
    } else { // SEGUNDA METADE É INCONGRUENTE
        rand = Math.floor(Math.random() * 5);
        if (rand == lastChoice) {
            rand = (rand + 1) % 5;
        }
        lastChoice = rand;
        switch (rand) {
            case 0: // VERMELHO
                document.getElementById("label").style.color = "#ff0000";
                resposta = "vermelho";
                break;
            case 1: //VERDE
                document.getElementById("label").style.color = "#11aa11";
                resposta = "verde";
                break;
            case 2: // AZUL
                document.getElementById("label").style.color = "#0000ee";
                resposta = "azul";
                break;
            case 3: // ROXO
                document.getElementById("label").style.color = "#8F3099";
                resposta = "roxo";
                break;
            case 4: //MARROM
                document.getElementById("label").style.color = "#000000";
                resposta = "marrom";
                break;
        }
        do {
            rand2 = (Math.floor(Math.random() * 5)) % 5;
        } while (rand2 == rand);

        switch (rand2) {
            case 0: // VERMELHO
                document.getElementById("label").innerHTML = "Vermelho";
                break;
            case 1: //VERDE
                document.getElementById("label").innerHTML = "Verde";
                break;
            case 2: // AZUL
                document.getElementById("label").innerHTML = "Azul";
                break;
            case 3: //ROXO
                document.getElementById("label").innerHTML = "Roxo";
                break;
            case 4: // MARROM
                document.getElementById("label").innerHTML = "Preto";
                break;
        }
    }
}

function voltar() {
    document.location.href = "index.html";
}
// Relogio de contagem regressiva
function contagem() {
    var countdown = $("#countdown").countdown360({
        radius: 50,
        seconds: tempoRepouso,
        strokeStyle: "#000000", // the color of the stroke
        strokeWidth: undefined, // the stroke width, dynamically calulated if omitted in options
        fillStyle: "#DCDCDC", // the fill color
        fontColor: "#696969", // the font color
        autostart: false,
        label: ["", ""],
        smooth: true,
        onComplete: function() {
            /*console.log('done')*/ ;
        }
    });
    countdown.start();
    //console.log('countdown360 ',countdown);

    $("#countdown").css("left", window.innerWidth * 0.5 - countdown.settings.radius - countdown.settings.strokeWidth);

    if (window.innerHeight < 356) {
        $("#countdown").css("top", 355 - 100);
    } else {
        $("#countdown").css("bottom", 0);
    }

    // $("#countdown360_countdown").css("position", "fixed");
    // $("#countdown360_countdown").css("botton", 0);

    // this.settings.width = (this.settings.radius * 2) + (this.settings.strokeWidth * 2);
    // this.settings.height = this.settings.width;

    // Nao sei por que buga as vezes e o relogio vira um quadrado
    $(window).resize(function() {
        if (window.innerHeight < 356) {
            $("#countdown").css("top", 355 - 120);
            $("#countdown").css("bottom", "");
        } else {
            $("#countdown").css("bottom", 0);
            $("#countdown").css("top", "");
        }
        $("#countdown").css("left", window.innerWidth * 0.5 - countdown.settings.radius - countdown.settings.strokeWidth);
    });
}