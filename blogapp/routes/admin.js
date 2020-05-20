const express = require('express');
const router = express.Router();//esse componente que usamos para criar rotas em arquivos separados

// Para cadastrar no BD... Usando o model de forma externa
const mongoose = require('mongoose');
require('../models/Categoria');//carregando aqui dentro o nosso model de Categoria
const Categoria = mongoose.model('categorias');//esse categorias é o nome que está dentro do arquivo Categorias.js
// Para cadastrar postagens no BD
require('../models/Postagem');//carregando aqui dentro o nosso model de Postagem
const Postagem = mongoose.model('postagens');
const {eAdmin} = require('../helpers/eAdmin');


router.get('/', eAdmin, (req, res) => {
    res.render('admin/index');
});

router.get('/posts', eAdmin, (req, res) => {
    res.send('Página de posts');
});

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render('admin/categorias', {categorias: categorias});//passando as categorias para a pagina
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias.');
        res.redirect('/admin');
    })
});

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategorias');
});

router.post('/categorias/nova', eAdmin, (req, res) => {

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"});
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido'});
    }

    if(req.body.nome.length < 2) {
        erros.push({texto: 'Nome muito pequeno'});
    }

    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros});
    }else{
        //guardando dentro do objeto o nome e o slug
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug,
        }
            //criando uma nova gategoria
        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!');//estamos passando uma mensagem de sucesso para dentro de nossa variável global success_msg
            res.redirect('/admin/categorias');
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro ao salvar a categoria, tente novamente.");//estamos passando uma mensagem de erro para dentro de nossa variável global error_msg
            res.redirect('/admin');
        })
    }
})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    //procrando um regitro que tenha um id igual ao que foi passasdo por parametro
    Categoria.findOne({_id: req.params.id}).then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria});
    }).catch((err) => {
        req.flash('error_msg', 'Essa categoria não existe');
        res.redirect('/admin/categorias');
    })
})

router.post('/categorias/edit', eAdmin, (req, res)=>{
    Categoria.findOne({_id: req.body.id}).then((categoria)=>{
        categoria.nome = req.body.nome;//aqui vamos pegar o campo nome da categoria que a gente quer editar e vamos atribuir a esse nome exatamente o valor que está vindo lá do formulário de edição
        categoria.slug = req.body.slug;

        categoria.save().then(() => {
            req.flash('success_msg', 'Categoria editada com sucesso!');
            res.redirect('/admin/categorias');
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro ao salvar a edição da categoria");
            res.redirect('/admin/categorias');
        })
    }).catch((err) => {
        req.flash("error_msg",'Houve um erro ao editar a categoria.');
        res.redirect("/admin/categorias");
    })
})

router.post('/categorias/deletar', eAdmin, (req, res) => {
    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Categoria deletada com sucesso!");
        res.redirect('/admin/categorias');
    }).catch((err)=>{
        req.flash('error_msg',"Houve um erro ao deletar a categoria");
        res.redirect('/admin/categorias');
    })
})


router.get("/postagens", eAdmin, (req, res) => {

    //o populate serve para pegar o nome da categoria de cada post
    Postagem.find().populate('categoria').sort({data:"desc"}).then((postagens)=>{
        res.render('admin/postagens', {postagens: postagens})
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao listar as postagens")
        res.redirect('/admin');
    })

});

router.get('/postagens/add', eAdmin, (req, res) => {
    //passa todas as nossa categorias para dentro da nossa view de postagem
    Categoria.find().then((categorias) => {
        res.render('admin/addpostagem',{categorias: categorias});//esse objeto significa que estamos enviando categorias para dentro das nossas views
    }).catch((err) => {
        req.flash('error_msg', "houve um erro ao carregar o formulário");
        res.redirect('/admin');
    })
})

router.post('/postagens/nova', eAdmin, (req, res) => {

    var erros= [];

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria!"})
    }

    if(erros.length > 0){
        res.render('admin/addpostagem', {erros: erros})
    }else{
        const NovaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug,
        }

        new Postagem(NovaPostagem).save().then(()=> {
            req.flash('success_msg',"Postagem cadastrada com sucesso!");
            res.redirect('/admin/postagens');
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro durante o salvamento da postagem');
            res.redirect('/admin/postagens');
        })
    }
})

router.get('/postagens/edit/:id', eAdmin, (req, res) => {

    Postagem.findOne({_id: req.params.id}).then((postagem) => {

        Categoria.find().then((categorias) => {
    res.render('admin/editpostagens',{categorias: categorias, postagem: postagem})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias');
            res.redirect('/admin/postagens');
        })

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar fomulário de edição.');
        res.redirect('/admin/postagens');
    })
})

router.post('/postagem/edit', eAdmin, (req, res) => {

    Postagem.findOne({_id: req.body.id}).then((postagem) => {

        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        postagem.save().then(() => {
            req.flash('success_msg', "Postagem editada com sucesso!");
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao editar postagem');
            res.redirect('/admin/postagens');
        })

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao slavar a edição');
        res.redirect('/admin/postagens');
    })

})

router.get('/postagens/deletar/:id', eAdmin, (req, res) => {
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada!')
        res.redirect('/admin/postagens');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno');
        res.redirect("/admin/postagens");
    })
})

module.exports = router;