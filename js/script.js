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

var NUM_DE_PERGUNTAS = 99999; // configs.perguntas;
var NUM_DE_PERGUNTAS_PRE = 99999; // configs.perguntasPre;
var numPerguntasINPACS = configs.perguntasINPACS;
var ordemBateria = configs.ordemBateria;

var contaPerguntas = 0, tUltimaResposta = 0, t = 0;
var resposta;
var inpacsPreTeste = true;
var data = { "respostaStroop": [], "respostaInpacsPre": [], "respostaInpacsPos": []};

var tipoTeste = "INPACS";
var testeAtual = 0; // Indica quantos testes ja foram feitos no total
var testesSalvos = 0; // Indica quantos testes ja foram feitos e salvos ('C' e 'I')

var tipoInpacs = configs.tipoInicioInpacs;

var tempoRepouso = configs.tempoEntreTeste;
var tempoRestanteRepouso = tempoRepouso;

const teclasTeclado = {
    "1": "vermelho", "2": "azul", "3": "verde", "4": "roxo", "5": "preto"
}

const cores = {
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
            forceFim()
            return
        }
        let cor = teclasTeclado[event.key]
        if(cor !== undefined) {
            respostaStroop(cor)
            return
        }

        if(event.key === "ArrowLeft") {
            cor = $("#opcao-1").val();
        } else if(event.key === "ArrowRight") {
            cor = $("#opcao-2").val();
        }

        if (cor !== undefined) {
            respostaINPACS(cor)
        }
    }
});

function forceFim() {
	$("#label-Stroop").text("Fim");
	$("#conta").text("...");

    $("#tituloFinal").text("Teste finalizado");

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

        $(`#label-${tipoTeste}`).text(`A etapa com ${tipoTeste} vai começar`);
        $("#conta").text("...");
        setTimeout(() => repouso(), 1000);
    } else {
        if(tipoTeste == "INPACS") {
            mudaCorInpacs()
            $("#conta-inpacs").text(`Questão ${contaPerguntas + 1}`);
        } else {
            mudaCor(ordemBateria[testeAtual]);
            $("#conta").text(`Questão ${contaPerguntas + 1}`);
        }

        $("#botoes").css("display", "block");
        $("#countdown").css("display", "none")
    }
    tempoRestanteRepouso -= 1;
}

function iniciar() {
    document.getElementById("FormularioTutorial").style.display = "none";

    if(tipoTeste == "INPACS") {
        document.getElementById("TesteINPACS").style.display = "block";
        document.getElementById("TesteStroop").style.display = "none";
    } else {
        document.getElementById("TesteStroop").style.display = "block";
        document.getElementById("TesteINPACS").style.display = "none";
    }

    document.getElementById("countdown").style.display = "block";

    contaPerguntas = 0;
    t = Date.now();
    contagem();
    repouso();
}

function finalizaINPACS() { 
    tipoTeste = "Stroop";

    if(inpacsPreTeste) {
        iniciar()
        inpacsPreTeste = false
    } else {
        console.log("Finalizado");
        enviarDados(data);
        $("#tituloFinal").text("Fim do teste");
        $("#TesteStroop,#TesteINPACS").css("display","none");
        $("#voltar").css("display","block");
    }
}

function tutorial(form) {
    document.getElementById("FormularioNome").style.display = "none";
    document.getElementById("FormularioTutorial").style.display = "inline";
    document.getElementById("labelTutorialCongruente").style.color = "#11aa11";
    $("#labelTutorialCongruente,#labelTutorialIncongruente").text("Verde");
    document.getElementById("labelTutorialIncongruente").style.color = "#ff0000";
    $("#respostaC,#respostaI").text("Clique na resposta certa");

    data.nome = form.nome.value;
    data.grupo = form.grupo.value;
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
			setTimeout(() => finalizaStroop(), 20 * 60e3); // 20 * 60s 
		}
        contaPerguntas++; //COMECA DO 1
        $("#conta").text(`Questão ${(contaPerguntas + 1)}`);

        var limitePerguntas = NUM_DE_PERGUNTAS;
        if (ordemBateria[testeAtual] == "pI" || ordemBateria[testeAtual] == "pC") {
            limitePerguntas = NUM_DE_PERGUNTAS_PRE;
        }

        if (contaPerguntas <= limitePerguntas) { // Se o teste ainda nao acabou
            if (ordemBateria[testeAtual] == "I" || ordemBateria[testeAtual] == "C") {
                var acertou = (cor == resposta) ? 1 : 0;

                var t_resp = (Date.now() - t);

                if (data.respostaStroop[testesSalvos] == null)
                    data.respostaStroop[testesSalvos] = [];

                data.respostaStroop[testesSalvos].push({ acertou, tempo: t_resp.toFixed(2)});
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
                document.getElementById("label-Stroop").style.color = "000000";

                contaPerguntas = 0, tUltimaResposta = 0, t = 0, resposta = "";

                tempoRestanteRepouso = tempoRepouso;
                document.getElementById("countdown").style.display = "block";
                contagem()
                repouso();
            }
        }
    }
}

function finalizaStroop(force = false) {

    var cont = 0;
    var achados = 0;

    while (ordemBateria[cont] != "F") {
        if (ordemBateria[cont] == "C" || ordemBateria[cont] == "I") {
            achados++;
        }
        cont++;
    }

    contaPerguntas = 0;
    tipoTeste = "INPACS";
    data.ordemBateria = ordemBateria;
    iniciar();
}

var lastChoice = -1;

function mudaCor(c_i) {
    var rand, rand2;

    let tipo = Math.floor(Math.random() * 10) % 2 == 0 ? "C" : "I";

    if (tipo == "C") { // CONGRUENTE
        rand = Math.floor(Math.random() * 5);
        if (rand == lastChoice) {
            rand = (rand + 1) % 5;
        }
        lastChoice = rand;
        let cor = cores[rand];

        $("#label-Stroop").css("color", cor.hex).text(cor.texto);
        
        resposta = cor.texto;
    } else { // INCONGRUENTE
        rand = Math.floor(Math.random() * 5);
        if (rand == lastChoice) {
            rand = (rand + 1) % 5;
        }
        lastChoice = rand;
        let cor = cores[rand]

        resposta = cor.texto;
        $("#label-Stroop").css("color", cor.hex);

        do {
            rand2 = (Math.floor(Math.random() * 5)) % 5;
        } while (rand2 == rand);

        let corIncongruente = cores[rand2]

        $("#label-Stroop").text(corIncongruente.texto);
    }

    t = Date.now();
}

function mudaCorInpacs() {

    if (contaPerguntas > 0 && contaPerguntas % 15 == 0) {
        tipoInpacs = tipoInpacs == "I" ? "C" : "I"
    }

    $("#conta-inpacs").text(`Questão ${(contaPerguntas + 1)}`);

    if (tipoInpacs == "I") {
        rand = Math.floor(Math.random() * 5);
        if (rand == lastChoice) {
            rand = (rand + 1) % 5;
        }
        lastChoice = rand;
        let cor = cores[rand];

        resposta = cor.texto;

        let botao =  1 + Math.floor(Math.random() * 2);

        $("#label-INPACS").css("color", cor.hex);
        $(`#opcao-${botao}`).text(cor.texto).val(cor.texto);

        do {
            rand2 = (Math.floor(Math.random() * 5)) % 5;
        } while (rand2 == rand);
        cor2 = cores[rand2];

        $("#label-INPACS").text(cor2.texto);

        do {
            rand2 = (Math.floor(Math.random() * 5)) % 5;
        } while (cores[rand2].texto == cor.texto);
        
        cor2 = cores[rand2];

        $(`#opcao-${botao == 1 ? 2 : 1}`).text(cor2.texto).val(cor2.texto);
    } else {
        rand = Math.floor(Math.random() * 5);
        if (rand == lastChoice) {
            rand = (rand + 1) % 5;
        }
        lastChoice = rand;
        let cor = cores[rand];

        resposta = cor.texto;

        let botao =  1 + Math.floor(Math.random() * 2);

        $("#label-INPACS").css("color", cor.hex).text(cor.texto);
        $(`#opcao-${botao}`).text(cor.texto).val(cor.texto);

        do {
            rand2 = (Math.floor(Math.random() * 5)) % 5;
        } while (cores[rand2].texto == cor.texto);
        
        cor2 = cores[rand2];

        $(`#opcao-${botao == 1 ? 2 : 1}`).text(cor2.texto).val(cor2.texto);
    }

    t = Date.now();
}

function respostaINPACS(cor) {
    contaPerguntas++;

    var acertou = (cor == resposta) ? 1 : 0;
    var t_resp = (Date.now() - t);

    let conjunto = inpacsPreTeste ? "respostaInpacsPre" : "respostaInpacsPos"

    if (data[conjunto].length == 0 || data[conjunto][data[conjunto].length - 1].length % 15 == 0) {
        data[conjunto].push([])
    }

    data[conjunto][data[conjunto].length-1].push({ acertou, tempo: t_resp.toFixed(2), tipo: tipoInpacs == "I" ? "Incongruente" : "Congruente"});

    if(contaPerguntas == numPerguntasINPACS) {
        finalizaINPACS()
    } else {
        mudaCorInpacs()
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