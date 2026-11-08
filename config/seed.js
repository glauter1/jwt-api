const User = require('../user/user.model');
const userService = require('../user/user.service');

const seedAdmin = async () => {
    const existeAdmin = await User.findOne({ where: { isAdmin: true } });
    if (existeAdmin) return;

    const email = process.env.ADMIN_EMAIL || 'admin@biblioteca.com';

    await userService.create({
        name: 'Administrador',
        username: 'admin',
        email,
        password: process.env.ADMIN_PASSWORD || '123456',
        isAdmin: true
    });

    console.log('Admin inicial criado: ' + email);
};

module.exports = seedAdmin;