const authService = require('./auth.service');

const authController = {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json(result);
        } catch (error) {
            res.status(error.status || 401).json({ error: error.message });
        }
    },

    async refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ error: 'refreshToken é obrigatório' });
            }
            const tokens = await authService.refresh(refreshToken);
            res.json(tokens);
        } catch (error) {
            res.status(error.status || 401).json({ error: error.message });
        }
    },

    async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ error: 'refreshToken é obrigatório' });
            }
            await authService.logout(refreshToken);
            res.json({ message: 'Logout successful' });
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    async me(req, res) {
        try {
            const user = await authService.me(req.user.id);
            res.json(user);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    }
};

module.exports = authController;