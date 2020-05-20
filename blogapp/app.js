const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin');//criando uma constante para armazenar os arquivos externos
const path = require('path');//serve para trabalhar com diretórios
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
// Carerragando o model de postagens para exibir na pagina principal
require('./models/Postagem');
const Postagem = mongoose.model('postagens');
// Carregando o model de categorias
require('./models/Categoria');
const Categoria = mongoose.model('categorias');
const usuarios = require('./routes/usuario');
//chamnado o passport
const passport = require('passport')
require('./config/auth')(passport);

// CONFIGURAÇÕES
    // SESSÃO
        app.use(session({
            secret: 'cursodenode',
            resave: true,
            saveUninitialized: true,
        }));
    // PASSPORT
        app.use(passport.initialize());
        app.use(passport.session());
    // FLASH - tem que ficar logo abaixo da sessão
        app.use(flash());
    // MIDDLEWARE
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg');
            res.locals.error_msg = req.flash('error_msg');
            res.locals.error = req.flash('error');
            res.locals.user = req.user || null;//essa variavel vai armazenar os dados dos usuarios autenticados. o req.user armazena dados do usuario logado, aí se não tiver nenhum usuario logado vai ser passado um valor null pra variavel
            next();
        })
    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayouts: 'main'}));
        app.set('view engine', 'handlebars');
    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/blogapp").then(() => {
            console.log('Conectado ao mongo');        
        }).catch((err) => {
            console.log("erro ao conectar");
        })
    // Public
        app.use(express.static(path.join(__dirname, 'public')));//esptamos falando pro express que a pasta que está guardando todos os nossos arquivos estáticos é a pasta public
        // Criando um middleware
        // app.use((req, res, next) => {
        //     console.log('oi, eu sou um midlleware');
        //     next();
        // })

// ROTAS
    app.get('/', (req, res) => {
        Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
            res.render('index', {postagens: postagens});//passando as postagens para dentro da view
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno');
            res.redirect('/404');
        })
    });

    app.get('/postagem/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug}).then((postagem) => {
            if(postagem){
                res.render('postagem/index', {postagem: postagem})
            }else{
                req.flash('error_msg', 'Esta postagem não existe');
                res.redirect('/');
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno.');
            res.redirect('/');
        })
    })

    app.get('/categorias', (req, res) => {
        Categoria.find().then((categorias) => {
            res.render('categorias/index', {categorias: categorias});
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao listar categorias');
            res.redirect('/');
        })
    })

    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if(categoria){
                
                Postagem.find({categoria: categoria._id}).then((postagens) => {
                    
                    res.render('categorias/postagens', {postagens: postagens, categoria: categoria})

                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao listar os posts');
                    res.redirect('/');
                })

            }else{
                req.flash('error_msg', "Essa categoria não existe.")
                res.redirect('/');
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao carregar a pagina desta categoria')
            res.redirect("/")
        })
    })

    app.get('/404', (req, res) => {
        res.send('Erro 404!');
    })

    app.get('/posts', (req, res) => {
        res.send('Lista de posts');
    });



    app.use('/admin', admin);//o segundo paramentro é a constante declara no inicio.
    app.use('/usuarios', usuarios);

// OUTROS
const PORT = 8081;
app.listen(PORT, ()=>{
    console.log('Servidor rodando!');
});