// Só o servidor conversa com o Neon.
const http = require('http')
const fs = require('fs')
const path = require('path')
const { executarQueryNeon } = require('./script_db_quantum.js')

const PORTA = process.env.PORT || 3001

const arquivos = {
    '/': { arquivo: 'index.html', tipo: 'text/html; charset=utf-8' },
    '/index.html': { arquivo: 'index.html', tipo: 'text/html; charset=utf-8' },
    '/app.js': { arquivo: 'app.js', tipo: 'text/javascript; charset=utf-8' },
    '/style.css': { arquivo: 'style.css', tipo: 'text/css; charset=utf-8' }
}

function responderJSON(res, status, dados) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(dados))
}

async function lerCorpo(req) {
    req.setEncoding('utf8')
    let corpo = ''
    for await (const pedaco of req) corpo += pedaco
    const dados = JSON.parse(corpo || '{}')
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
        throw new Error('Esperado um objeto JSON')
    }
    return dados
}

function lerDescricao(corpo) {
    return typeof corpo.descricao === 'string' ? corpo.descricao.trim() : ''
}

const servidor = http.createServer(async (req, res) => {
    if (req.url === '/api/categorias' && req.method === 'GET') {
        const linhas = await executarQueryNeon('SELECT * FROM categoria ORDER BY id_categoria')
        if (linhas === null) return responderJSON(res, 500, { erro: 'Falha ao consultar o banco' })
        return responderJSON(res, 200, linhas)
    }

    if (req.url === '/api/categorias' && req.method === 'POST') {
        let corpo
        try { corpo = await lerCorpo(req) }
        catch { return responderJSON(res, 400, { erro: 'JSON inválido' }) }

        const descricao = lerDescricao(corpo)
        if (!descricao) return responderJSON(res, 400, { erro: 'Informe a descrição' })

        const linhas = await executarQueryNeon(
            'INSERT INTO categoria (descricao) VALUES ($1) RETURNING *',
            [descricao]
        )
        if (linhas === null) return responderJSON(res, 500, { erro: 'Falha ao inserir no banco' })
        return responderJSON(res, 201, linhas[0])
    }

    if (req.url === '/api/editarCategorias' && req.method === 'POST') {
        let corpo
        try { corpo = await lerCorpo(req) }
        catch { return responderJSON(res, 400, { erro: 'JSON inválido' }) }

        const id = corpo.id_categoria
        const descricao = lerDescricao(corpo)
        if (!id) return responderJSON(res, 400, { erro: 'Informe o ID' })
        if (!descricao) return responderJSON(res, 400, { erro: 'Informe a descrição' })

        const linhas = await executarQueryNeon(
            'UPDATE categoria SET descricao = $1 WHERE id_categoria = $2 RETURNING *',
            [descricao, id]
        )
        if (linhas === null) return responderJSON(res, 500, { erro: 'Falha ao editar no banco' })
        if (linhas.length === 0) return responderJSON(res, 404, { erro: 'Categoria não encontrada' })
        return responderJSON(res, 200, linhas[0])
    }

    if (req.url === '/api/excluirCategorias' && req.method === 'POST') {
        let corpo
        try { corpo = await lerCorpo(req) }
        catch { return responderJSON(res, 400, { erro: 'JSON inválido' }) }

        const id = corpo.id_categoria
        if (!id) return responderJSON(res, 400, { erro: 'Informe o ID' })
        const linhas = await executarQueryNeon(
            'DELETE FROM categoria WHERE id_categoria = $1 RETURNING *',
            [id]
        )
        if (linhas === null) return responderJSON(res, 500, { erro: 'Falha ao deletar no banco' })
        if (linhas.length === 0) return responderJSON(res, 404, { erro: 'Categoria não encontrada' })
        return responderJSON(res, 200, linhas[0])
    }

    const rota = Object.hasOwn(arquivos, req.url) ? arquivos[req.url] : null
    if (rota) {
        return fs.readFile(path.join(__dirname, rota.arquivo), (erro, conteudo) => {
            if (erro) {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
                return res.end('Arquivo não encontrado')
            }
            res.writeHead(200, { 'Content-Type': rota.tipo })
            res.end(conteudo)
        })
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Página não encontrada')
})

servidor.listen(PORTA, () => {
    console.log(`Loja do Zé rodando em http://localhost:${PORTA}`)
})
