const Author = require('./author.model');

const authorService = {
    create: async (data) => {
        return await Author.create(data);
    },

    findAll: async () => {
        return await Author.findAll();
    },

    findById: async (id) => {
        return await Author.findByPk(id);
    },

    update: async (id, data) => {
        const author = await Author.findByPk(id);
        if (!author) return null;
        await author.update(data);
        return author;
    },

    remove: async (id) => {
        const author = await Author.findByPk(id);
        if (!author) return null;

        const totalBooks = await author.countBooks();
        if (totalBooks > 0) {
            const error = new Error('Não é possível excluir: este autor possui livros cadastrados');
            error.status = 409;
            throw error;
        }

        await author.destroy();
        return author;
    }
};

module.exports = authorService;