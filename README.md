# API Users – Modern Full-Stack Web API (.NET)

Este repositório contém uma API RESTful para gerenciamento de usuários, desenvolvida com **ASP.NET Web API (.NET 10, C# 14)** no **Visual Studio 2026 Insiders**, utilizando **Entity Framework Core** e **SQL Server**, com **autenticação baseada em JWT**.

O projeto também inclui um **Front End moderno e enxuto em JavaScript puro**, criado para consumir a API e validar todas as operações CRUD (Create, Read, Update, Delete), com foco em UX, validações e feedbacks claros ao usuário.

---

## Arquitetura do Projeto

- **Back-end**
  - ASP.NET Web API (.NET 10, C# 14)
  - Entity Framework Core
  - SQL Server
  - Autenticação JWT
  - Separação por camadas (Controllers, Domain, Infrastructure)

- **Front-end**
  - JavaScript puro (Vanilla JS)
  - HTML5 + CSS moderno
  - Comunicação via Fetch API
  - Gerenciamento de estado e autenticação via JWT

---

## Banco de Dados

O banco de dados utilizado é **SQL Server**.

Toda a estrutura do banco (schema, tabelas e relacionamentos) é gerenciada automaticamente pelo **Entity Framework Core Migrations**.

**Não é necessário criar tabelas manualmente ou executar scripts SQL.**

---

## Pré-requisitos

- **.NET SDK** compatível com .NET 10
- **SQL Server** (LocalDB, Express ou superior)
- **Entity Framework Core CLI**
- **Git**
- Navegador moderno (Chrome, Edge, Firefox)

---

## Criar o Banco de Dados e Estrutura (EF Core)

A API utiliza **Entity Framework Core Migrations** para criar e versionar o banco de dados automaticamente.  

1. Configure a string de conexão no arquivo `appsettings.Development.json` (não versionado no Git):

## Configuração de Segredos e Conexão com o Banco

A API utiliza um arquivo de configuração para armazenar:

- **String de conexão com o banco de dados** (`ConnectionStrings:DefaultConnection`)
- **Chave secreta** usada para geração de tokens JWT (`Jwt:SecretKey`)

1. No ambiente local, configure essas informações no arquivo `appsettings.Development.json` (não versionado no Git). Exemplo:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=PressDb;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "SecretKey": "SUA_CHAVE_SECRETA_AQUI"
  }
}

````

2. No diretório do projeto da API (WebApi), execute o comando para aplicar as migrations e criar o banco:

```
dotnet ef database update
```

3. Execute a API com F5 no Visual Studio ou via terminal:

```
dotnet run
```

4. Acesse a documentação interativa no Swagger:

http://localhost:5000/swagger/index.html

(5000 é a porta fixa, definida no Front End, em scripts/config.js);

## Endpoints da API

| Método | Endpoint          | Descrição                 |
| ------ | ----------------- | ------------------------- |
| POST   | `/api/users`      | Cadastrar novo usuário    |
| GET    | `/api/users`      | Listar todos os usuários  |
| GET    | `/api/users/{id}` | Listar usuário pelo ID    |
| PUT    | `/api/users/{id}` | Atualizar usuário pelo ID |
| DELETE | `/api/users/{id}` | Excluir usuário pelo ID   |

## Suporte

Qualquer dúvida ou sugestão, abra uma issue ou entre em contato: rafapress@yahoo.com
