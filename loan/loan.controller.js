const loanService = require('./loan.service');

const loanController = {
    create: async (req, res) => {
        try {
            const loan = await loanService.create(req.body, req.user.id);
            res.status(201).json(loan);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    devolver: async (req, res) => {
        try {
            const loan = await loanService.devolver(req.params.id);
            if (!loan) {
                return res.status(404).json({ error: 'Loan not found' });
            }
            res.json(loan);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    findAll: async (req, res) => {
        try {
            const loans = await loanService.findAll(req.query);
            res.json(loans);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    }
};

module.exports = loanController;