const swaggerJsDoc = require('swagger-jsdoc');
const env = require('./env');

// Configuração básica do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Finscale',
      version: '1.0.0',
      description: 'API para o sistema Finscale de gestão de plantões médicos',
      contact: {
        name: 'Suporte Finscale',
        email: 'suporte@finscale.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Caminhos para encontrar os arquivos com anotações de API
  apis: ['./src/routes/*.js', './src/models/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs; 