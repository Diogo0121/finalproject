// O navegador conversa com o servidor pelas rotas /api.
const lista = document.getElementById('lista-categorias')
const formulario = document.getElementById('form-categoria')
const campoDescricao = document.getElementById('descricao')
const mensagem = document.getElementById('mensagem')

let categorias = []
let idEmEdicao = null

async function chamarApi(rota, corpo) {
    const resposta = await fetch(rota, corpo === undefined ? undefined : {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo)
    })
    const dados = await resposta.json()
    if (!resposta.ok) throw new Error(dados.erro || `HTTP ${resposta.status}`)
    return dados
}

async function carregarCategorias() {
    lista.innerHTML = '<li class="lista-vazia">Carregando...</li>'
    try {
        categorias = await chamarApi('/api/categorias')
        renderizarLista()
    } catch (erro) {
        lista.innerHTML = '<li class="lista-vazia">Falha ao carregar categorias.</li>'
        mostrarMensagem(erro.message, 'erro')
    }
}

function renderizarLista() {
    lista.innerHTML = ''
    if (categorias.length === 0) {
        lista.innerHTML = '<li class="lista-vazia">Nenhuma categoria cadastrada!</li>'
        return
    }
    for (const categoria of categorias) {
        lista.appendChild(
            categoria.id_categoria === idEmEdicao ? criarItemEdicao(categoria) : criarItemVisualizacao(categoria)
        )
    }
}

function criarItemVisualizacao(categoria) {
    const item = document.createElement('li')
    item.className = 'categoria-item'

    const info = document.createElement('span')
    info.className = 'categoria-info'
    const id = document.createElement('span')
    id.className = 'categoria-id'
    id.textContent = `#${categoria.id_categoria}`
    info.append(id, ` ${categoria.descricao}`)

    const btnEditar = document.createElement('button')
    btnEditar.textContent = 'Editar'
    btnEditar.className = 'btn btn-editar'
    btnEditar.addEventListener('click', () => {
        idEmEdicao = categoria.id_categoria
        renderizarLista()
        lista.querySelector('.input-edicao').focus()
    })

    const btnExcluir = document.createElement('button')
    btnExcluir.textContent = 'Excluir'
    btnExcluir.className = 'btn btn-excluir'
    btnExcluir.addEventListener('click', () => excluirCategoria(categoria.id_categoria))

    const acoes = document.createElement('div')
    acoes.className = 'categoria-acoes'
    acoes.append(btnEditar, btnExcluir)
    item.append(info, acoes)
    return item
}

async function salvarEdicao(categoria, descricao) {
    try {
        const dados = await chamarApi('/api/editarCategorias', {
            id_categoria: categoria.id_categoria,
            descricao
        })
        if (idEmEdicao === categoria.id_categoria) idEmEdicao = null
        mostrarMensagem(`Categoria "${dados.descricao}" atualizada!`)
        await carregarCategorias()
    } catch (erro) {
        mostrarMensagem(erro.message, 'erro')
    }
}

async function excluirCategoria(id) {
    try {
        const dados = await chamarApi('/api/excluirCategorias', { id_categoria: id })
        mostrarMensagem(`Categoria "${dados.descricao}" excluída!`)
        await carregarCategorias()
    } catch (erro) {
        mostrarMensagem(erro.message, 'erro')
    }
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault()
    try {
        const dados = await chamarApi('/api/categorias', { descricao: campoDescricao.value })
        mostrarMensagem(`Categoria "${dados.descricao}" cadastrada!`)
        campoDescricao.value = ''
        await carregarCategorias()
    } catch (erro) {
        mostrarMensagem(erro.message, 'erro')
    }
})

function criarItemEdicao(categoria) {
    const item = document.createElement('li')
    item.className = 'categoria-item categoria-item-edicao'

    const input = document.createElement('input')
    input.type = 'text'
    input.value = categoria.descricao
    input.className = 'input-edicao'

    const btnSalvar = document.createElement('button')
    btnSalvar.textContent = 'Salvar'
    btnSalvar.className = 'btn btn-salvar'
    btnSalvar.addEventListener('click', () => salvarEdicao(categoria, input.value))

    const btnCancelar = document.createElement('button')
    btnCancelar.textContent = 'Cancelar'
    btnCancelar.className = 'btn btn-cancelar'
    btnCancelar.addEventListener('click', () => {
        idEmEdicao = null
        renderizarLista()
    })

    const acoes = document.createElement('div')
    acoes.className = 'categoria-acoes'
    acoes.append(btnSalvar, btnCancelar)
    item.append(input, acoes)
    return item
}

function mostrarMensagem(texto, tipo = 'sucesso') {
    mensagem.textContent = texto
    mensagem.className = `mensagem mensagem-${tipo}`
}

carregarCategorias()
