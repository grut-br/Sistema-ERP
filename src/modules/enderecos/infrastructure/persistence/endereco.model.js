const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');

const EnderecoModel = sequelize.define('Endereco', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    logradouro: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    numero: {
        type: DataTypes.STRING,
    },
    complemento: {
        type: DataTypes.STRING,
    },
    bairro: {
        type: DataTypes.STRING,
    },
    cidade: {
        type: DataTypes.STRING,
    },
    estado: {
        type: DataTypes.STRING(2),
    },
    cep: {
        type: DataTypes.STRING(10),
    },
    titulo: {
        type: DataTypes.STRING, // Ex: 'Casa', 'Trabalho'
    },
    id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'clientes', // Make sure this matches table name
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'enderecos',
    timestamps: false, // User didn't specify timestamps for address, usually they are not needed or user didn't mention. I will stick to basic.
    underscored: true // To match field: 'id_cliente' with DB column if needed, but standard is using 'field' attribute. I will assume standard snake_case for DB columns if 'underscored' is true.
});

module.exports = EnderecoModel;
