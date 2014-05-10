$(document).ready(function(){
	$("#formUpload").submit(function(evt){
		//inibe o submit do formulário
		evt.preventDefault();
		//armazena arquivo em fiile . 
		var file = document.getElementById("fileUpload").files[0];
		//cria instância de formData para manipular os arquivos do form
		var form = new FormData();
		//insere arquivo dentro da instância formData como chave "file"
		form.append("file" , file);

		//cria nova instância de AJAX para Upload
		var http = new XMLHttpRequest();
		//abrindo conexão http com o servidor (metodo , rota , ..)
		http.open( "post" ,"/upload" , true);
		//mostrando progresso do upload
		http.upload.onprogress = function(e){
			if(e.lengthComputable){
				var perc = (e.loaded / e.total) * 100;
				var progress = document.getElementById("progress");
				progress.innerHTML = perc;
				console.log(perc);
			}
		}
		//Ao ocorrer um erro essa função é executada
		http.onerror = function(e){
			alert("Houve algum erro no upload do arquivo");
		}
		//Quando o arquivo for enviado , mostra uma mensagem
		http.onload = function(e){
			alert("Arquivo enviado com sucesso");
			location.reload();
		}
		//Enviando para o servidor o formulário
		http.send(form);

	});
});