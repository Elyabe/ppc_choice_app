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
// container_name : nome do contêiner (div) sobre a qual a instancia do JSPlumb trabalha
function  create_grid(instance, grid, container_name) 
{
    // Ajustar a função "carregar" e colocar aqui
}   

// Realiza comparação entre as grades dos curso e exibe ao usuário.
function compare() 
{
    // Colocar a implementação ajustada da função anônima do botão comparar aqui
}


// Cria e retorna uma instância do JSPlumb 
// container_name : nome do container sobre a qual a nova instância do JSPlumb deve trabalhar
function create_instance_jsplumb( container_name )
{
    let instance = jsPlumb.getInstance({
    Endpoint: ["Dot", {radius: 2}],
    Connector:"StateMachine",
    HoverPaintStyle: {stroke: "#1e8151", strokeWidth: 1 },
    ConnectionOverlays: [
        [ "Arrow", {
            location: 1,
            id: "arrow",
            length: 5,
            foldback: 0.8,
            width: 10
        } ]/*,
        [ "Label", { label: "FOO", id: "label", cssClass: "aLabel" }]*/
    ],
    Container: container_name
    });

    // instance.registerConnectionType("basic", { anchor:"Continuous", connector:"StateMachine" });
    instance.registerConnectionType("basic", { anchor:"Continuous", 
        connector:"Flowchart", 
        paintStyle : { strokeWidth : 1} });

    return instance;
}

// Inicializa uma componente curricular com todos os apetrechos necessários 
// instance : Instância do JSPlumb na qual a componente curricular se encontra
// cc : Componenente curricular a ser inicializada 
function initialize_component(instance, cc) 
{
    instance.makeSource(cc, {
        filter: ".ep",
        anchor: "Continuous",
        connectorStyle: { stroke: "#e9e9e9", strokeWidth: 1, outlineStroke: "transparent", outlineWidth: 4 },
        connectionType:"basic",
        extract:{
            "action":"the-action"
        },
        maxConnections: 10,
        onMaxConnections: function (info, e) {
            alert("Maximum connections (" + info.maxConnections + ") reached");
        }
    });

    instance.makeTarget(cc, {
        dropOptions: { hoverClass: "dragHover" },
        anchor: "Continuous",
        allowLoopback: true
    });

    instance.fire("jsPlumbDemoNodeAdded", cc);
};

// Cria, adiciona a uma instancia e retorna uma componente curricular
// instance : Instância do JSPlumb no qual será criada a nova componente curricular
// data : JSON com os dados necessários de uma componente curricular
// num : Ordem da componente curricular no período no qual ela se encontra
function create_curricular_component(instance, data, num ) 
{
    var d = document.createElement("div");
    var id = data["cod_comp_curricular"];
    d.className = "w";
    d.id = id;
    d.innerHTML = data.nome + "<br>(" + data.carga_horaria + " horas)";
    d.style.left = (data.periodo - 1)*140 + "px";
    d.style.top = num*85 + "px";
    instance.getContainer().appendChild(d);
    initNode(instance, d);
    return d;
};

// Cria uma label com a numeração do período na grada
// instance : Instância do JSPlumb na qual a label será inserida
// period: Número do período para a label
function create_label_period(instance, period ) {
    
    var d = document.createElement("div");
    var id = "P" + period;
    d.className = "label-periodo";
    d.id = id;
    d.innerHTML = d.id ;
    d.style.left = (period - 1)*140 + "px";
    d.style.top = "10px";
    instance.getContainer().appendChild(d);
};


// Remove todas as classes referentes às colorações do PPC deixando aparência limpa/original
// cc : Componente curricular da qual deseja-se remover as classes
function remove_ppc_classes(cc)
{
    let classes = Array.from($("#"+cc.cod_comp_curricular).prop('classList'))
    let ppc_classes = classes.filter(className => { return className.match(/^ppc/) })

    $("#"+cc.cod_comp_curricular).removeClass(ppc_classes.join(' '))
}

