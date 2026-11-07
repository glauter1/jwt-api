const Category = require('./category.model');
const Book = require('../book/book.model');

const categoryService = {
    create: async (data) => {
        return await Category.create(data);
    },

    findAll: async () => {
        return await Category.findAll();
    },

    findById: async (id) => {
        return await Category.findByPk(id);
    },

    update: async (id, data) => {
        const category = await Category.findByPk(id);
        if (!category) return null;
        await category.update(data);
        return category;
    },

    remove: async (id) => {
        const category = await Category.findByPk(id);
        if (!category) return null;

        const totalBooks = await Book.count({ where: { categoryId: id } });
        if (totalBooks > 0) {
            const error = new Error('Não é possível excluir: existem livros nesta categoria');
            error.status = 409;
            throw error;
        }

        await category.destroy();
        return category;
    }
};

module.exports = categoryService;