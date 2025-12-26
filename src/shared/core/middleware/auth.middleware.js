/*const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const { authorization } = req.headers;

  // 1. Verifica se o header de autorização foi enviado
  if (!authorization) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  // O token vem no formato "Bearer eyJhbGciOi..."
  // Usamos o split para pegar apenas o código do token
  const [, token] = authorization.split(' ');

  try {
    // 2. Valida o token usando a mesma chave secreta
    const decoded = jwt.verify(token, 'seu_jwt_secret_super_secreto');
    const { id, tipo } = decoded;

    // 3. Anexa os dados do usuário ao objeto 'req'
    req.usuario = { id, tipo };

    // 4. Chama o 'next()' para permitir que a requisição continue para o controller
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

module.exports = authMiddleware;
*/


// ARQUIVO MODIFICADO PARA TESTES (SEM AUTENTICAÇÃO)
function authMiddleware(req, res, next) {
  
  // 1. Nós "forjamos" um usuário SUPER_ADMIN.
  // Isso garante que rotas como 'atribuirPermissao' funcionem.
  req.usuario = {
    id: 1, // ID de um usuário admin (pode ser qualquer número)
    tipo: 'SUPER_ADMIN' 
  };

  // 2. Deixamos a requisição passar direto.
  return next();
}

module.exports = authMiddleware;
