const { Op } = require('sequelize');
const Book = require('../book/book.model');
const Loan = require('../loan/loan.model');
const { hoje } = require('../loan/loan.utils');

const reportService = {
    dashboard: async () => {
        const totalBooks = await Book.count();
        const totalCopies = (await Book.sum('totalCopies')) || 0;
        const availableCopies = (await Book.sum('availableCopies')) || 0;
        const activeLoans = await Loan.count({ where: { returnDate: null } });
        const overdueLoans = await Loan.count({
            where: { returnDate: null, dueDate: { [Op.lt]: hoje() } }
        });
        const totalFines = (await Loan.sum('fine')) || 0;

        return { totalBooks, totalCopies, availableCopies, activeLoans, overdueLoans, totalFines };
    }
};

module.exports = reportService;