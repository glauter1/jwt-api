const { Op } = require('sequelize');
const Book = require('./book.model');
const Category = require('../category/category.model');
const Author = require('../author/author.model');
const Loan = require('../loan/loan.model');

const criarErro = (mensagem, status) => {
    const error = new Error(mensagem);
    error.status = status;
    return error;
};
const tratarErroBanco = (error) => {
    console.error(error);
    if (error.errors && error.errors.length > 0) {
        const detalhes = error.errors.map((e) => e.path + ' - ' + e.message).join('; ');
        const status = error.name === 'SequelizeUniqueConstraintError' ? 409 : 400;
        return criarErro('Dados inválidos: ' + detalhes, status);
    }
    return error;
};

const validarRelacionamentos = async (categoryId, authorIds) => {
    if (categoryId) {
        const category = await Category.findByPk(categoryId);
        if (!category) throw criarErro('Categoria não encontrada', 400);
    }

    if (authorIds && authorIds.length > 0) {
        const encontrados = await Author.count({ where: { id: authorIds } });
        if (encontrados !== authorIds.length) {
            throw criarErro('Um ou mais autores não existem', 400);
        }
    }
};

const bookService = {
    create: async (data) => {
        const { authorIds, ...bookData } = data;

        if (!bookData.categoryId) {
            throw criarErro('A categoria é obrigatória', 400);
        }
        await validarRelacionamentos(bookData.categoryId, authorIds);

        bookData.availableCopies = bookData.totalCopies || 1;

        let book;
        try {
            book = await Book.create(bookData);
              if (authorIds) await book.setAuthors(authorIds);
        } catch (error) {
            throw tratarErroBanco(error);
        }

      

        return await Book.findByPk(book.id, { include: [Category, Author] });
    },

    findAll: async (filters) => {
        const where = {};
        if (filters.title) where.title = { [Op.like]: `%${filters.title}%` };
        if (filters.categoryId) where.categoryId = filters.categoryId;
        if (filters.available === 'true') where.availableCopies = { [Op.gt]: 0 };

        const authorInclude = { model: Author, through: { attributes: [] } };
        if (filters.authorId) authorInclude.where = { id: filters.authorId };

        return await Book.findAll({ where, include: [Category, authorInclude] });
    },

    findById: async (id) => {
        return await Book.findByPk(id, { include: [Category, Author] });
    },

    update: async (id, data) => {
        const book = await Book.findByPk(id);
        if (!book) return null;

        const { authorIds, ...bookData } = data;
        delete bookData.availableCopies;

        await validarRelacionamentos(bookData.categoryId, authorIds);

        if (bookData.totalCopies !== undefined) {
            const diferenca = bookData.totalCopies - book.totalCopies;
            const novoDisponivel = book.availableCopies + diferenca;
            if (novoDisponivel < 0) {
                throw criarErro('O total de exemplares não pode ser menor que a quantidade emprestada', 400);
            }
            bookData.availableCopies = novoDisponivel;
        }

        try {
            await book.update(bookData);
        } catch (error) {
            throw tratarErroBanco(error);
        }

        if (authorIds) await book.setAuthors(authorIds);

        return await Book.findByPk(id, { include: [Category, Author] });
    },

    remove: async (id) => {
        const book = await Book.findByPk(id);
        if (!book) return null;

        const emprestimosAtivos = await Loan.count({
            where: { bookId: id, returnDate: null }
        });
        if (emprestimosAtivos > 0) {
            throw criarErro('Não é possível excluir: este livro possui empréstimos ativos', 409);
        }

        await book.destroy();
        return book;
    }
};

module.exports = bookService;