const diasPrazo = parseInt(process.env.LOAN_DAYS, 10);
const PRAZO_DIAS = Number.isNaN(diasPrazo) ? 7 : diasPrazo;
const MULTA_POR_DIA = 1;

const formatar = (data) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
};

const hoje = () => formatar(new Date());

const somarDias = (dataTexto, dias) => {
    const [ano, mes, dia] = dataTexto.split('-').map(Number);
    return formatar(new Date(ano, mes - 1, dia + dias));
};

const diferencaDias = (inicio, fim) => {
    const [a1, m1, d1] = inicio.split('-').map(Number);
    const [a2, m2, d2] = fim.split('-').map(Number);
    const msPorDia = 24 * 60 * 60 * 1000;
    return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / msPorDia);
};

const calcularStatus = (loan) => {
    if (loan.returnDate) return 'DEVOLVIDO';
    return loan.dueDate < hoje() ? 'ATRASADO' : 'ATIVO';
};

const comStatus = (loan) => ({ ...loan.toJSON(), status: calcularStatus(loan) });

module.exports = { PRAZO_DIAS, MULTA_POR_DIA, hoje, somarDias, diferencaDias, calcularStatus, comStatus };