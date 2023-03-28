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

var contaPerguntas = 0, ultimoCerto = 0, t = 0;
var resposta;
var data = {};

data.stringResposta = [];

var testeAtual = 0; //Indica quantos testes ja foram feitos no total
var testesSalvos = 0; //Indica quantos testes ja foram feitos e salvos ('C' e 'I')

var tempoRepouso = configs.tempoEntreTeste;
var tempoRestanteRepouso = tempoRepouso;
var intervalTempo; // Guarda o setInterval do tempo

const teclasTeclado = {
    "1": "vermelho", "2": "azul", "3": "verde", "4": "roxo", "5": "preto"
}

const coresStroop = {
    0: { texto: "vermelho", hex: "#ff0000" },
    1: { texto: "verde", hex: "#11aa11" },
    2: { texto: "azul",hex: "#0000ee" },
    3: { texto: "roxo", hex: "#8F3099" },
    4: { texto: "preto", hex: "#000000" }
}

const tiposTeste = {
    "C": "Congruente",
    "pC": "Teste Congruente",
    "I": "Incongruente",
    "pI": "Teste Incongruente"
}

document.addEventListener('keydown', function(event) {
    if (ordemBateria[testeAtual] != "F") {
        if(event.key == "Escape") {
            finalizaStroop(force = true)
            return
        } 
        let cor = teclasTeclado[event.key]

        if(cor !== null) {
            respostaStroop(cor)
        }
    }
});

function forceFim() {
	$("#label").text("Fim");
	$("#conta").text("...");

	$("#conta").text("");
	$("#voltar").css("display","inline");

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
        let tipo = ordemBateria[testeAtual];

        let nomeTeste = tiposTeste[tipo]

        $("#label").text(nomeTeste);
        $("#conta").text("...");
        setTimeout("repouso();", 1000);
    } else {
        mudaCor(ordemBateria[testeAtual]);
        intervalTempo = setInterval("tempo();", 10);

        $("#botoes").css("display", "block");
        $("#countdown").css("display", "none")
        $("#conta").text(`Questão ${contaPerguntas + 1}`);
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

function iniciarTesteINPACS() {
    document.getElementById("TesteINPACS").style.display = "block";
}

function tutorial() {
    document.getElementById("FormularioNome").style.display = "none";
    document.getElementById("FormularioTutorial").style.display = "inline";
    document.getElementById("labelTutorialCongruente").style.color = "#11aa11";
    $("#labelTutorialCongruente,#labelTutorialIncongruente").text("Verde");
    document.getElementById("labelTutorialIncongruente").style.color = "#ff0000";
    $("#respostaC,#respostaI").text("Clique na resposta certa");
}

function tempo() {
    t += 0.01;
}

function respostaTutorial(tipo, cor) {
    let resultado
    switch(tipo) {
        case "C":
            resultado = (cor == "verde") ? "certa" : "errada"
            break
        case "I":
            resultado = (cor == "vermelho") ? "certa" : "errada"
            break
    }

    $(`#resposta${tipo}`).text(`Resposta ${resultado}`)
}

function respostaStroop(cor) {
    if (tempoRestanteRepouso <= -1) {
		if (contaPerguntas == 0) {
			console.log("Começou");
			setTimeout("forceFim();", 20 * 60e3); // 20 * 60s 
		}
        contaPerguntas++; //COMECA DO 1
        $("#conta").text(`Questão ${(contaPerguntas + 1)}`);

        var limitePerguntas = NUM_DE_PERGUNTAS;
        if (ordemBateria[testeAtual] == "pI" || ordemBateria[testeAtual] == "pC") {
            limitePerguntas = NUM_DE_PERGUNTAS_PRE;
        }

        if (contaPerguntas <= limitePerguntas) { //Se o teste ainda nao acabou
            if (ordemBateria[testeAtual] == "I" || ordemBateria[testeAtual] == "C") {
                var acertou = (cor == resposta) ? 1 : 0;

                var t_resp = t - ultimoCerto;
                ultimoCerto = t;

                if (data.stringResposta[testesSalvos] == null)
                    data.stringResposta[testesSalvos] = [];

                data.stringResposta[testesSalvos].push({ acertou, tempo: t_resp.toFixed(2)});
            }
            mudaCor(ordemBateria[testeAtual]);
        }

        if (contaPerguntas >= limitePerguntas) {
            if (ordemBateria[testeAtual] == "I" || ordemBateria[testeAtual] == "C")
                testesSalvos++;
            testeAtual++;
            if (ordemBateria[testeAtual] == "F") { //Se a bateria acabou
                finalizaStroop()
            } else {
                clearInterval(intervalTempo);
                document.getElementById("label").style.color = "000000";

                contaPerguntas = 0, ultimoCerto = 0, t = 0, resposta = "";

                tempoRestanteRepouso = tempoRepouso;
                document.getElementById("countdown").style.display = "block";
                setTimeout("contagem();", 0);
                repouso();
            }
        }
    }
}

function finalizaStroop(force = false) {
    $("#tituloFinal").text(force ? "Teste finalizado" : "Fim do teste")

    $("#conta").text("");
    $("#voltar").css("display","inline");

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
}

var lastChoice = -1;

function mudaCor(c_i) {
    var rand, rand2;

    if (c_i == "C" || c_i == "pC") { // PRIMEIRA METADE É CONGRUENTE
        rand = Math.floor(Math.random() * 5);
        if (rand == lastChoice) {
            rand = (rand + 1) % 5;
        }
        lastChoice = rand;
        let cor = coresStroop[rand];

        $("#label").css("color",cor.hex).text(cor.texto);
        
        resposta = cor.nome;
    } else { // SEGUNDA METADE É INCONGRUENTE
        rand = Math.floor(Math.random() * 5);
        if (rand == lastChoice) {
            rand = (rand + 1) % 5;
        }
        lastChoice = rand;
        let cor = coresStroop[rand]

        $("#label").css("color",cor.hex);
        resposta = cor.texto;

        do {
            rand2 = (Math.floor(Math.random() * 5)) % 5;
        } while (rand2 == rand);

        let corIncongruente = coresStroop[rand2]

        $("#label").text(corIncongruente.texto);
    }
}

function mudaCorInpacs() {
    
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
        onComplete: () => {}
    });
    countdown.start();

    $("#countdown").css("left", window.innerWidth * 0.5 - countdown.settings.radius - countdown.settings.strokeWidth);

    if (window.innerHeight < 356) {
        $("#countdown").css("top", 355 - 100);
    } else {
        $("#countdown").css("bottom", 0);
    }

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