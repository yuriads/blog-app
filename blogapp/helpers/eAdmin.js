module.exports = {
    eAdmin: function(req, res, next) {
        if(req.isAuthenticated() && req.user.eAdmin == 1){//essa função serve para saber se um certo usuario esta autenticado ou não
            return next();
        }
        req.flash('error_msg', 'Você precisa ser um Admin!');
        res.redirect('/');
    }
}