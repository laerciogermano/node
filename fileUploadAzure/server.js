//INJEÇÕES DE DEPENDÊNCIA
//http : é um modulo nativo para criar um servidor http
var http = require("http");
// express : framework que trata as requisições e respostas do servidor http
var express = require("express");
// multiparty : módulo usado para tratar os dados do upload 
var multiparty = require("multiparty");
// instânciando a classe express declarada acima
var app = express();
// criando um servidor http , usando o método createServer do módulo http e passando "app"(instância de express) para tratar as requisições e respostas
var server = http.createServer(app);
// Importanto SDK (Software development kit) da azure
var azure = require("azure");

// Constantes . Usadas para conexão com a API do azure . Essas credências são geradas ao criar um serviço de storage da Azure .
// Key e Storage são encontradas no site da azure ARMAZENAMENTO -> Seleciona o Storage -> "Gerenciar Chaves de acesso" no menu inferior
const key = "CHAVE DE ACESSO PRIMÁRIA" , 
	storage = "NOME DA CONTA DE ARMAZENAMENTO" , 
	//Nome da pasta para onde vão os arquivos
	container = "fotos" 
	// CONFIGURANDO EM QUE IP E PORTA O PROJETO VAI RODAR
	IP = "127.0.0.1" ,
	PORT = "3000";

//seta o html como extensão para as views
app.set("view engine" , "html");
//seta ejs como template engine 
app.engine("html" , require("ejs").renderFile);
//seta a pasta public do projeto como publica , ou seja , acessando http:// ... /arquivosDentroDaPastaPublic .. Será visível ao usuário. Usado pra guardar css's , imagens e javascripts 
app.use(express.static("./public"));
//seta a pasta views para o express rendereizar os htmls
app.set("views" , "./views");

//---------------------------------------------------------

//função que starta a conexão com o serviço Storage criado no azure. Cria também um diretório , caso não exista
function startService(){
	//iniciando conexao com a API do Azure Storage
	var service = azure.createBlobService(storage , key);
	//cria pasta se não existir na API 
	service.createContainerIfNotExists(container, function (error) {
	  if (error) {
	    console.log("Houve algum erro ao criar pasta no azure");
	  } else { 
	    console.log("Pasta criada , caso não exista");
	  }
	});

	return service ;

}


//app = instância do framework express . Uma de suas peculiaridades é seu REST para a declaração de rotas . app.get = método get , app.post = método post , ..put e etc;
//ao acessar o /listar via GET , renderiza o html listar enviando os dados adquiridos pela consulta para o usuário .
app.get("/listar" , function(req , res){
	//iniciando conexao com a API do Azure Storage
	var service = azure.createBlobService(storage , key);
	//listBlobs é um método do SDK da azure , assim como todos que estão sendo usados para fazer essas operações básicas
	service.listBlobs(container , function(err , files){
		res.render("listar" ,{
			files : files
		});
	});
});

//quando um formulário apontar para /upload em sua action , essa função chamará um callback para tratar.
//aqui é tratado o upload dos arquivos . Usa o módulo multiparty para tratar os dados recebidos
app.post("/upload" , function(req , res){
	//criando instância de multparty para tratar nosso arquivo na requisição
	var mult = new multiparty.Form();
	//Ao receber arquivo executa o "bind part"
	mult.on("part" , function(file){
		//verifica se existe o campo filename 
		if(!file.filename) return;
		//iniciando conexao com a API do Azure Storage
		var service = startService();
		//Armazenando arquivo através da api (pasta  , nome , arquivo , tamanho , função callback )
		service.createBlockBlobFromStream(container , file.filename , file , file.byteCount , function(err){
			if(err){
				res.end("Houve algum erro ao enviar o arquivo");
				return ;
			}
			res.end("Arquivo Enviado com sucesso");
		});
	});

	mult.on("error" , function(err){
		console.log("Erro :" +err);
		res.end();
	});
	//método obrigatório para parsear os arquivos , lembrando , req : request  e res : response .
	mult.parse(req);
});

//visualizando uma foto definida por um id , onde o id é o nome da foto . ":id" represeta o que será colocado depois da última / da uri .
app.get("/visualizar/:id" , function(req , res){
	//atribuindo a variável id o parametro posterior a ultima /.
	var id = req.params.id ;
	//iniciando conexao com a API do Azure Storage
	var service = startService();
	//método do SDK azure que retorna uma imagem de acordo com o id passado
	service.getBlobToStream(container , id , res , function(err){
		if(err){
			res.end("Arquivo não existe");
		}else{
			//retornando ao usuário a imagem
			res.end();
		}
	});

});
//método deletar que recebe um id como parametro
app.get("/deletar/:id" , function(req , res){
	var id = req.params.id ;
	//iniciando conexao com a API do Azure Storage
	var service = startService();
	service.deleteBlob(container , id , function(err){
		if(err){
			res.end("Houve algum erro ao deletar arquivo");
		}else{
			res.redirect("/listar");
		}
	});

});

//Qualquer outra url que não foi declarada no express , como foi feito acima , ele redicionara para "/listar"
app.get("*" , function(req , res){
	//redirecionando para listar
	res.redirect("/listar");
});
//Iniciando nosso servidor http
//            porta       IP
server.listen(PORT , IP , function(){
	console.log("Server is running . IP : "+IP+" , PORTA : "+PORT);

});
