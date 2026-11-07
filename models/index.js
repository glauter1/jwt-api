const User = require('../user/user.model');
const Category = require('../category/category.model');
const Author = require('../author/author.model');
const Book = require('../book/book.model');
const Reader = require('../reader/reader.model');
const Loan = require('../loan/loan.model');
const RefreshToken = require('../auth/refreshToken.model');

// 1:N, uma categoria tem vários livros
Category.hasMany(Book, { foreignKey: 'categoryId' });
Book.belongsTo(Category, { foreignKey: 'categoryId' });

// N:N, um livro tem vários autores e um autor tem vários livros
Book.belongsToMany(Author, { through: 'BookAuthor' });
Author.belongsToMany(Book, { through: 'BookAuthor' });

// um empréstimo pertence a um livro, um leitor e um atendente
Book.hasMany(Loan, { foreignKey: 'bookId' });
Loan.belongsTo(Book, { foreignKey: 'bookId' });

Reader.hasMany(Loan, { foreignKey: 'readerId' });
Loan.belongsTo(Reader, { foreignKey: 'readerId' });

User.hasMany(Loan, { foreignKey: 'userId' });
Loan.belongsTo(User, { foreignKey: 'userId' });

// um usuário tem vários refresh tokens
User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

module.exports = { User, Category, Author, Book, Reader, Loan, RefreshToken };