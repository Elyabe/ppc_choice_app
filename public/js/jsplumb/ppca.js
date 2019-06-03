// Coleção de disicplinas selecionadas
var cc_selected = new Map(); 
// Coleção de soma totais dos percentuais de correspondência
var percentage_corresp = new Map();
// Coleção de disciplinas que podem ser aproveitadas (possuem correspondência)
var corresp = new Map();
// Coleção de optativas pendentes/não realizadas
var pending_optatives = new Map(); 

var cc_not_equiv = new Map();
// Coleção as disciplinas da grade atual selecionada
var current_grid = new Map();
// Coleção de disciplinas da grade alvo selecionada
var target_grid = new Map();

var dependency_rows = [];

var qtt_partial_exploitation = 0;
var qtt_total_exploitation = 0;
var qtt_not_exploitation = 0;
var qtt_optt_exploitation = 0;

var statistics;

const CH_OPTATIVE = 60;

$(document).ready( load_algorithm() );


// Carrega todo o código pertinente
function load_algorithm() {
        var instance_current_grid;
        var instance_targe_grid;

        create_grid(instance_current_grid, current_grid,"current-grid");
        create_grid(instance_targe_grid, target_grid,"target-grid");
  
        $('[data-toggle="popover"]').popover()

        $(window).scroll(function() {
          if($('a[href="#comparison"]').hasClass('active')) {
               $('#ppc-tools-box').show();
          } else {
               $('#ppc-tools-box').hide();
          }
        });

        // Wellerson task
        $('button[id="remove-cc-selected"]').on('click', function(){ 
            current_grid.forEach( (cc) => {remove_ppc_classes(cc);} );
            cc_selected.clear();             
            compare() }); 

        // Print
        $('button[id="ppc-print"]').on('click', function(){ 
            var print_window = show_popup('ppc-print');    
            print_window.focus();
        }); 

}

// Monta e exibe a grade de um curso 
// instance : instancia do JSPlumb sobre a qual a grade será criada
// container_name : nome do contêiner (div) sobre a qual a instancia do JSPlumb trabalha
function  create_grid(instance, grid, container_name) 
{
    $("#cont-bar-progress-"+container_name).hide()
    $("#canvas-"+container_name).hide()
    $("#toggle-button-" + container_name).prop("disabled",true);
        

    $("#sl-"+container_name).change(function(){

        grid.clear();
        var id_graduation_selected = $(this).children("option:selected").val();
        
        if ( id_graduation_selected > 0 )
        {
            instance = create_instance_jsplumb( container_name );
            $("#cont-bar-progress-"+container_name).show()
            $("#bar-progress-"+container_name).show()
            $("#bar-progress-"+container_name).css("width", "25%");
            $("#"+container_name).hide();
            $("#"+container_name).empty();
            $("#canvas-"+container_name).removeClass('show');
            $('#cont-statistics-card').hide();

            $.ajax({
                    url: '/db/graduation/grid/' + id_graduation_selected,
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

                        $("#bar-progress-"+container_name).css("width", "50%");
                    
                        $.ajax({
                            url: '/db/graduation/dependency/' + id_graduation_selected,
                            type:'GET',
                            cache:true,
                            success: function(response) 
                            {

                                response.forEach( (item) => {
                                    dependency_rows.push(item);
                                })

                                instance.batch( function (){
                            
                                    var last_period = 0, position_into_period;
                                    
                                    for (var [cod, subject] of grid ) 
                                    {
                                        if ( last_period == subject.periodo ){
                                            position_into_period++;
                                        } else 
                                        {
                                            position_into_period = 0;
                                            create_label_period( instance, subject.periodo, grid );
                                        }

                                        last_period = subject.periodo;
                                        create_curricular_component(instance, subject, position_into_period )
                                    }

                                    if ( container_name == 'current-grid')
                                    {
                                        cc_selected.clear();
                                        grid.forEach( (item) => {

                                            let obj_subject = document.getElementById(item.cod_comp_curricular);
                                           
                                            instance.on( obj_subject, "click", function(e) {

                                                if ( cc_selected.has( Number(item.cod_comp_curricular)) )
                                                {   
                                                    cc_selected.delete( Number(item.cod_comp_curricular) );
                                                    remove_ppc_classes(item);
                                                } else {
                                                           auto_select_dependency(dependency_rows, item );
                                                        }
                                                    compare();
                                                    $('[data-toggle="popover"]').popover();
                                            });
                                        
                                            instance.on(obj_subject, "mouseover", function(e) {
                                                instance.select({"source": item.cod_comp_curricular}).setHover(true);
                                                instance.select({"target": item.cod_comp_curricular}).setHover(true);
                                            });

                                            instance.on(obj_subject, "mouseout", function(e) {
                                                instance.select({"source": item.cod_comp_curricular}).setHover(false);
                                                instance.select({"target": item.cod_comp_curricular}).setHover(false);
                                            });

                                        })
                                    }
                                    // End current-grid

                                    $("#bar-progress-"+container_name).css("width", "75%");


                                    $("#bar-progress-"+container_name).css("width", "100%");        
                                    
                                    $("#bar-progress-"+container_name).hide()
                                    $("#cont-bar-progress-"+container_name).hide()
                                    $("#canvas-"+container_name).addClass('show')
                                    $("#canvas-"+container_name).css("height","")

                                    $('#canvas-' + container_name).show()
                                    $('#' + container_name).show()

                                    response.forEach( (dep) => {
                                        instance.connect({ source: dep.cod_cc_pre_requisito, target: dep.cod_comp_curricular, type:"basic" })
                                    })

                                    $("#toggle-button-" + container_name).prop("disabled",false);

                                    let foco = ( container_name == 'current-grid') ? 'target-grid' : 'current-grid';
                                    $('body, html').animate({
                                    scrollTop: $("#sl-" + foco).offset().top - 75
                                    }, 600);

                                    $("#sl-"+ foco).focus();
                                }) // End batch
            
                            } //End function success
                        })
                    }
            });//End request grid
                
        } else 
            { 
                $('#' + container_name).empty();
                $('#canvas-' + container_name).hide();
                $("#toggle-button-" + container_name).prop("disabled",true);
            }

        }); 
}   



// Realiza comparação entre as grades dos curso e exibe ao usuário.
function compare() 
{
    var sum_pending_ch = 0.0;
    qtt_total_exploitation = 0;
    qtt_partial_exploitation = 0;
    qtt_optt_exploitation = 0;
    qtt_not_exploitation = 0;
                       
                var id_current_graduation = $("#sl-current-grid").children("option:selected").val();
                var id_target_graduation = $("#sl-target-grid").children("option:selected").val();
                    
                if ( id_current_graduation > 0 )
                {
                   if ( id_target_graduation > 0 )
                   {
                        $.ajax({
                        url: '/compare/' + id_current_graduation + "/" + id_target_graduation,
                        type:'GET',
                        cache:true,
                        success: function (corresp_matrix) 
                        {

                            if ( corresp_matrix.length == 0 )
                            {
                                alert('Oops! Não existe em nosso sistema um mapeamento entre esses cursos. Estamos trabalhando nisso.')
                                cc_selected.clear();
                                return;
                            }

                            percentage_corresp.clear();
                            corresp.clear();
                            cc_not_equiv.clear();

                            corresp_matrix.forEach( (item) => { 
                                percentage_corresp.set( Number( item.cod_cc_corresp), 0 );
                            })

                            target_grid.forEach( (cc) => { 
                                remove_ppc_classes(cc);
                            })

                            cc_selected.forEach( (cc) => {

                                let equiv_matrix = corresp_matrix.filter( (item) => { return item.cod_comp_curricular == cc.cod_comp_curricular } );
                                
                                equiv_matrix.forEach( (disc) => {

                                    percentage_corresp.set( Number(disc.cod_cc_corresp), percentage_corresp.get(Number(disc.cod_cc_corresp)) + Number(disc.percentual_corresp) );

                                    let total_percentage = percentage_corresp.get(Number(disc.cod_cc_corresp));

                                    $("#"  + disc.cod_comp_curricular ).removeClass('selected');    

                                    if ( total_percentage >= 1 ) 
                                    {   
                                        $("#"  + disc.cod_cc_corresp ).addClass('ppc-total-exploitation');    

                                        if ( disc.percentual_corresp == 1 ){
                                            $("#"  + disc.cod_comp_curricular ).addClass('ppc-total-exploitation');    
                                        } else {
                                            $("#"  + disc.cod_comp_curricular ).addClass('ppc-partial-exploitation');    
                                            $("#"  + disc.cod_comp_curricular ).addClass('ppc-partial50');    
                                        }
                                        qtt_total_exploitation++;
                                    } else if (total_percentage > 0 )
                                    {
                                        $("#"  + disc.cod_cc_corresp ).addClass('ppc-partial-exploitation')
                                        $("#"  + disc.cod_cc_corresp ).addClass('ppc-partial50')
                    
                                        $("#"  + disc.cod_comp_curricular ).addClass('ppc-partial-exploitation')    
                                        $("#"  + disc.cod_comp_curricular ).addClass('ppc-partial50')
                                        qtt_partial_exploitation++;
                                    }

                                    

                                })

                                if ( equiv_matrix.length == 0 )
                                {
                                    $("#"+cc.cod_comp_curricular).addClass('ppc-optative')
                                    sum_pending_ch += Number(cc.carga_horaria);
                                    cc_not_equiv.set( Number(cc.cod_comp_curricular), Number(cc.carga_horaria) );
                                }    


                                corresp_matrix.map( (item) => { return item.cod_cc_corresp } ).forEach( (key) => {
                                    create_popover_status( corresp_matrix, key );                                    
                                })

                            })


                            // Begin Transform Optatives case
                            var pend_optt = [];
                            current_grid.forEach( function(value){ 
                                if ( value.nome.includes("Optativa") && !cc_selected.has( Number(value.cod_comp_curricular)) )
                                    pend_optt.push( Number(value.cod_comp_curricular));  
                            })

                            var keys_cc_not_equiv = Array.from( cc_not_equiv.keys() );
                            sort_cc( keys_cc_not_equiv );

                            while( pend_optt.length > 0 && keys_cc_not_equiv.length > 0 )
                            {
                                var rows = [], id = Number( corresp_matrix.filter( (cc) => { return Number(cc.cod_comp_curricular) == pend_optt[0] } )[0].cod_cc_corresp );
                                
                                var cc_cod = keys_cc_not_equiv[0];
                                var sum = cc_not_equiv.get(cc_cod);
                                if ( sum > CH_OPTATIVE ) 
                                {
                                    add_row( rows, cc_cod, id, 1);

                                    cc_not_equiv.set( cc_cod, cc_not_equiv.get( cc_cod ) - CH_OPTATIVE );
                                    sort_cc( keys_cc_not_equiv );

                                    percentage_corresp.set( id, 1);
                                } else if ( sum == CH_OPTATIVE ) {

                                    add_row( rows, cc_cod, id, 1);
                                    keys_cc_not_equiv.splice(0,1);
                                    percentage_corresp.set( id, 1);
                                } else {
                                    
                                    var id_comp;
                                    var pend_value;

                                    add_row( rows, cc_cod, id, cc_not_equiv.get(cc_cod)/CH_OPTATIVE );
                                    percentage_corresp.set( id, percentage_corresp.get(id) + cc_not_equiv.get(cc_cod)/CH_OPTATIVE );
                                    keys_cc_not_equiv.splice(0,1);
                                    
                                    id_comp = keys_cc_not_equiv.length - 1;
                                    while (  sum < CH_OPTATIVE && id_comp >= 0 )
                                    {
                                        pend_value = CH_OPTATIVE - sum;
                                        if ( cc_not_equiv.get( keys_cc_not_equiv[ id_comp ] ) >= pend_value )
                                        {
                                            sum += pend_value;
                                            cc_cod = keys_cc_not_equiv[id_comp];
                                            add_row( rows, cc_cod, id, pend_value/CH_OPTATIVE );
                                            percentage_corresp.set( id, percentage_corresp.get(id) + pend_value/CH_OPTATIVE );
                                            cc_not_equiv.set(cc_cod, cc_not_equiv.get(cc_cod) - pend_value );

                                            if ( cc_not_equiv.get(cc_cod) <= 0 )
                                                keys_cc_not_equiv.splice( id_comp, 1 );

                                            sort_cc( keys_cc_not_equiv );
                                            id_comp = keys_cc_not_equiv.length - 1;
                                        } else
                                            id_comp--;
                                    }
                                    
                                    
                                    if ( id_comp < 0 && sum < CH_OPTATIVE && keys_cc_not_equiv.length > 0 )
                                    {
                                        cc_cod = keys_cc_not_equiv[0];
                                        percentage_corresp.set( id, percentage_corresp.get(id) + cc_not_equiv.get(cc_cod)/CH_OPTATIVE );
                                        add_row( rows, cc_cod, id, cc_not_equiv.get(cc_cod)/CH_OPTATIVE );
                                        keys_cc_not_equiv.splice( 0, 1 );                                        
                                    }
                                }
                                
                                pend_optt.splice(0,1);

                                $("#"  + id ).addClass('ppc-optative');
                                create_popover_status( rows, id );
                            }

                            // End Transforme Optative

                            statistics = [
                                      ["Categoria", "Quantidade"],
                                      ["Totalmente Aproveitadas",  qtt_total_exploitation ],
                                      ["Parcialmente Aproveitadas", qtt_partial_exploitation ],
                                      ["Podem ser aproveitadas como optativa", qtt_optt_exploitation ],
                                      ["Não foi aproveitada", current_grid.size - (qtt_total_exploitation+qtt_partial_exploitation)],
                                    ];

                            drawChart( statistics );
                            $('#cont-statistics-card').show();
                            if ( !$('#statistics-card').hasClass('show') )
                                $('#statistics-card').toggle();
                            
                            $('[data-toggle="popover"]').popover({ 'html': true });

                            // Wellerson - task
                            $('button[id="remove-cc-selected"]').prop("disabled", cc_selected.size <= 0 );

                        } 

                        })
                   } else {
                        alert('Um curso alvo deve ser selecionado!')
                        
                        for ( var [k,v] in cc_selected )
                            remove_ppc_classes(k);

                        cc_selected.clear();
                   }

                    
                } else
                {
                    alert('Um curso atual deve ser selecionado.')
                }


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

};

// Cria, adiciona a uma instancia e retorna uma componente curricular
// instance : Instância do JSPlumb no qual será criada a nova componente curricular
// data : JSON com os dados necessários de uma componente curricular
// num : Ordem da componente curricular no período no qual ela se encontra
function create_curricular_component(instance, data, num ) 
{
    
    var mg_top = 40;
    var d = document.createElement("div");
    var id = data["cod_comp_curricular"];
    d.className = "w";
    d.id = id;
    d.innerHTML = data.nome + "<br>(" + data.carga_horaria + " horas)";
    d.style.left = (data.periodo - 1)*140 + "px";
    d.style.top = (num*85 + mg_top) + "px";
    instance.getContainer().appendChild(d);
    initialize_component(instance, d);

    return d;
};

// Cria uma label com a numeração do período na grada
// instance : Instância do JSPlumb na qual a label será inserida
// period: Número do período para a label
function create_label_period(instance, period, grid ) {

    var d = document.createElement("div");
    var id = "P" + period;
    d.className = "label-periodo";
    d.id = id;
    d.innerHTML = d.id ;
    d.style.left = (period - 1)*140 + "px";
    d.style.top = "10px";
    instance.getContainer().appendChild(d);

    $("#"+id).on('click', function(){
        let vet = Array.from( current_grid.values() );
        vet.filter( (item) => { return item.periodo == period } ).forEach( (d) => {
            auto_select_dependency( dependency_rows, d );
        })
        compare();
    })

};


// Remove todas as classes referentes às colorações do PPC deixando aparência limpa/original
// cc : Componente curricular da qual deseja-se remover as classes
function remove_ppc_classes(cc)
{
    let classes = Array.from($("#"+cc.cod_comp_curricular).prop('classList'))
    let ppc_classes = classes.filter(className => { return className.match(/^ppc/) })

    $("#"+cc.cod_comp_curricular).removeClass(ppc_classes.join(' '))
}

// Cria as informações de stts acerca de aproveitamentos em balões
// corresp_matrix : Matriz de correspondência entre os cursos 
// key : Código da componente curricular em questão
function create_popover_status( corresp_matrix, key )
{
    var stts, color, 
    popover_content =  '<table class="table table-striped" style="table-layout: fixed;">\
                          <thead>\
                            <tr>\
                              <th scope="col" style="width:120px; word-wrap:break-word;">Disciplina</th>\
                              <th scope="col">Percentual</th>\
                              <th scope="col">Status</th>\
                            </tr>\
                          </thead>\
                          <tbody>';

                        corresp_matrix.filter( (row) => { return row.cod_cc_corresp == key } ).forEach( (disc) => {
                            ccur = current_grid.get(Number(disc.cod_comp_curricular));
                            popover_content += '<tr>\
                              <th scope="row">'+  ccur.nome + '</th>\
                              <td>' + disc.percentual_corresp*100 + '% </td>';

                            if ( cc_selected.has( Number(disc.cod_comp_curricular) ) ) 
                            {
                                stts = 'up';
                                color = 'blue';
                            } else
                            {
                                stts = 'down';
                                color = 'red';
                            }    

                            popover_content += '<td> <span class="fas fa-thumbs-' + stts +'" style="color:'+ color +'"> </span></td></tr>';
                        })


                        popover_content += '</tbody>\
                        </table>';

            $("#"+key).attr( { 'data-toggle': 'popover',
                'data-trigger': 'focus',
                'title': 'status',
                'data-content': popover_content,
                'role': 'button',
                'tabindex': '0' });
}

// Cria e exibe janela para impressao do resultado da comparação
// div_id : id da div a ser impressa
function show_popup(div_id) 
{
    var content = document.getElementById(div_id).innerHTML;
    var ppc_print_window = window.open('', 'SecondWindow', 'toolbar=0,stat=0');
    ppc_print_window.document.write("<html><body class='responsive light2012-home-switcher home switcher' >" 
    + content + "</body></html>");

    var style, styles_href = ['/stylesheet/jsplumb/jsplumbtoolkit-defaults.css',  '/stylesheet/jsplumb/jsplumbtoolkit-demo.css',
    '/stylesheet/jsplumb/style-grid.css', 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css' ];
    
    styles_href.forEach( (href) => {
        style = ppc_print_window.document.createElement('link');
        style.type = "text/css";
        style.rel = "stylesheet";
        style.href = href; 
        style.media = "all";
        ppc_print_window.document.getElementsByTagName("head")[0].appendChild(style);        
    });

    var script, script_src = ['/js/jsplumb/jsplumb.js', 'https://use.fontawesome.com/releases/v5.8.2/js/all.js'];

    script_src.forEach( (src) => {
        script = ppc_print_window.document.createElement('script');
        script.src = src;
        ppc_print_window.document.getElementsByTagName("head")[0].appendChild(script);        
    });

    ppc_print_window.document.close();
    // ppc_print_window.focus();

    return ppc_print_window;
}


function auto_select_dependency( data_dependency, cc_root )
{
    var auto_selected_tmp = [ cc_root.cod_comp_curricular ];

    if ( $('#auto-select-dependency').prop('checked') )
    {
        for ( var j = 0; j < auto_selected_tmp.length; j++ )
        {
            data_dependency.filter( (item) => {
                return item.cod_comp_curricular == auto_selected_tmp[j]
            }).forEach( (item) => { auto_selected_tmp.push(item.cod_cc_pre_requisito) }) 
        }
    }

    auto_selected_tmp.forEach( (d) => {
       cc_selected.set( Number(d), current_grid.get(Number(d)) )
    }) 

    if ( auto_selected_tmp.length > 1 )
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

function sort_cc( keys_cc_not_equiv )
{
    keys_cc_not_equiv.sort( function( cc_id_a, cc_id_b ){ 
        return cc_not_equiv.get(cc_id_b) - cc_not_equiv.get(cc_id_a) } );

    return keys_cc_not_equiv;
}

function add_row( rows, cc_cod, cod_cc_corresp, percent )
{
    rows.push( { "cod_comp_curricular": cc_cod, 
                "cod_cc_corresp": cod_cc_corresp, 
                "percentual_corresp": percent });
}