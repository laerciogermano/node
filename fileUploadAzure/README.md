File Upload Azure Node.js.
===


Pré requisitos :

    * Node.js instalado.
    * Conta válida na Azure.
    * Serviço Storage iniciado.

Configurando Credências em server.js:

    const key = "CHAVE DE ACESSO PRIMÁRIA" , 
    storage = "NOME DA CONTA DE ARMAZENAMENTO" , 
    container = "fotos" ,
    IP = "127.0.0.1" ,
    PORT = "3000";
    
Rodando projeto:

    cd fileUploadAzure
    npm install
    node server.js


