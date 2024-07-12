const express = require('express')
const app = express()
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const mysql2 = require("mysql2");
const mysql = require('mysql2-promise');
const session = require('express-session')
const handlebars = require('handlebars')
const moment = require('moment'); 
const puppeteer = require('puppeteer')
const { resolve } = require('path');
const fs = require('fs');
const path = require('path')





handlebars.registerHelper('formatDate', function(date) {
  return moment(date).format('DD/MM/YYYY HH:mm:ss'); 
});

//BANCO DE DADOS
function conectiondb() {
  var con = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "thayanne",
    database: "prosabar",
  });
  con.connect((err) => {
    if (err) {
      console.log("Erro connecting to database...", err);
      return;
    }
    console.log("Connection established!");
  });
  return con;
}

app.engine(
  'handlebars',
exphbs.engine({
  defaultLayout: "main"
}))

app.set("view engine", "handlebars");

app.use(
  express.urlencoded({
    extended: true
  })
)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("public"))

// Configuração da sessão
app.use(session({
  secret: 'shhhhh', 
  resave: false,
  saveUninitialized: false
}));

// Middleware para verificar a sessão do usuário
function verificaAutenticacao(req, res, next) {
  if (req.session && req.session.usuario) {
    next();
  } else {
    res.status(401).json({ error: 'Não autorizado' });
  }
}


app.get("/", function(req, res){
  res.render('home')
})

app.get("/cardapio", function(req, res){
  res.render('cardapio')
})

app.get("/nossaequipe", function(req, res){
  res.render('equipe')
})

app.get("/contato", function(req, res){
  res.render('contato')
})

app.post('/sendmessage', function(req, res){
      const name = req.body.name
      const email = req.body.email
      const assunto = req.body.subject
      const mensagem = req.body.message
      const user = "magichands611@gmail.com"
      const pass = "BD78F888E8F6EE23D6552D6322F7C31B12BB"
      //magichands123 (SENHA EMAIL)

      const transporter = nodemailer.createTransport({
          host: "smtp.elasticemail.com",
          port: 2525,
          auth: {user, pass}
      })
      transporter.sendMail({
          from: user,
          to: user,
          replyTo: email,
          subject: assunto,
          text: mensagem
      }).then(info =>{
          res.redirect('/')
      }).catch(error => {
          res.send(error)
      })
    })




app.post('/sendcontact', function assync(req, res){
  const name = req.body.name
  const email = req.body.email
  const assunto = req.body.subject
  const mensagem = req.body.message
  const user = "magichands611@gmail.com"
  const pass = "BD78F888E8F6EE23D6552D6322F7C31B12BB"
      //magichands123 (SENHA EMAIL)

  const transporter = nodemailer.createTransport({
      host: "smtp.elasticemail.com",
      port: 2525,
      auth: {user, pass}
  })
  transporter.sendMail({
      from: user,        
      to: user,
      replyTo: email,
      subject: assunto,
      text: mensagem
  }).then(info =>{
      res.render('contato', {enviado: true})
  }).catch(error => {
      res.send(error)
  })
}
)

app.get("/login", function(req, res){
  res.render('login')
})

app.post('/login', (req, res) => {
  var con = conectiondb();
  const { email, senha } = req.body;
  const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
  con.query(sql, [email, senha], (err, results) => {
    con.end();
    if (err) {
      console.error('Erro ao executar a consulta', err);
      return res.render('login', { erro: true });
    }
    if (results.length > 0) {
      req.session.usuario = results[0]; 
      return res.redirect('/staff');
    } else {
      return res.render('login', { erro: true });
    }
  });
});


//ROTAS STAFF
app.get("/staff", function (req, res) {
  var con = conectiondb();
  let query2 = "SELECT * FROM clientes";
  con.query(query2, function (erro, retorno) {
    res.render("orderHome", { clientes: retorno });
  });
});

app.get("/addestoque", function (req, res) {
  res.render("addestoque");
});

app.get("/showestoque", function (req, res) {
  var con = conectiondb();
  function getestoquebebida(callback) {
    con.query("SELECT * FROM estoquebebida", (error, results, fields) => {
      if (error) {
        console.error("Erro ao buscar dados", error);
        callback(error, null);
        return;
      }
      callback(null, results);
    });
  }
  function getestoquediverso(callback) {
    con.query("SELECT * FROM estoquediverso", (error, results, fields) => {
      if (error) {
        console.error("Erro ao buscar dados", error);
        callback(error, null);
        return;
      }
      callback(null, results);
    });
  }
  function getestoquecozinha(callback) {
    con.query("SELECT * FROM estoquecozinha", (error, results, fields) => {
      if (error) {
        console.error("Erro ao buscar dados", error);
        callback(error, null);
        return;
      }
      callback(null, results);
    });
  }
  getestoquebebida((err1, estoquebebida) => {
    if (err1) {
      res.status(500).send("Erro ao buscar dados");
      return;
    }
    getestoquediverso((err2, estoquediverso) => {
      if (err2) {
        res.status(500).send("Erro ao buscar dados");
        return;
      }
      getestoquecozinha((err3, estoquecozinha) => {
        if (err3) {
          res.status(500).send("Erro ao buscar dados");
          return;
        }
        res.render("showEstoque", {
          estoquebebida,
          estoquediverso,
          estoquecozinha,
        });
      });
    });
  });
});

app.post("/insertestoquebebida", function (req, res) {
  const item = req.body.item;
  const qtde = req.body.qtde;
  const valorunit = req.body.valorunit;
  var con = conectiondb();
  var query = "INSERT INTO estoquebebida(??, ??, ??) VALUES (?, ?, ?)";
  const data = ["item", "qtde", "valorunit", item, qtde, valorunit];
  con.query(query, data, function (err) {
    if (err) {
      res.render("addEstoque", { erro: true });
    } else {
      res.render("addEstoque", { cadastrado: true });
    }
  });
});

app.post("/insertestoquediverso", function (req, res) {
  const item = req.body.item;
  const qtde = req.body.qtde;
  const valorunit = req.body.valorunit;
  var con = conectiondb();
  var query = "INSERT INTO estoquediverso(??, ??, ??) VALUES (?, ?, ?)";
  const data = ["item", "qtde", "valorunit", item, qtde, valorunit];
  con.query(query, data, function (err) {
    if (err) {
      res.render("addEstoque", { erro: true });
    } else {
      res.render("addEstoque", { cadastrado: true });
    }
  });
});

app.post("/insertestoquecozinha", function (req, res) {
  const item = req.body.item;
  const qtde = req.body.qtde;
  const valorunit = req.body.valorunit;
  var con = conectiondb();
  var query = "INSERT INTO estoquecozinha(??, ??, ??) VALUES (?, ?, ?)";
  const data = ["item", "qtde", "valorunit", item, qtde, valorunit];
  con.query(query, data, function (err) {
    if (err) {
      res.render("addEstoque", { erro: true });
    } else {
      res.render("addEstoque", { cadastrado: true });
    }
  });
});

app.post("/editestoquebebida", function (req, res) {
  const item = req.body.item;
  const qtde = req.body.qtde;
  const valorunit = req.body.valorunit;
  var con = conectiondb();
  var query = "UPDATE estoquebebida SET ?? = ?, ?? = ? WHERE ?? = ?";
  const data = ["qtde", qtde, "valorunit", valorunit, "item", item];
  con.query(query, data, function (err) {
    if (err) {
      res.status(500).send("Erro ao atualizar");
      return;
    }
    res.redirect("/showestoque");
  });
});
app.post("/editestoquediverso", function (req, res) {
  const item = req.body.item;
  const qtde = req.body.qtde;
  const valorunit = req.body.valorunit;
  var con = conectiondb();
  var query = "UPDATE estoquediverso SET ?? = ?, ?? = ? WHERE ?? = ?";
  const data = ["qtde", qtde, "valorunit", valorunit, "item", item];
  con.query(query, data, function (err) {
    if (err) {
      res.status(500).send("Erro ao atualizar");
      return;
    }
    res.redirect("/showestoque");
  });
});

app.post("/editestoquecozinha", function (req, res) {
  const item = req.body.item;
  const qtde = req.body.qtde;
  const valorunit = req.body.valorunit;
  var con = conectiondb();
  var query = "UPDATE estoquecozinha SET ?? = ?, ?? = ? WHERE ?? = ?";
  const data = ["qtde", qtde, "valorunit", valorunit, "item", item];
  con.query(query, data, function (err) {
    if (err) {
      res.status(500).send("Erro ao atualizar");
      return;
    }
    res.redirect("/showestoque");
  });
});

app.get('/logout', verificaAutenticacao, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.redirect('/');
  });
});

app.post("/dropestoquebebida/:item", function (req, res) {
  const item = req.params.item;
  var con = conectiondb();
  var query = "DELETE FROM estoquebebida WHERE ?? = ?";
  const data = ["item", item];
  con.query(query, data, function (err) {
    if (err) {
      res.status(500).send("Erro ao atualizar");
      return;
    }
    res.redirect("/showestoque");
  });
});

app.post("/dropestoquediverso/:item", function (req, res) {
  const item = req.params.item;
  var con = conectiondb();
  var query = "DELETE FROM estoquediverso WHERE ?? = ?";
  const data = ["item", item];
  con.query(query, data, function (err) {
    if (err) {
      res.status(500).send("Erro ao atualizar");
      return;
    }
    res.redirect("/showestoque");
  });
});

app.post("/dropestoquecozinha/:item", function (req, res) {
  const item = req.params.item;
  var con = conectiondb();
  var query = "DELETE FROM estoquecozinha WHERE ?? = ?";
  const data = ["item", item];
  con.query(query, data, function (err) {
    if (err) {
      res.status(500).send("Erro ao atualizar");
      return;
    }
    res.redirect("/showestoque");
  });
});

app.post("/insertComanda", function (req, res) {
  const comanda = req.body.comanda;
  const nome = req.body.nome;
  const telefone = req.body.telefone;
  const apto = req.body.apto;
  const obs = req.body.obs;
  var con = conectiondb();
  var query = "INSERT INTO clientes(??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?)";
  const data = [
    "comanda",
    "nome",
    "telefone",
    "apto",
    "obs",
    comanda,
    nome,
    telefone,
    apto,
    obs,
  ];
  con.query(query, data, function (err) {
    if (err) {
      res.render("orderHome", { erro: true });
    } else {
      res.render("orderHome", { cadastrado: true });
    }
  });
});

app.get("/searchcomanda/:comanda", function (req, res) {
  var con = conectiondb();
  function getestoquebebida(callback) {
    con.query("SELECT * FROM estoquebebida", (error, results, fields) => {
      if (error) {
        console.error("Erro ao buscar dados", error);
        callback(error, null);
        return;
      }
      callback(null, results);
    });
  }
  function getestoquediverso(callback) {
    con.query("SELECT * FROM estoquediverso", (error, results, fields) => {
      if (error) {
        console.error("Erro ao buscar dados", error);
        callback(error, null);
        return;
      }
      callback(null, results);
    });
  }
  function getestoquecozinha(callback) {
    con.query("SELECT * FROM estoquecozinha", (error, results, fields) => {
      if (error) {
        console.error("Erro ao buscar dados", error);
        callback(error, null);
        return;
      }
      callback(null, results);
    });
  }
  const query2 = `SELECT * FROM clientes WHERE comanda = ${req.params.comanda}`;
  con.query(query2, function (err, retorno) {
    getestoquebebida((err1, estoquebebida) => {
      if (err1) {
        res.status(500).send("Erro ao buscar dados");
        return;
      }
      getestoquediverso((err2, estoquediverso) => {
        if (err2) {
          res.status(500).send("Erro ao buscar dados");
          return;
        }
        getestoquecozinha((err3, estoquecozinha) => {
          if (err3) {
            res.status(500).send("Erro ao buscar dados");
            return;
          }
    res.render("orderInsert", { estoquecozinha, estoquebebida, estoquediverso, clientes: retorno[0] });
  });
});
    })
  })
})

app.get('/fecharcomanda/:comanda', function (req, res) {
  var con = conectiondb(); 
  const query = `SELECT * FROM pedidos WHERE comanda = ${req.params.comanda}`;
  con.query(query, function (err, resultados) {   
    if (err) throw err;
    let total = 0;
    resultados.forEach(pedido => {
      total += pedido.qtde * pedido.valorunit;
    });
    res.render("conta", { pedidos: resultados, total: total, comanda: req.params.comanda });
  });
});


app.get('/zerarcomanda/:comanda', (req, res) => {
  const comanda = req.params.comanda;
  var con = conectiondb(); // Assumindo que conectiondb() é uma função para obter a conexão com o banco de dados

  const sql = 'UPDATE pedidos SET comanda = NULL WHERE comanda = ?';

  con.query(sql, [comanda], (err, result) => {
      if (err) {
          console.error('Erro ao zerar comanda:', err);
          res.status(500).json({ error: 'Erro interno ao processar a requisição' });
          return;
      }
      console.log(`Comanda ${comanda} zerada com sucesso`);
      res.redirect(`/fecharcomanda/${comanda}`);
  });
});


app.post('/saveSelectedItems', (req, res) => {
    const { comanda, selectedItems, obs } = req.body;
    var con = conectiondb();
    const itemsArray = JSON.parse(selectedItems);
  
    itemsArray.forEach(item => {
      const { item: itemName, qtde, valorunit } = item;
      const query = `INSERT INTO pedidos (comanda, item, qtde, valorunit, obs) VALUES (?, ?, ?, ?, ?)`;
      const values = [comanda, itemName, qtde, valorunit, obs];
  
      con.query(query, values, (err, result) => {
        if (err) {
          console.error('Erro ao inserir pedido no banco de dados: ' + err.stack);
        } else {
          console.log('Pedido inserido com sucesso:', result.insertId);
        }
      });
    });  
    res.render('orderHome', { pedido: true });
  });

    
app.listen(8000)