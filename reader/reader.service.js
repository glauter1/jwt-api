const Reader = require('./reader.model');
const Loan = require('../loan/loan.model');
const Book = require('../book/book.model');
const { comStatus } = require('../loan/loan.utils');

const criarErro = (mensagem, status) => {
    const error = new Error(mensagem);
    error.status = status;
    return error;
};

const tratarErroBanco = (error) => {
    if (error.name === 'SequelizeUniqueConstraintError') {
        const campo = error.errors && error.errors[0] ? error.errors[0].path : 'campo';
        return criarErro('Já existe um leitor com este ' + campo, 409);
    }
    if (error.name === 'SequelizeValidationError' && error.errors && error.errors.length > 0) {
        const detalhes = error.errors.map((e) => e.message).join('; ');
        return criarErro('Dados inválidos: ' + detalhes, 400);
    }
    return error;
};

const readerService = {
    create: async (data) => {
        try {
            return await Reader.create(data);
        } catch (error) {
            throw tratarErroBanco(error);
        }
    },

    findAll: async () => {
        return await Reader.findAll({ order: [['name', 'ASC']] });
    },

    findById: async (id) => {
        return await Reader.findByPk(id);
    },

    update: async (id, data) => {
        const reader = await Reader.findByPk(id);
        if (!reader) return null;

        try {
            await reader.update(data);
        } catch (error) {
            throw tratarErroBanco(error);
        }
        return reader;
    },

    findLoans: async (id) => {
        const reader = await Reader.findByPk(id);
        if (!reader) return null;

        const loans = await Loan.findAll({
            where: { readerId: id },
            include: Book,
            order: [['id', 'DESC']]
        });

        return loans.map(comStatus);
    }
};

module.exports = readerService;