const { Op } = require('sequelize');
const db = require('../config/db');
const Loan = require('./loan.model');
const Book = require('../book/book.model');
const Reader = require('../reader/reader.model');
const User = require('../user/user.model');
const { PRAZO_DIAS, MULTA_POR_DIA, hoje, somarDias, diferencaDias, comStatus } = require('./loan.utils');

const LIMITE_EMPRESTIMOS = 3;

const criarErro = (mensagem, status) => {
    const error = new Error(mensagem);
    error.status = status;
    return error;
};

const incluir = [Book, Reader, { model: User, attributes: ['id', 'name'] }];

const buscarCompleto = async (id) => {
    const loan = await Loan.findByPk(id, { include: incluir });
    return comStatus(loan);
};

const loanService = {
    create: async (data, userId) => {
        const { bookId, readerId } = data;
        if (!bookId || !readerId) {
            throw criarErro('bookId e readerId são obrigatórios', 400);
        }

        const idEmprestimo = await db.transaction(async (t) => {
            const book = await Book.findByPk(bookId, { transaction: t });
            if (!book) throw criarErro('Livro não encontrado', 404);

            const reader = await Reader.findByPk(readerId, { transaction: t });
            if (!reader) throw criarErro('Leitor não encontrado', 404);

            if (book.availableCopies <= 0) {
                throw criarErro('Não há exemplares disponíveis deste livro', 409);
            }

            const ativos = await Loan.count({
                where: { readerId, returnDate: null },
                transaction: t
            });
            if (ativos >= LIMITE_EMPRESTIMOS) {
                throw criarErro('O leitor já atingiu o limite de ' + LIMITE_EMPRESTIMOS + ' empréstimos ativos', 409);
            }

            const atrasados = await Loan.count({
                where: { readerId, returnDate: null, dueDate: { [Op.lt]: hoje() } },
                transaction: t
            });
            if (atrasados > 0) {
                throw criarErro('O leitor possui empréstimo atrasado e não pode pegar novos livros', 409);
            }

            const dataHoje = hoje();
            const loan = await Loan.create({
                loanDate: dataHoje,
                dueDate: somarDias(dataHoje, PRAZO_DIAS),
                status: 'ATIVO',
                fine: 0,
                bookId,
                readerId,
                userId
            }, { transaction: t });

            await book.decrement('availableCopies', { by: 1, transaction: t });

            return loan.id;
        });

        return await buscarCompleto(idEmprestimo);
    },

    devolver: async (id) => {
        const idEmprestimo = await db.transaction(async (t) => {
            const loan = await Loan.findByPk(id, { transaction: t });
            if (!loan) return null;

            if (loan.returnDate) {
                throw criarErro('Este empréstimo já foi devolvido', 409);
            }

            const dataHoje = hoje();
            const diasAtraso = Math.max(0, diferencaDias(loan.dueDate, dataHoje));

            await loan.update({
                returnDate: dataHoje,
                status: 'DEVOLVIDO',
                fine: diasAtraso * MULTA_POR_DIA
            }, { transaction: t });

            await Book.increment('availableCopies', {
                by: 1,
                where: { id: loan.bookId },
                transaction: t
            });

            return loan.id;
        });

        if (!idEmprestimo) return null;
        return await buscarCompleto(idEmprestimo);
    },

    findAll: async (filters) => {
        const where = {};

        if (filters.status) {
            const status = String(filters.status).toUpperCase();
            if (status === 'DEVOLVIDO') {
                where.returnDate = { [Op.ne]: null };
            } else if (status === 'ATIVO') {
                where.returnDate = null;
                where.dueDate = { [Op.gte]: hoje() };
            } else if (status === 'ATRASADO') {
                where.returnDate = null;
                where.dueDate = { [Op.lt]: hoje() };
            } else {
                throw criarErro('O status deve ser ATIVO, ATRASADO ou DEVOLVIDO', 400);
            }
        }

        const loans = await Loan.findAll({
            where,
            include: incluir,
            order: [['id', 'DESC']]
        });

        return loans.map(comStatus);
    }
};

module.exports = loanService;