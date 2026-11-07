const Reader = require('./reader.model');
const Loan = require('../loan/loan.model');
const Book = require('../book/book.model');

const readerService = {
    create: async (data) => {
        return await Reader.create(data);
    },

    findAll: async () => {
        return await Reader.findAll();
    },

    findById: async (id) => {
        return await Reader.findByPk(id);
    },

    update: async (id, data) => {
        const reader = await Reader.findByPk(id);
        if (!reader) return null;
        await reader.update(data);
        return reader;
    },

    findLoans: async (id) => {
        const reader = await Reader.findByPk(id);
        if (!reader) return null;

        return await Loan.findAll({
            where: { readerId: id },
            include: Book
        });
    }
};

module.exports = readerService;