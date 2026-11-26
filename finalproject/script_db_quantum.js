require('dotenv').config({ quiet: true })

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) throw new Error('Configure DATABASE_URL no arquivo .env')

const host = new URL(DATABASE_URL).host
const neonHttpEndpoint = `https://${host}/sql`

async function executarQueryNeon(querySQL, parametros = []) {
    try {
        const resposta = await fetch(neonHttpEndpoint, {
            method: 'POST',
            headers: {
                'Neon-Connection-String': DATABASE_URL,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: querySQL, params: parametros })
        })

        if (!resposta.ok) {
            throw new Error(`Neon respondeu com HTTP ${resposta.status}`)
        }
        const dados = await resposta.json()
        return dados.rows
    } catch (erro) {
        console.error('Falha ao se comunicar com o banco de dados:', erro.message)
        return null
    }
}

module.exports = { executarQueryNeon }
