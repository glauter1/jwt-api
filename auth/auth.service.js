const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userService = require('../user/user.service');
const RefreshToken = require('./refreshToken.model');

const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES || '15m';
const REFRESH_DAYS = 7;

const criarErro = (mensagem, status) => {
    const error = new Error(mensagem);
    error.status = status;
    return error;
};

const gerarAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES }
    );
};

const gerarRefreshToken = async (user) => {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ token, userId: user.id, expiresAt });
    return token;
};

const gerarPar = async (user) => {
    return {
        accessToken: gerarAccessToken(user),
        refreshToken: await gerarRefreshToken(user)
    };
};

const authService = {
    login: async (email, password) => {
        const user = await userService.findByEmail(email);
        if (!user) throw criarErro('Invalid email or password', 401);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw criarErro('Invalid email or password', 401);

        if (!user.active) throw criarErro('Usuário desativado', 403);

        const tokens = await gerarPar(user);
        return {
            ...tokens,
            user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }
        };
    },

    refresh: async (refreshToken) => {
        const stored = await RefreshToken.findOne({ where: { token: refreshToken } });
        if (!stored) throw criarErro('Refresh token inválido', 401);

        if (stored.revoked) {
            await RefreshToken.update({ revoked: true }, { where: { userId: stored.userId } });
            throw criarErro('Refresh token reutilizado. Faça login novamente', 401);
        }

        if (stored.expiresAt < new Date()) {
            throw criarErro('Refresh token expirado', 401);
        }

        const user = await userService.findById(stored.userId);
        if (!user || !user.active) throw criarErro('Usuário inválido', 401);

        stored.revoked = true;
        await stored.save();

        return await gerarPar(user);
    },

    logout: async (refreshToken) => {
        const stored = await RefreshToken.findOne({ where: { token: refreshToken } });
        if (stored) {
            stored.revoked = true;
            await stored.save();
        }
    },

    me: async (id) => {
        const user = await userService.findById(id);
        if (!user) throw criarErro('Usuário não encontrado', 404);
        return { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin, active: user.active };
    },

    verifyToken: async (token) => {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
};

module.exports = authService;