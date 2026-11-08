const reportService = require('./report.service');

const reportController = {
    dashboard: async (req, res) => {
        try {
            const dados = await reportService.dashboard();
            res.json(dados);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    }
};

module.exports = reportController;