# Loja do Zé

## Como rodar

1. Extraia o ZIP e copie os três arquivos JavaScript para a pasta do seu projeto, substituindo os arquivos de mesmo nome. Use a pasta que já tem seu `package.json`, `package-lock.json`, `index.html`, `style.css` e `.env`.
2. No HTML, pode trocar `<ul id="lista-categorias">` por `<ul id="lista-categorias" class="lista-categorias">`. O ID liga o elemento ao JavaScript e a classe aplica o estilo que seu CSS já define.
3. Use Node.js 22 ou 24. No terminal da pasta do projeto, rode `npm install` e depois `npm start`.
4. Abra [http://localhost:3001](http://localhost:3001) no navegador. Se você configurou outra porta, use o endereço exibido no terminal.
5. Cadastre **Brinquedos**, clique em **Editar**, mude para **Jogos**, salve e recarregue a página. Confira se **Jogos** continua na lista. Depois exclua essa categoria de teste.

O `.env` precisa conter `DATABASE_URL` com sua conexão do Neon. O banco precisa ter a tabela `categoria` com `descricao` e `id_categoria` gerado automaticamente no cadastro. Se os caracteres de escape da mensagem (por exemplo, `\<`, `&#x20;` ou `*` em volta de comentários) vieram junto para seus arquivos originais, remova-os também do HTML, CSS e JSON. O ZIP já traz os JavaScript em formato limpo.

## app.js

As linhas abaixo são as do arquivo corrigido. Chaves e parênteses que apenas fecham o bloco aparecem junto às instruções que fecham.

| Linha | O que faz e por que mudou |
| --- | --- |
| 1 | Resume por onde o navegador acessa os dados. As rotas começam por `/api`. |
| 10 | Declara a função assíncrona que reúne a lógica HTTP repetida nas quatro operações. |
| 11 | Espera o `fetch`. Sem corpo, usa o GET padrão para listar. Com corpo, passa o objeto de opções para enviar dados. |
| 12 | Define POST para cadastro, edição e exclusão, de acordo com as rotas do seu servidor. |
| 13 | Informa que o corpo está em JSON para identificar o formato da requisição. |
| 14–15 | Converte o objeto JavaScript em texto JSON e fecha as opções do `fetch`. |
| 16 | Lê e converte a resposta JSON em dados JavaScript. |
| 17 | Transforma falhas HTTP em exceções. O servidor manda `erro`, e o status HTTP serve de mensagem caso o campo venha vazio. |
| 18 | Entrega o resultado à função que chamou a API. |
| 22 | Exibe o estado de carregamento enquanto a requisição está em andamento. |
| 24 | Atualiza a lista local só depois que a API devolve as categorias. |
| 26–27 | Captura a falha e substitui “Carregando...” por uma indicação de erro. |
| 28 | Exibe `erro.message`, propriedade real de `Error`, com o estilo de erro. Antes apareciam `menssage` e `mensagem` em trechos diferentes. |
| 51 | Cria um `span` para mostrar o identificador. |
| 52 | Aplica ao `span` a classe CSS que o código original já usava. |
| 53 | Mostra `#` seguido de `id_categoria`. Antes aparecia a descrição duas vezes. |
| 54 | Junta o ID e a descrição no item. Como a descrição entra como texto, caracteres como `<` aparecem na tela literalmente. |
| 61 | Redesenha a lista depois de definir `idEmEdicao`, o que abre o campo da categoria selecionada. Isso substitui a chamada imediata com `idEmEdicaom` digitado errado e a leitura do campo de cadastro. |
| 62 | Coloca o cursor no campo de edição depois que ele entra na página. |
| 68 | Passa o ID direto para a exclusão. Assim, clicar em Excluir preserva o estado de edição de outra categoria. |
| 77–78 | Cria a função chamada pelo botão Salvar e abre o bloco que captura falhas. |
| 79 | Chama a rota de edição e espera a categoria atualizada. |
| 80 | Envia o identificador da categoria selecionada na chave que o servidor lê. |
| 81–82 | Envia o texto do campo da edição. `descricao` sozinho equivale a `descricao: descricao`. |
| 83 | Fecha o editor após salvar, se ele ainda pertencer à mesma categoria. Isso respeita a seleção caso o usuário tenha aberto outra durante a requisição. |
| 84 | Mostra a descrição devolvida pelo banco na mensagem de sucesso. |
| 85 | Busca a lista atualizada para mostrar os dados gravados. |
| 86–87 | Captura e mostra a falha da edição. O usuário pode corrigir o texto e tentar novamente. |
| 91 | Simplifica o nome do parâmetro para `id`, o identificador da categoria a excluir. |
| 93 | Envia o ID à rota de exclusão e espera a categoria removida. |
| 94 | Usa a descrição devolvida pela API para confirmar qual categoria foi excluída. |
| 95 | Recarrega a lista para retirar da tela o item excluído. O campo de novo cadastro mantém o texto que já estiver digitado. |
| 96–97 | Captura e mostra falhas de exclusão com `erro.message`. |
| 103 | Coloca a requisição de cadastro dentro de `try`, para tratar falhas da rede e da API. |
| 104 | Envia à rota de cadastro a descrição digitada no formulário. |
| 105–106 | Confirma o cadastro e limpa o campo após sucesso. |
| 107 | Espera o recarregamento para incluir o item cadastrado na tela. |
| 108–109 | Captura e mostra falhas de cadastro, deixando o texto digitado disponível para corrigir. |
| 115 | Usa `className` para atribuir a lista de classes como texto. |
| 125 | A chamada do botão Salvar já existia e agora encontra a função `salvarEdicao` da linha 77. |

Removi `montarLista`, que nunca era chamada. `renderizarLista` já monta os itens e inclui os botões. O foco saiu de `criarItemEdicao` e foi para o clique em Editar, quando o campo já existe na página.

## server.js

| Linha | O que faz e por que mudou |
| --- | --- |
| 1 | Resume que o servidor é quem faz a conexão ao banco. |
| 21 | Declara um leitor assíncrono. O Node já permite percorrer uma requisição com `for await`, então dá para usar isso diretamente. |
| 22 | Configura a leitura como UTF-8 para preservar os acentos, inclusive quando um caractere chega dividido entre pedaços. |
| 23 | Começa com uma string vazia para juntar os dados enviados. |
| 24 | Espera e acrescenta cada pedaço do corpo recebido. |
| 25 | Converte o corpo em JavaScript. Sem conteúdo, usa um objeto vazio para que as rotas possam devolver mensagens sobre campos ausentes. |
| 26 | Garante que o JSON é um objeto. Um JSON válido também pode ser `null`, número ou lista, formatos que essas rotas não esperam. |
| 27–28 | Lança o erro que o `catch` de cada rota transforma em HTTP 400. |
| 29 | Entrega o objeto validado à rota. |
| 32 | Cria uma função curta para cadastro e edição usarem a mesma validação da descrição. |
| 33 | Só chama `trim()` se o valor for texto. Outros tipos viram string vazia e recebem a mensagem de campo obrigatório. |
| 48 | Aplica essa validação no cadastro. |
| 64 | Lê `id_categoria`, a mesma chave enviada pelo navegador. Antes o servidor lia `id_descricao`. |
| 65 | Aplica a mesma validação de descrição na edição. |
| 66 | Responde 400 com a mensagem de ID obrigatório se faltar o identificador. |
| 67 | Responde 400 com a mensagem de descrição obrigatória se faltar o texto. |
| 69 | Aguarda as linhas devolvidas pelo banco após o UPDATE. |
| 70 | `SET descricao = $1` muda a descrição, `WHERE id_categoria = $2` limita a alteração ao ID escolhido e `RETURNING *` devolve a linha atualizada. `VALUES` é usado no INSERT do seu cadastro. |
| 71–72 | Passa `[descricao, id]` para preencher `$1` e `$2` nessa ordem. O banco recebe os valores separados do SQL. |
| 73 | Devolve 500 com uma mensagem sobre edição se a consulta falhar. |
| 74 | Devolve 404 quando nenhum item tiver o ID solicitado. |
| 75 | Envia HTTP 200 e a categoria atualizada. O cadastro continua com 201 porque cria um registro. |
| 76 | Fecha a rota de edição. Essa chave faltava e a rota de exclusão acabava dentro da edição, depois de um `return`. |
| 78–79 | Abre a rota de exclusão no nível das demais e declara a variável que receberá o corpo. |
| 80 | Lê o JSON da exclusão com a mesma função usada nos outros POSTs. |
| 81 | Responde 400 para JSON inválido. O campo ausente é tratado na validação do ID. |
| 83 | Extrai o ID do objeto recebido. |
| 84 | Responde 400 se faltar o identificador. |
| 85–88 | Executa o DELETE que você já tinha, usando o ID como parâmetro de `$1`. `RETURNING *` fornece os dados para a mensagem de sucesso. |
| 89 | Mantém o HTTP 500 quando o banco falha na exclusão. |
| 90 | Devolve 404 se o ID já tiver sido excluído ou nunca tiver existido. |
| 91 | Envia HTTP 200 e a categoria excluída para confirmar a operação. |
| 94 | Usa apenas as rotas de arquivos registradas no objeto `arquivos`. |
| 96 | Lê o arquivo antes de enviar HTTP 200, para poder tratar uma falha de leitura. |
| 97–100 | Se o arquivo estiver faltando ou ilegível, devolve uma resposta em vez de deixar o erro interromper o servidor. |
| 101 | Envia o tipo de conteúdo quando a leitura der certo. |
| 102–103 | Envia o conteúdo lido e fecha a função de retorno do `readFile`. |

## script_db_quantum.js

| Linha | O que faz e por que mudou |
| --- | --- |
| 4 | Mostra um erro direto de configuração se `DATABASE_URL` estiver ausente, antes de tentar interpretar a URL. |
| 9 | Usa `[]` como padrão para consultas sem parâmetros, como a listagem. |
| 11–16 | Organiza a chamada que você já fazia. Continua sendo POST com o cabeçalho de conexão e conteúdo JSON. |
| 17–18 | Envia o SQL em `query` e os valores em `params`, inclusive a lista vazia quando a consulta só lista categorias. |
| 20–22 | Se o Neon devolver um erro HTTP, gera uma exceção com o status para ajudar no diagnóstico pelo terminal. |
| 25–26 | Captura a exceção e escreve o motivo no terminal do servidor. A interface recebe a mensagem genérica definida na rota. |

## Validação

Os três JavaScript passaram na verificação de sintaxe. As requisições locais listaram, cadastraram, editaram e excluíram categorias com o endpoint do Neon simulado e as consultas executadas em SQLite em memória. O teste também confirmou o HTTP 400 para descrição inválida e o 404 para ID inexistente. A conexão e o esquema do seu Neon precisam ser confirmados ao rodar com seu `.env`.
