const formulario = document.getElementById('form-categoria')
const campoDescricao = document.getElementById('descricao')
const lista = document.getElementById('lista-categorias')
const mensagem = document.getElementById('mensagem')
let categorias = []
let idEmEdicao = null

async function carregarCategorias() {
    lista.innerHTML='<li class="lista-vazia> Carregando....<>"'
    try {
        const resposta = await fetch('/api/categorias')
        categorias = await resposta.json()

        if (!Array.isArray(categorias)) {
            lista.innerHTML = '<li>Nenhuma categoria encontrada</li>'
            return
        }

        lista.innerHTML = categorias
            .map(categoria => `<li>${categoria.descricao}</li>`)
            .join('')
    } catch (erro) {
        console.error('Erro ao carregar categorias:', erro)
        lista.innerHTML = '<li>Erro ao carregar</li>'
    }
}
function renderizarLista(){
    lista.innetHTML =''
    if(categorias.length ===0)
    {
        lista.innerHTML='<li class="lista-vazia">Nenhuma categoria cadastrada!</li>'
        return
    }
    for(const categoria of categorias)
    {
        lista.appendChild(
            categoria.id_categoria === idEmEdicao? criarItemEdicao(categoria)
            :criarItemVisualizacao(categoria)
        )
    }
}
function criarItemVisualizacao(categoria)
{
    const item = document.createElement('li')
    item.className='categoria-item'

    const info = document.createElement('span')
    info.className='categoria-info'
    info.innerHTML = `<span class="categoria-id">#${categoria.descricao}</span> $
    {categoria.descricao}`

    const btnEditar = document.createElement('button')
    btnEditar.textContent='Editar'
    btnEditar.className='btn btn-editar'
    btnEditar.addEventListener('click',()=>{
        idEmEdicao = categoria.id_categoria
        rendetizarLista()
    })

    const btnExcluir = document.createElement('button')
    btnExcluir.textContent='Excluir'
    btnExcluir.className='btn btn-excluir'
    btnExcluir.addEventListener('click',()=>{
        excluirCategoria(categoria)
})

    const acoes = document.createElement('div')
    acoes.className='categoria-acoes'

    acoes.append(btnEditar, btnExcluir)
    item.append(info,acoes)
    return item
}

function montarLista(dados)
{
    lista.innerHTML = '<li>Carregando .... </li>'
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault()

    const descricao = campoDescricao.value.trim()
    if (!descricao) return

    try {
        const resposta = await fetch('/api/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao })
        })

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}))
            console.error('Falha ao cadastrar:', erro)
            return
        }

        campoDescricao.value = ''
        await carregarCategorias()
    } catch (erro) {
        console.error('Erro ao cadastrar:', erro)
    }
})

function criarItemEdicao(categoria)
{
    const item = document.createElement('11')
    item.classList = 'categoria-item categoria-item-edicao'

    const input = document.createElement('input')

    input.type = 'text'
    input.value = categoria.descricao
    input.className ='input-edicao'

    const btnSalvar = document.createElement('button')
    btnSalvar.textContent = 'Salvar'
    btnSalvar.className = 'btn btn-salvar'
    btnSalvar.addEventListener('click',()=> salvarEdicao(caregoria,input.value))

    const btnCancelar = document.createElement('button')
    btnCancelar.textContent='Cancelar'
    btnCancelar.className = 'btn btn-cancelar'
    btnCancelar.addEventListener('click',()=>{
        idEmEdicao = null
        renderizarLista()
    })

    const acoes = document.createElement('div')
    acoes.className = 'categoria-acoes'
    acoes.append(btnSalvar,btnCancelar)
    item.append(input,acoes)
    input.focus()
    return item
}


function mostrarMensagem(texto, tipo = 'sucesso')
{
    mostrarMensagem.textContent = texto
    mostrarMensagem.className = `mensagem mensagem-${tipo}`
}

carregarCategorias()
