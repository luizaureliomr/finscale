const winston = require('winston');
const path = require('path');
const env = require('../config/env');

// Define os níveis de log e cores
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define as cores para cada nível
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

// Adiciona as cores ao winston
winston.addColors(colors);

// Define o formato do log
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
  })
);

// Define os transportes (onde os logs serão armazenados)
const transports = [
  // Console para desenvolvimento
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      format
    )
  }),
  
  // Arquivo para todos os logs
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/all.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  
  // Arquivo separado para erros
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
];

// Determina o nível de log com base no ambiente
const level = () => {
  return env.NODE_ENV === 'development' ? 'debug' : 'info';
};

// Cria e exporta o logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports
});

module.exports = logger; 