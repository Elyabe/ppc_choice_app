// Coleção de disicplinas selecionadas
var cc_selected = new Map(); 
// Coleção de soma totais dos percentuais de correspondência
var percentual_corresp = new Map();
// Coleção de disciplinas que podem ser aproveitadas (possuem correspondência)
var corresp = new Map();
// Coleção de optativas pendentes/não realizadas
var opt_pendentes = new Map(); 
// Coleção as disciplinas da grade atual selecionada
var current_grid = new Map();
// Coleção de disciplinas da grade alvo selecionada
var target_grid = new Map();


$(document).ready( load_algorithm() );


// Carrega todo o código pertinente
function load_algorithm() {
        // Criar uma instancia do JSPlumb pra cada grade
        // Chamar a função de montar a grade para cada uma das instâncias
}

// Monta e exibe a grade de um curso 
// instance : instancia do JSPlumb sobre a qual a grade será criada
// nome_container : nome do contêiner (div) sobre a qual a instancia do JSPlumb trabalha
function  create_grid(instance, grid, nome_container) 
{
    // Ajustar a função "carregar" e colocar aqui
}   

// Realiza comparação entre as grades dos curso e exibe ao usuário.
function compare() 
{
    // Colocar a implementação ajustada da função anônima do botão comparar aqui
}


// Cria e retorna uma instância do JSPlumb 
// nome_container : nome do container sobre a qual a nova instância do JSPlumb deve trabalhar
function create_instance_jsplumb( nome_container )
{
    // Implemtação 
}

// Inicializa uma componente curricular com todos os apetrechos necessários 
// instance : Instância do JSPlumb na qual a componente curricular se encontra
// cc : Componenente curricular a ser inicializada 
function initialize_component(instance, cc) 
{
    // Implementação da funcao initNode
};

// Cria, adiciona a uma instancia e retorna uma componente curricular
// instance : Instância do JSPlumb no qual será criada a nova componente curricular
// data : JSON com os dados necessários de uma componente curricular
// num : Ordem da componente curricular no período no qual ela se encontra
function create_curricular_component(instance, data, num ) 
{
    // Implementação da funcao novaCC
};

// Cria uma label com a numeração do período na grada
// instance : Instância do JSPlumb na qual a label será inserida
// period: Número do período para a label
function create_label_period(instance, period ) {
    // Implementação ajustada da função de mesmo nome
};


// Remove todas as classes referentes às colorações do PPC deixando aparência limpa/original
// cc : Componente curricular da qual deseja-se remover as classes
function remove_ppc_classes(cc)
{
    let classes = Array.from($("#"+cc.cod_comp_curricular).prop('classList'))
    let ppc_classes = classes.filter(className => { return className.match(/^ppc/) })

    $("#"+cc.cod_comp_curricular).removeClass(ppc_classes.join(' '))
}


