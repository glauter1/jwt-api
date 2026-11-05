const { Sequelize } = require('sequelize');
const User = require('../user/user.model');
const Book = require('../book/book.model');
const Author = require('../author/author.model');
const Category = require('../category/category.model');
const Loan = require('../loan/loan.model');
const Reader = require('../reader/reader.model');
const RefreshToken = require('../auth/refreshToken.model');

// 1. Livro e Categoria (1:N)
Category.hasMany(Book, { foreignKey: 'categoryId' });
Book.belongsTo(Category, { foreignKey: 'categoryId' });

// 2. Livro e Autor (N:N) - O Sequelize cria a tabela intermediária 'BookAuthor' sozinho
Author.belongsToMany(Book, { through: 'BookAuthor', foreignKey: 'authorId' });
Book.belongsToMany(Author, { through: 'BookAuthor', foreignKey: 'bookId' });

// 3. Empréstimos (Loan) - Recebe 3 chaves estrangeiras (Leitor, Livro e Atendente)
Reader.hasMany(Loan, { foreignKey: 'readerId' });
Loan.belongsTo(Reader, { foreignKey: 'readerId' });

Book.hasMany(Loan, { foreignKey: 'bookId' });
Loan.belongsTo(Book, { foreignKey: 'bookId' });

User.hasMany(Loan, { foreignKey: 'userId' });
Loan.belongsTo(User, { foreignKey: 'userId' });

// 4. Autenticação: User e RefreshToken (1:N)
User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });


module.exports = {
  db,
  User,
  Book,
  Author,
  Category,
  Loan,
  Reader,
  RefreshToken
};