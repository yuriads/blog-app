const localStrategy = require('passport-local');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// Model de usuario
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');

module.exports = function(passport){

    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {//aqui significa qual campo a gente ta querendo analisar. depois passamos uma função de callback com três parâmetros
    
        Usuario.findOne({email: email}).then((usuario) => {//procura um usuário que tem um email igual ao que foi passado na autenticação
            if(!usuario){
                return done(null, false, {message: "Esta conta não existe"})//o done é uma função de callback. o primeiro parâmetro são os dados da conta que foram autenticada 'null', o segundo parametro é se a autenticação aconteceu com sucesso ou não 'false', o terceiro é a mensagem
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) => {//comparando dois valores incriptados

                if(batem){
                    return done(null, usuario);
                }else{
                    return done(null, false, {message: "Senha incorreta"})
                }

            })
        })
        
    }))

    // COM ESSAS DUAS FUNÇÕES SERVE PARA SALVAR OS DADDOS DOS USUÁRIOS DENTRO DE UMA SESSÃO
    // ENTRÃ ASSIM QUE O USUARIO LOGAR NO SITE OS DADOS SAO SALVOS EM UMA SESSAO

    //o serializeUser() serve para salvar os dados de um usuário dentro de uma sessão
    passport.serializeUser((usuario, done) => {
        //passa os dados de um usuario para dentro da sessão
        done(null, usuario.id)
    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario)
        })
    })
}