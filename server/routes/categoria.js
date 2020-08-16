const express = require('express');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

const Categoria = require('../models/categoria');

const _ = require('underscore');


// =============================
// Mostrar todas las categorias
// =============================
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {

            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments((err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    nroRegistros: conteo
                });
            });

        });
});

// =============================
// Mostrar una categoria por ID
// =============================
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    // Categoria.findById(.....);
    Categoria.findById(id, (err, categoria) => {

        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoria) {
            res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }

        res.json({
            ok: true,
            categoria
        });

    });

});

// =============================
// Crear nueva categoria
// =============================
app.post('/categoria', verificaToken, (req, res) => {
    // que pase el token verificaToken
    // regresa la nueva categoria
    // req.usuario._id
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

// =============================
// Actualizar categoria
// =============================
app.put('/categoria/:id', verificaToken, (req, res) => {
    //Basta con que actualicemos la descripción de la categoria 
    let id = req.params.id;
    let body = _.pick(req.body, ['descripcion']);

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

// =============================
// Borrar una categoria
// =============================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    // Solo un admi puede borrar categorias,
    // Quiero que se elimine fisicamente (findByIdAndRemove)
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, { new: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: `Categoria ${categoriaDB.descripcion} borrada`
        });

    });

});



module.exports = app;