const bcrypt = require('bcrypt');
const User = require('./user.model');

const criarErro = (mensagem, status) => {
    const error = new Error(mensagem);
    error.status = status;
    return error;
};

const semSenha = (user) => {
    const { password, ...dados } = user.toJSON();
    return dados;
};

const userService = {
    create: async (userData) => {
        try {
            userData.password = await bcrypt.hash(userData.password, 10);
            const user = await User.create(userData);
            return semSenha(user);
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);
        }
    },

    findById: async (id) => {
        return await User.findByPk(id, { attributes: { exclude: ['password'] } });
    },

    findByEmail: async (email) => {
        return await User.findOne({ where: { email } });
    },

    findAll: async () => {
        return await User.findAll({ attributes: { exclude: ['password'] } });
    },

    update: async (id, data) => {
        const user = await User.findByPk(id);
        if (!user) return null;

        const { name, username, email, password, isAdmin } = data;
        const campos = { name, username, email, isAdmin };
        if (password) campos.password = await bcrypt.hash(password, 10);

        Object.keys(campos).forEach((chave) => {
            if (campos[chave] === undefined) delete campos[chave];
        });

        try {
            await user.update(campos);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw criarErro('E-mail ou username já está em uso', 409);
            }
            throw criarErro(error.message, 400);
        }

        return semSenha(user);
    },

    setActive: async (id, active) => {
        if (typeof active !== 'boolean') {
            throw criarErro('O campo active deve ser true ou false', 400);
        }

        const user = await User.findByPk(id);
        if (!user) return null;

        await user.update({ active });
        return semSenha(user);
    }
};

module.exports = userService;