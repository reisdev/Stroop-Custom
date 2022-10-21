function save_data(){

	if(dataSet == null){
		alert("Erro");
		return;
	}
	var tempos = []
	for (var teste in dataSet){
		tempos.push(buscaTempoResposta(dataSet[teste].stringResposta[0]));
	}
	var data = tempos;
	var csvContent = "data:text/csv;charset=utf-8,";

	
	var stroopFileContent = {};
	var configs = getConfiguracoes();
	for(var c in configs){
		stroopFileContent[c] = configs[c];
	}
	
	stroopFileContent.dataSet = dataSet;
	
	csvContent += JSON.stringify(stroopFileContent);
	

	//window.open(encodedUri,"name");
	var encodedUri = encodeURI(csvContent);
	var link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", "my_data.stroop");
	document.body.appendChild(link); 

	link.click(); 
}

function getFile(){
	document.getElementById("upfile").click();
}

function load_data(inputFiles){
	f = inputFiles[0];
	var reader = new FileReader();

	reader.onload = (function(theFile) {
		return function(e) {
			var data = e.target.result;
			var stroopFileContent = JSON.parse(data);
			dataSet = stroopFileContent.dataSet;
			
			var configs = getConfiguracoes();
			for(var c in configs){
				configs[c] = stroopFileContent[c];
			}
			__saveConfigs();
			salvaTestes();
			location.reload();
		}
	})(f);

	reader.readAsBinaryString(f);

}
