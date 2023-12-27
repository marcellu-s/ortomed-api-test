# ortomed-api-test

> API de teste local, criada para o projeto: Ortomed

## Técnologias utilizadas:

- Node.JS
- Express.JS
- MySQL

## Instalação e Execução
Siga os passos abaixo para clonar, instalar dependências e executar o aplicativo:

### Pré-requisitos
- Node.js: Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em sua máquina.
- MySQL: Necessário ter o [MySQL](https://www.mysql.com/).

```bash
# Clone este repositório
git clone https://github.com/marcellu-s/ortomed-api-test.git

# Navegue para o diretório do projeto
cd ortomed-api-test

# Instale as dependências do projeto
npm install

```
### Antes de iniciar
- Importe o banco de dados "ortomed.sql"
- Crie um arquivo .env, na raiz do projeto
- Adicione as informações que se pedem após o símbolo de igual (=)
```bash
# Conexão com o banco de dados
HOST=
USER=
DATABASE=
PASSWORD=

# Definição da porta do servidor local
PORT=

# Chave de acesso - TOKEN
SECRET=
```
### Inicie o projeto
```bash
npm run dev
```
