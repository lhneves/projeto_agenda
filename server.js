//Utilização do Dotenv para esconder chaves - CONNECTIONSTRING
require("dotenv").config();
//Requisições do express
const express = require("express");
const app = express();
//Conexão base de dados
const mongoose = require("mongoose");
mongoose
  .connect(process.env.CONNECTIONSTRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    app.emit("pronto");
  })
  .catch((e) => console.log(e));

//Criação de seções com express-session
const session = require("express-session");
const MongoStore = require("connect-mongo");
//Utilização de flash messages
const flash = require("connect-flash");
//Utilização de rotas
const routes = require("./routes");
//Path
const path = require("path");
//Segurança CSRF e HELMET
const helmet = require("helmet");
const csrf = require("csurf");
//Utilizando middlewares - Esses middlewares acontecem sempre que o aplicativo receber uma solicitação.
const {
  middlewareGlobal,
  checkCsrfError,
  csrfMiddleware,
} = require("./src/middlewares/middleware");

//Configuração de qual biblioteca utilizar para o parsing - Precisamos para o PUT e POST
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "public")));

app.set("views", path.resolve(__dirname, "src", "views"));
//Setando como as views se comportarão
app.set("view engine", "ejs");

//Setando as opções da seção e guardando na base de dados
const sessionOptions = session({
  secret: "realmente qualquer coisa",
  store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
});
app.use(sessionOptions);
app.use(flash());

app.use(helmet());
app.use(csrf());

app.use(middlewareGlobal);
app.use(checkCsrfError);
app.use(csrfMiddleware);

app.use(routes);

//Colocar para rodar a aplicação
app.on("pronto", () => {
  app.listen(3000, () => {
    console.log("Acessar http://localhost:3000");
    console.log("Servidor executando na porta 3000");
  });
});
