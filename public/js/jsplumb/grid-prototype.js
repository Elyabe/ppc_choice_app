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
        // Chamar a função de montar a grpm ade para cada uma das instâncias
        var target_grid_instance, current_grid_instance;
        create_grid(current_grid_instance,current_grid,"current-grid");
        create_grid(target_grid_instance,target_grid,"target-grid");
}

// Monta e exibe a grade de um curso 
// instance : instancia do JSPlumb sobre a qual a grade será criada
// container_name : nome do contêiner (div) sobre a qual a instancia do JSPlumb trabalha
function  create_grid(instance, grid, container_name) 
{
    // Ajustar a função "carregar" e colocar aqui
    // canvas_current_grid
    // canvas_target_grid
    $("#cont-bar-progress-"+container_name).hide()
    $("#canvas-"+container_name).hide()
    $("#toggle-button-" + container_name).prop("disabled",true);   

    $("#sl-"+container_name).change(function()
        {
            grid.clear();
            var selected_course = $(this).children("option:selected").val();

            if (selected_course > 0)
            {
                instance = create_instance_jsplumb(container_name);
                $("#cont-bar-progress-"+container_name).show()
                $("#bar-progress-"+container_name).show()
                $("#bar-progress-"+container_name).css("width", "25%");
                $("#"+container_name).empty();
                $("#"+container_name).empty();

                $.ajax({
                    url: '/db/graduation/grid/' + selected_course,
                    type:'GET',
                    cache:true,
                    success: function(response)
                    {
                        response.forEach( (item) => {
                            grid.set( Number(item.cod_comp_curricular), item );
                        })

                        window.jsp = instance;

                        var canvas = document.getElementById(container_name);
                        var windows = jsPlumb.getSelector(".statemachine-demo .w");

                        $.ajax({
                            url: '/db/graduation/dependency/' + selected_course,
                            type:'GET',
                            cache:true,
                            success: function(response)
                            {
                                instance.batch( function() {
                                    /*for (i = 0; i < windows.length; i++) {
                                        initNode(instance, windows[i], true);
                                    }*/

                                    var last_Period = 0, pos_subject_col=0;

                                    for (var [cod, subject] of grid ) 
                                    {
                                        //depois trocar periodo por period
                                        //periodo eh referente ao BD
                                        if ( last_Period == subject.periodo ) 
                                        {
                                            pos_subject_col++
                                        }else
                                        {
                                            pos_subject_col = 0;
                                        };
                                        last_Period = subject.periodo;
                                        create_curricular_component(instance, subject, pos_subject_col )
                                    }

                                    if(container_name == 'current_grid')
                                    {
                                        cc_selected.clear();
                                        grid.forEach( (item) =>{
                                            //mudar cod_comp_curricular dps que mexer no bd
                                            let curricomp = document.getElementById(item.cod_comp_curricular);

                                            instance.on(curricomp, "click", function(e) {
                                                if (cc_selected.has( Number(item.cod_comp_curricular)))
                                                {
                                                    cc_selected.delete( Number(item.cod_comp_curricular) );
                                                    $("#"+item.cod_comp_curricular).css("background-color","white");
                                                    $("#"+item.cod_comp_curricular).css("color","gray");   
                                                    $("#"+item.cod_comp_curricular).removeClass('selected');
                                                }
                                                else
                                                {
                                                    var pre_requisites = [];
                                                    pre_requisites.push(item.cod_comp_curricular);
                                                    for ( var j = 0; j < pre_requisites.length; j++ )
                                                    {
                                                        response.filter( (item) => {
                                                            return item.cod_comp_curricular == pre_requisites[j];
                                                        }).forEach( (item) => { pre_requisites.push(item.cod_cc_pre_requisito) })
                                                    }
                                                    pre_requisites.forEach( (item) => {
                                                        cc_selected.set(Number(item), grid.get(Number(item)));
                                                        $("#"+item).addClass('selected');
                                                    })

                                                    console.log(pre_requisites);

                                                    if (pre_requisites.length > 1)
                                                    {
                                                        const alert = '<div class="alert alert-warning alert-dismissible" role="alert">\
                                                            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
                                                            <strong>Opa!</strong> Imaginamos que vc já tenha cursado algumas disciplinas e as selecionamos automaticamente. \
                                                            <br> Você pode retirar a seleção, se for o caso. \
                                                            </div>';

                                                        $('#canvas-current-grid').prepend(alert)
                                                        setTimeout( function(){
                                                            $('.alert').fadeOut(300, () => $(this).remove() );
                                                        }, 5000 )
                                                    }

                                                }
                                                //chamada da função comparar
                                            }  )
                                        })

                                    }

                                    grid.forEach( (item) => {
                                        //mudar cod_comp_curricular dps q mexer no db
                                        let curricomp = document.getElementById(item.cod_comp_curricular);
                                     
                                        instance.on(curricomp, "mouseover", function(e) {
                                            instance.select({"source": item.cod_comp_curricular}).setHover(true);
                                            instance.select({"target": item.cod_comp_curricular}).setHover(true);
                                        });

                                        instance.on(curricomp, "mouseout", function(e) {
                                            instance.select({"source": item.cod_comp_curricular}).setHover(false);
                                            instance.select({"target": item.cod_comp_curricular}).setHover(false);
                                        });
                                    })
                                    
                                    $("#bar-progress-"+container_name).css("width", "75%");
                                    $("#bar-progress-"+container_name).css("width", "100%");
                                    $("#bar-progress-"+container_name).hide()
                                    $("#cont-bar-progress-"+container_name).hide()
                                    
                                    $("#canvas-"+container_name).addClass('in')
                                    $("#canvas-"+container_name).css("height","")
                                    $('#canvas-' + container_name).show()

                                    // console.log(response)
                                    response.forEach( (dep) =>
                                    {
                                        instance.connect({ source: dep.cod_cc_pre_requisito, target: dep.cod_comp_curricular, type:"basic" })
                                    })

                                    $("#toggle-button-" + container_name).prop("disabled",false);

                                    let foco = ( container_name == 'current-grid') ? 'target-grid' : 'current-grid';
                                    $('body, html').animate({
                                        scrollTop: $("#sl-" + foco).offset().top
                                    }, 600);

                                    $("#sl-"+ foco).focus();

                                })
                            } 
                        })
                    }
                })
            }   
            else
            {
                $('#' + container_name).empty();
                $('#canvas-' + container_name).hide();
                $("#toggle-button-" + container_name).prop("disabled",true);

            }
        })

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
    d.style.top = num * 85 + "px";
    instance.getContainer().appendChild(d);
    initialize_component(instance, d);
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

