/*



jsPlumb.ready(function () {
    // setup some defaults for jsPlumb.
    var instance = jsPlumb.getInstance({
        Endpoint: ["Dot", {radius: 2}],
        Connector:"StateMachine",
        HoverPaintStyle: {stroke: "#1e8151", strokeWidth: 2 },
        ConnectionOverlays: [
            [ "Arrow", {
                location: 1,
                id: "arrow",
                length: 14,
                foldback: 0.8
            } ],
            [ "Label", { label: "FOO", id: "label", cssClass: "aLabel" }]
        ],
        Container: "canvas"
    });

    // instance.registerConnectionType("basic", { anchor:"Continuous", connector:"StateMachine" });
    instance.registerConnectionType("basic", { anchor:"Continuous", connector:"Flowchart" });

    window.jsp = instance;

    var seletorCurso = document.getElementById("curso-atual");
    var canvas = document.getElementById("canvas");
    var windows = jsPlumb.getSelector(".statemachine-demo .w");

    // bind a click listener to each connection; the connection is deleted. you could of course
    // just do this: instance.bind("click", instance.deleteConnection), but I wanted to make it clear what was
    // happening.
    instance.bind("click", function (c) {
        instance.deleteConnection(c);
    });

    // bind a connection listener. note that the parameter passed to this function contains more than
    // just the new connection - see the documentation for a full list of what is included in 'info'.
    // this listener sets the connection's internal
    // id as the label overlay's text.
    instance.bind("connection", function (info) {
        info.connection.getOverlay("label").setLabel(info.connection.id);
    });

    // Cria um nova disciplina ao ocorrer um duplo-clique
    jsPlumb.on(canvas, "dblclick", function(e) {
        newNode(e.offsetX, e.offsetY);
    });

    instance.on(seletorCurso, "change", function(e) {
        // newNode(e.offsetX+15, e.offsetY+200);
        console.log("Teste");
    });

    instance.on(canvas, "dblclick", function(e) {
        instance.select().setHover(true);
    });

    //
    // initialise element as connection targets and source.
    //
    var initNode = function(el) {

        // initialise draggable elements.
        instance.draggable(el);

        instance.makeSource(el, {
            filter: ".ep",
            anchor: "Continuous",
            connectorStyle: { stroke: "#5c96bc", strokeWidth: 2, outlineStroke: "transparent", outlineWidth: 4 },
            connectionType:"basic",
            extract:{
                "action":"the-action"
            },
            maxConnections: 10,
            onMaxConnections: function (info, e) {
                alert("Maximum connections (" + info.maxConnections + ") reached");
            }
        });

        instance.makeTarget(el, {
            dropOptions: { hoverClass: "dragHover" },
            anchor: "Continuous",
            allowLoopback: true
        });

        // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped
        // version of this demo to find out about new nodes being added.
        //
        instance.fire("jsPlumbDemoNodeAdded", el);
    };

    var newNode = function(x, y) {
        var d = document.createElement("div");
        //var id = jsPlumbUtil.uuid();
        var id = "disciplina" + jsPlumbUtil.uuid();
        d.className = "w";
        d.id = id;
        d.innerHTML = id.substring(0, 7) + "<div class=\"ep\"></div>";
        d.style.left = x + "px";
        d.style.top = y + "px";
        instance.getContainer().appendChild(d);
        initNode(d);
        return d;
    };


    


    // suspend drawing and initialise.
    instance.batch(function () {
        
        for (var i = 0; i < windows.length; i++) {
            initNode(windows[i], true);
        }
    })


        // and finally, make a few connections
        // instance.connect({ source: "opened", target: "phone1", type:"basic" })

    jsPlumb.fire("jsPlumbDemoLoaded", instance);

});

function AbrirSecao(secao){
        window.open(""+secao+"", "_parent");
    }    
    


*/