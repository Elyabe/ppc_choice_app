const express = require('express');
const router = express.Router();
const db = require('./db_functions');
const bodyParser = require('body-parser')

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

const { ensureAuthenticated } = require('../config/auth');
const passport = require('passport');

router.post( '/login', (req, res, next) => {
    passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next);
  },
);

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});


router.get( '/', function( req, res ) {
    // const get_qtd_cursos = "SELECT COUNT(cod_curso) FROM curso;"

    // db.getRecords( get_qtd_cursos, (result) => {
        res.render( './pages/login', { title: "Logue, seus putos", qtd_cursos: 0});
    // })

});

router.get( '/home', ensureAuthenticated, function( req, res ) {
    
    
    const get_qtd_cursos = "SELECT COUNT(cod_curso) FROM curso;"

        db.getRecords( get_qtd_cursos, (result) => {
            res.render( './pages/home_construcao', { title: "Seus putos", qtd_cursos: result.rows[0].count });
        })
    

});



router.get( '/comparison', ensureAuthenticated, function( req, res ) {
    const get_cursos = "SELECT C.cod_curso, C.nome, C.cod_ppc, C.ch_total_curso, P.status FROM curso as C, projeto_pedagogico_curso as P WHERE C.cod_ppc = P.cod_ppc;"
    const get_disciplinas = "SELECT D.nome, D.carga_horaria, CC.cod_comp_curricular, CC.periodo from disciplina as D, componente_curricular as CC \
        WHERE CC.cod_ppc = " + req.params.idCurso + " AND CC.cod_disciplina = D.cod_disciplina AND CC.cod_departamento = D.cod_departamento ORDER BY CC.cod_comp_curricular;"
    
    const get_dp = "SELECT * FROM dependencia WHERE cod_comp_curricular IN (\
                    SELECT cod_comp_curricular FROM componente_curricular WHERE cod_ppc = 1 );"



    var returnVals, ret, data;

    db.getRecords( get_cursos, (result) => {
        // res.send( result.rows );
/*        returnVals = result.rows

        db.getRecords( get_disciplinas, (result) => {
            ret = result.rows    
            
            db.getRecords( get_dp, (result) => {
            ret_dp = result.rows    
            console.log(ret_dp);
            data = { cursos: returnVals, grade : ret, dep: ret_dp }
            res.render('index', { title: 'Seus putos', data : data } )
            // res.json(data);
            // res.send( data );
             });
        })
*/      

        res.render('index', { title: 'Seus putos', cursos : result.rows } )
})

});

router.get( '/getGrade/:idCurso', function( req, res ) {
    
    const get_dp = "SELECT * FROM dependencia WHERE cod_comp_curricular IN (\
                    SELECT cod_comp_curricular FROM componente_curricular WHERE cod_ppc = " + req.params.idCurso + " );"

    const get_grade = "SELECT D.nome, D.carga_horaria, CC.cod_comp_curricular, CC.periodo from disciplina as D, componente_curricular as CC \
        WHERE CC.cod_ppc = " + req.params.idCurso + " AND CC.cod_disciplina = D.cod_disciplina AND CC.cod_departamento = D.cod_departamento ORDER BY CC.cod_comp_curricular;"
    

   var returnVals, ret, data;

    db.getRecords( get_grade, (result) => {
        // res.send( result.rows );
        ret = result.rows

        db.getRecords( get_dp, (result) => {
            ret_dp = result.rows    
        
            data = { grade : ret, depend: ret_dp }
            // res.render('index', { title: 'Seus putos', data : data } )
            // res.json(data);
            res.send( data );
             });
        })
    })
    
router.get('/compare/:idCursoAtual/:idCursoAlvo', function( req, res ){
   
    const get_ppc = "SELECT cod_ppc FROM curso WHERE cod_curso = " + req.params.idCursoAtual;

    const get_dp = "SELECT * FROM corresponde WHERE cod_comp_curricular IN (\
                    SELECT cod_comp_curricular FROM componente_curricular WHERE cod_ppc IN (" +  get_ppc + ") );"



    var returnVals, ret, data;

    db.getRecords( get_dp, (result) => {
        res.send({ equiv: result.rows })
    })
});


router.get( '/database', function( req, res ) {
    const create_db = "CREATE TABLE departamento ( \
    cod_departamento bigint not null,\
    nome character varying(255),\
    acronimo character varying(255)\
);\
\
CREATE TABLE curso (\
    cod_curso bigint not null,\
    cod_depto_resp bigint not null,\
    nome character varying(255),\
    cod_ppc bigint not null,\
    duracao real,\
    qtd_periodos bigint,\
    ch_total_curso bigint,\
    ch_total_disciplina_ob bigint,\
    ch_total_disciplina_opt bigint,\
    ch_total_disciplina_ext bigint,\
    ch_total_estagio bigint,\
    ch_total_projeto_conclusao bigint,\
    ch_total_extensao bigint\
);\
\
CREATE TABLE disciplina (\
    cod_disciplina bigint not null,\
    cod_departamento bigint not null,\
    nome character varying(255),\
    carga_horaria bigint\
);\
\
CREATE TABLE projeto_pedagogico_curso (\
    cod_ppc bigint not null,\
    cod_curso bigint not null,\
    data_inicio timestamp without time zone,\
    data_termino timestamp without time zone,\
    status character varying(50)\
);\
\
\
CREATE TABLE componente_curricular (\
    cod_comp_curricular bigint not null,\
    cod_disciplina bigint not null,\
    cod_departamento bigint not null,\
    cod_ppc bigint not null,\
    periodo bigint,\
    qtd_credito bigint,\
    tipo_disciplina character varying(50)\
);\
\
CREATE TABLE dependencia (\
    cod_comp_curricular bigint not null,\
    cod_cc_pre_requisito bigint not null\
);\
\
CREATE TABLE corresponde (\
    cod_comp_curricular bigint not null,\
    cod_cc_corresp bigint not null,\
    percentual_corresp real not null\
);";


const charge_db = "INSERT INTO departamento ( cod_departamento, nome, acronimo ) VALUES \
(1, 'Departamento de Computação e Eletrônica', 'DCE'),\
(2, 'Departamento de Matemática Aplicada', 'DMA'),\
(3, 'Departamento de Ciências Naturais', 'DCN'),\
(4, 'Departamento de Engenharias  e Tecnologias', 'DET'),\
(5, 'Departamento de Educação e Ciências Humanas', 'ECH'),\
(6, 'DCE/DMA/DET', '*');\
\
INSERT INTO curso ( cod_curso, cod_depto_resp, nome, cod_ppc, duracao, qtd_periodos, ch_total_curso, ch_total_disciplina_ob, ch_total_disciplina_opt, ch_total_disciplina_ext, ch_total_estagio, ch_total_projeto_conclusao, ch_total_extensao ) VALUES \
(1, 1, 'Ciência da Computação – São Mateus 2011', 1, 5, 10, 3870, 3030, 240, NULL, 300, 120, NULL),\
(2, 1, 'Ciência da Computação – São Mateus 2019', 2, 4, 8, 2715, NULL, NULL, NULL, NULL, NULL, NULL);\
\
INSERT INTO projeto_pedagogico_curso ( cod_ppc, cod_curso, data_inicio, data_termino, status ) VALUES \
(1, 1, '2011-08-01', NULL, 'ATIVO ANTERIOR'),\
(2, 2, '2019-08-01', NULL, 'CORRENTE');\
\
INSERT INTO disciplina ( cod_disciplina, cod_departamento, nome, carga_horaria ) VALUES \
(5670, 2, 'Cálculo I', 75),\
(5677, 2, 'Geometria Analítica', 60),\
(10403, 1, 'Introdução à Computação', 60),\
(10404, 1, 'Programação Funcional', 75),\
(10402, 1, 'Aspectos Teóricos da Computação I', 60),\
(10617, 1, 'Elementos de Lógica Digital', 45),\
(10618, 1, 'Probabilidade e Estatística', 60),\
(10619, 1, 'Programação Estruturada', 60),\
(10112, 3, 'Fundamentos de Mecânica Clássica', 90),\
(5689, 2, 'Álgebra Linear', 60),\
(5855, 2, 'Cálculo II', 75),\
(5968, 1, 'Estrutura de Dados I', 60),\
(10794, 1, 'Aspectos Teóricos da Computação II', 60),\
(10796, 1, 'Lógica para Computação I', 60),\
(11274, 1, 'Computação e Sociedade', 45),\
(10795, 3, 'Eletromagnetismo I', 75),\
(6016, 2, 'Cálculo III', 75),\
(11092, 1, 'Programação Orientada à Objetos', 75),\
(11231, 1, 'Algorítmos Numéricos I', 60),\
(11232, 1, 'Lógica para Computação II', 60),\
(11275, 1, 'Empreendedorismo', 45),\
(10166, 4, 'Pesquisa Operacional I', 60),\
(6101, 2, 'Equações Diferenciais', 60),\
(6226, 1, 'Estrutura de Dados II', 60),\
(6227, 1, 'Linguagens de Programação', 60),\
(8065, 1, 'Arquitetura de Computadores', 75),\
(8156, 1, 'Engenharia de Software', 75),\
(6281, 3, 'Ótica e Física Moderna', 60),\
(11233, 5, 'Metodologia Científica', 60),\
(8119, 1, 'Computação e Representação Gráfica', 60),\
(8276, 1, 'Linguagens Formais e Autômatos', 60),\
(8403, 1, 'Sistemas Operacionais', 75),\
(8409, 1, 'Teleprocessamento', 45),\
(11464, 1, 'Algoritmos Numéricos II', 60),\
(11466, 1, 'Engenharia de Requisitos de Software', 60),\
(11468, 1, 'Inteligência Artificial', 60),\
(8083, 1, 'Banco de Dados', 75),\
(8118, 1, 'Compiladores', 60),\
(8384, 1, 'Redes de Computadores', 60),\
(11465, 1, 'Análise e Projeto de Algoritmos', 60),\
(11471, 1, 'Projeto de Sistemas de Software', 60),\
(11491, 1, 'Sistemas Multimídia', 45),\
(11492, 1, 'Teoria da Computação', 60),\
(11718, 1, 'Interfaces e Periféricos', 45),\
(11719, 1, 'Sistemas Distribuídos', 60),\
(11720, 1, 'Processamento Paralelo', 60),\
(11721, 1, 'Teoria dos Grafos', 60),\
(11722, 1, 'Interface Humano-Computador', 60),\
(11723, 1, 'Gerência de Projetos de Software', 60),\
(11947, 1, 'Trabalho de Conclusão de Curso I', 60),\
(11948, 1, 'Estágio Supervisionado', 300),\
(11949, 1, 'Trabalho de Conclusão de Curso II', 60),\
(1, 6, 'Optativa I', 60),\
(2, 6, 'Optativa II', 60),\
(3, 6, 'Optativa III', 60),\
(4, 6, 'Optativa IV', 60),\
(5, 6, 'Atividades Complementares', 180),\
(96, 2, 'Cálculo I', 75),\
(100, 2, 'Geometria Analítica', 60),\
(6, 1, 'Matemática Discreta', 60),\
(38, 1, 'Introdução à Programação', 30),\
(36, 1, 'Introdução à Ciência da Computação', 60),\
(97, 2, 'Cálculo II', 75),\
(101, 2, 'Álgebra Linear', 60),\
(8, 1, 'Elementos de Lógica Digital', 30),\
(7, 1, 'Programação Estruturada', 60),\
(34, 1, 'Resolução de Problemas', 60),\
(98, 2, 'Cálculo III', 75),\
(9, 1, 'Probabilidade e Estatística', 60),\
(10, 1, 'Lógica para Computação', 60),\
(11, 1, 'Estrutura de Dados I', 60),\
(35, 1, 'Projeto Integrador I', 60),\
(12, 1, 'Engenharia de Software', 60),\
(13, 1, 'Algoritmos Numéricos I', 60),\
(10166, 4, 'Pesquisa Operacional I', 60),\
(25, 1, 'Teoria da Computação e Linguagens Formais', 60),\
(14, 1, 'Programação Orientada à Objetos', 60),\
(15, 1, 'Estrutura de Dados II', 60),\
(16, 1, 'Engenharia de Requisitos de Software', 60),\
(18, 1, 'Arquitetura de Computadores I', 90),\
(26, 1, 'Linguagens de Programação', 60),\
(27, 1, 'Fundamentos de Computação Gráfica e Mídias Digitais', 60),\
(17, 1, 'Projeto e Análise de Algoritmos', 60),\
(28, 1, 'Banco de Dados I', 60),\
(19, 1, 'Sistemas Operacionais', 60),\
(100005, 6, 'Optativa I', 60),\
(20, 1, 'Inteligência Artificial', 60),\
(21, 1, 'Teoria dos Grafos', 60),\
(100006, 6, 'Optativa II', 60),\
(29, 1, 'Empreendedorismo', 60),\
(22, 1, 'Redes de Computadores', 60),\
(30, 1, 'Compiladores', 60),\
(100007, 6, 'Optativa III', 60),\
(31, 1, 'Projeto de Sistemas de Software', 60),\
(100008, 6, 'Optativa IV', 60),\
(23, 1, 'Segurança da Informação', 60),\
(24, 1, 'Computação Paralela e Distribuída', 60),\
(111111, 1, 'Trabalho de Conclusão de Curso', 60),\
(32, 1, 'Interação Homem Computador', 60),\
(33, 1, 'Banco de Dados II', 60),\
(100009, 6, 'Optativa V', 60);\
\
INSERT INTO componente_curricular ( cod_comp_curricular, cod_disciplina, cod_departamento, cod_ppc, periodo, qtd_credito, tipo_disciplina ) VALUES \
(1, 5670, 2, 1, 1, 5, 'OBRIGATORIA'),\
(2, 5677, 2, 1, 1, 4, 'OBRIGATORIA'),\
(3, 10403, 1, 1, 1, 3, 'OBRIGATORIA'),\
(4, 10404, 1, 1, 1, 3, 'OBRIGATORIA'),\
(5, 10402, 1, 1, 1, 4, 'OBRIGATORIA'),\
(6, 5855, 2, 1, 2, 5, 'OBRIGATORIA'),\
(7, 10112, 3, 1, 2, 5, 'OBRIGATORIA'),\
(8, 10618, 1, 1, 2, 4, 'OBRIGATORIA'),\
(9, 5689, 2, 1, 2, 4, 'OBRIGATORIA'),\
(10, 10617, 1, 1, 2, 2, 'OBRIGATORIA'),\
(11, 10619, 1, 1, 2, 3, 'OBRIGATORIA'),\
(12, 6016, 2, 1, 3, 5, 'OBRIGATORIA'),\
(13, 10795, 3, 1, 3, 5, 'OBRIGATORIA'),\
(14, 5968, 1, 1, 3, 3, 'OBRIGATORIA'),\
(15, 11274, 1, 1, 3, 3, 'OBRIGATORIA'),\
(16, 10796, 1, 1, 3, 4, 'OBRIGATORIA'),\
(17, 10794, 1, 1, 3, 4, 'OBRIGATORIA'),\
(18, 11231, 1, 1, 4, 4, 'OBRIGATORIA'),\
(19, 6101, 2, 1, 4, 4, 'OBRIGATORIA'),\
(20, 10166, 4, 1, 4, 3, 'OBRIGATORIA'),\
(21, 11092, 1, 1, 4, 4, 'OBRIGATORIA'),\
(22, 11275, 1, 1, 4, 3, 'OBRIGATORIA'),\
(23, 11232, 1, 1, 4, 4, 'OBRIGATORIA'),\
(24, 6281, 3, 1, 5, 4, 'OBRIGATORIA'),\
(25, 8065, 1, 1, 5, 4, 'OBRIGATORIA'),\
(26, 6227, 1, 1, 5, 4, 'OBRIGATORIA'),\
(27, 6226, 1, 1, 5, 4, 'OBRIGATORIA'),\
(28, 8156, 1, 1, 5, 5, 'OBRIGATORIA'),\
(29, 11233, 5, 1, 5, 3, 'OBRIGATORIA'),\
(30, 11464, 1, 1, 6, 4, 'OBRIGATORIA'),\
(31, 8409, 1, 1, 6, 3, 'OBRIGATORIA'),\
(32, 8403, 1, 1, 6, 4, 'OBRIGATORIA'),\
(33, 8276, 1, 1, 6, 4, 'OBRIGATORIA'),\
(34, 8119, 1, 1, 6, 4, 'OBRIGATORIA'),\
(35, 11466, 1, 1, 6, 3, 'OBRIGATORIA'),\
(36, 11468, 1, 1, 6, 4, 'OBRIGATORIA'),\
(37, 8384, 1, 1, 7, 3, 'OBRIGATORIA'),\
(38, 8118, 1, 1, 7, 4, 'OBRIGATORIA'),\
(39, 11492, 1, 1, 7, 4, 'OBRIGATORIA'),\
(40, 8083, 1, 1, 7, 5, 'OBRIGATORIA'),\
(41, 11491, 1, 1, 7, 3, 'OBRIGATORIA'),\
(42, 11471, 1, 1, 7, 4, 'OBRIGATORIA'),\
(43, 11465, 1, 1, 7, 4, 'OBRIGATORIA'),\
(44, 1, 6, 1, 8, 0, 'OPTATIVA'),\
(45, 11718, 1, 1, 8, 2, 'OBRIGATORIA'),\
(46, 11719, 1, 1, 8, 4, 'OBRIGATORIA'),\
(47, 11720, 1, 1, 8, 3, 'OBRIGATORIA'),\
(48, 11721, 1, 1, 8, 4, 'OBRIGATORIA'),\
(49, 11722, 1, 1, 8, 4, 'OBRIGATORIA'),\
(50, 11723, 1, 1, 8, 4, 'OBRIGATORIA'),\
(51, 2, 6, 1, 9, 0, 'OPTATIVA'),\
(52, 3, 6, 1, 9, 0, 'OPTATIVA'),\
(53, 4, 6, 1, 9, 0, 'OPTATIVA'),\
(54, 11947, 1, 1, 9, 4, 'OBRIGATORIA'),\
(55, 11948, 1, 1, 10, 5, 'OBRIGATORIA'),\
(56, 5, 6, 1, 10, 0, 'OBRIGATORIA'),\
(57, 11949, 1, 1, 10, 4, 'OBRIGATORIA'),\
(58, 96, 2, 2, 1, 0, 'OBRIGATORIA'),\
(59, 100, 2, 2, 1, 0, 'OBRIGATORIA'),\
(60, 6, 1, 2, 1, 0, 'OBRIGATORIA'),\
(61, 38, 1, 2, 1, 0, 'OBRIGATORIA'),\
(62, 36, 1, 2, 1, 0, 'OBRIGATORIA'),\
(63, 97, 2, 2, 2, 0, 'OBRIGATORIA'),\
(64, 101, 2, 2, 2, 0, 'OBRIGATORIA'),\
(65, 8, 1, 2, 2, 0, 'OBRIGATORIA'),\
(66, 7, 1, 2, 2, 0, 'OBRIGATORIA'),\
(67, 34, 1, 2, 2, 0, 'OBRIGATORIA'),\
(68, 98, 2, 2, 3, 0, 'OBRIGATORIA'),\
(69, 9, 1, 2, 3, 0, 'OBRIGATORIA'),\
(70, 10, 1, 2, 3, 0, 'OBRIGATORIA'),\
(71, 11, 1, 2, 3, 0, 'OBRIGATORIA'),\
(72, 35, 1, 2, 3, 0, 'OBRIGATORIA'),\
(73, 12, 1, 2, 3, 0, 'OBRIGATORIA'),\
(74, 13, 1, 2, 4, 0, 'OBRIGATORIA'),\
(75, 10166, 4, 2, 4, 0, 'OBRIGATORIA'),\
(76, 25, 1, 2, 4, 0, 'OBRIGATORIA'),\
(77, 14, 1, 2, 4, 0, 'OBRIGATORIA'),\
(78, 15, 1, 2, 4, 0, 'OBRIGATORIA'),\
(79, 16, 1, 2, 4, 0, 'OBRIGATORIA'),\
(80, 18, 1, 2, 5, 0, 'OBRIGATORIA'),\
(81, 26, 1, 2, 5, 0, 'OBRIGATORIA'),\
(82, 27, 1, 2, 5, 0, 'OBRIGATORIA'),\
(83, 17, 1, 2, 5, 0, 'OBRIGATORIA'),\
(84, 28, 1, 2, 5, 0, 'OBRIGATORIA'),\
(85, 19, 1, 2, 6, 0, 'OBRIGATORIA'),\
(86, 1, 6, 2, 6, 0, 'OPTATIVA'),\
(87, 20, 1, 2, 6, 0, 'OBRIGATORIA'),\
(88, 21, 1, 2, 6, 0, 'OBRIGATORIA'),\
(89, 2, 6, 2, 6, 0, 'OPTATIVA'),\
(90, 29, 1, 2, 7, 0, 'OBRIGATORIA'),\
(91, 22, 1, 2, 7, 0, 'OBRIGATORIA'),\
(92, 30, 1, 2, 7, 0, 'OBRIGATORIA'),\
(93, 3, 6, 2, 7, 0, 'OPTATIVA'),\
(94, 31, 1, 2, 7, 0, 'OBRIGATORIA'),\
(95, 4, 6, 2, 7, 0, 'OPTATIVA'),\
(96, 23, 1, 2, 8, 0, 'OBRIGATORIA'),\
(97, 24, 1, 2, 8, 0, 'OBRIGATORIA'),\
(98, 111111, 1, 2, 8, 0, 'OBRIGATORIA'),\
(99, 32, 1, 2, 8, 0, 'OBRIGATORIA'),\
(100, 33, 1, 2, 8, 0, 'OBRIGATORIA'),\
(101, 5, 6, 2, 8, 0, 'OPTATIVA');\
\
INSERT INTO dependencia ( cod_comp_curricular, cod_cc_pre_requisito ) VALUES \
(6, 1),\
(7, 1),\
(8, 1),\
(9, 2),\
(10, 3),\
(11, 4),\
(12, 6),\
(13, 6),\
(14, 11),\
(16, 3),\
(17, 5),\
(18, 6),\
(18, 14),\
(19, 6),\
(20, 1),\
(20, 9),\
(20, 14),\
(21, 11),\
(22, 16),\
(24, 13),\
(25, 14),\
(25, 3),\
(26, 21),\
(27, 14),\
(28, 21),\
(30, 18),\
(31, 10),\
(31, 11),\
(32, 25),\
(33, 14),\
(34, 21),\
(34, 26),\
(35, 28),\
(36, 26),\
(36, 23),\
(37, 31),\
(38, 25),\
(38, 26),\
(38, 33),\
(39, 33),\
(39, 27),\
(40, 27),\
(41, 21),\
(42, 28),\
(43, 27),\
(43, 17),\
(45, 32),\
(46, 32),\
(47, 32),\
(47, 25),\
(47, 43),\
(48, 27),\
(49, 40),\
(49, 28),\
(50, 28),\
(57, 54),\
(63, 58),\
(64, 59),\
(65, 62),\
(66, 61),\
(68, 63),\
(69, 58),\
(70, 62),\
(71, 66),\
(73, 67),\
(74, 64),\
(75, 71),\
(76, 71),\
(77, 66),\
(78, 71),\
(79, 73),\
(80, 71),\
(81, 77),\
(82, 78),\
(83, 78),\
(84, 78),\
(85, 80),\
(87, 78),\
(88, 78),\
(91, 65),\
(92, 76),\
(94, 73),\
(96, 91),\
(97, 85),\
(99, 82),\
(100, 84);\
\
INSERT INTO corresponde ( cod_comp_curricular, cod_cc_corresp, percentual_corresp ) VALUES \
(1, 58, 1),\
(2, 59, 1),\
(5, 60, 1),\
(3, 62, 0.5),\
(15, 62, 0.5),\
(6, 63, 1),\
(9, 64, 1),\
(10, 65, 1),\
(11, 66, 1),\
(12, 68, 1),\
(8, 69, 1),\
(16, 70, 0.5),\
(23, 70, 0.5),\
(14, 71, 1),\
(28, 73, 1),\
(18, 74, 1),\
(20, 75, 1),\
(33, 76, 0.5),\
(39, 76, 0.5),\
(21, 77, 1),\
(27, 78, 1),\
(35, 79, 1),\
(25, 80, 1),\
(26, 81, 1),\
(34, 82, 0.5),\
(41, 82, 0.5),\
(43, 83, 1),\
(40, 84, 1),\
(32, 85, 1),\
(36, 87, 1),\
(48, 88, 1),\
(22, 90, 1),\
(37, 91, 1),\
(38, 92, 1),\
(42, 94, 1),\
(54, 98, 1),\
(49, 99, 1),\
(47, 97, 1),\
(44,  89,  1),\
(51,  93,  1),\
(52,  95,  1),\
(53,  101, 1),\
(56,  100, 1),\
(20,  75,  1);"


/*const add = "INSERT INTO corresponde ( cod_comp_curricular, cod_cc_corresp, percentual_corresp ) VALUES \
(51,89,1), (52,93,1), (53,95,1);"
*/
const add = "INSERT INTO dependencia ( cod_comp_curricular, cod_cc_pre_requisito) VALUES \
(49,41);"

/*const add = "INSERT INTO disciplina ( cod_disciplina, cod_departamento, nome, carga_horaria ) VALUES \
(10166, 4, 'Pesquisa Operacional I', 60);"
*/

const empty = "";
// const del = "DELETE FROM corresponde WHERE cod_comp_curricular = 44 AND cod_cc_corresp = 89;"
const del = "DELETE FROM dependencia WHERE cod_comp_curricular = 49 AND cod_cc_pre_requisito = 40;"

const query = create_db + "\n" + charge_db;

    db.getRecords( del, (result) => {
        res.send( "BD criado e populado com sucesso!");
    })

});



    
/*var pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL_POST,
    });

pool.connect()
    .then( client => {
        var result_curso, result_grade;
        // const qr_disc_ppc = "SELECT D.nome, D.carga_horaria, CC.cod_comp_curricular from disciplina as D, componente_curricular as CC \
        // WHERE CC.cod_ppc = " + req.params.curso + " AND CC.periodo = " + req.params.periodo + " AND CC.cod_disciplina = D.cod_disciplina AND CC.cod_departamento = D.cod_departamento ORDER BY CC.cod_comp_curricular;"
        const qr_curso = "SELECT * FROM curso; "
        
        client.query( qr_curso )
            .then( result => {
                client.release()
                result_curso = result.rows;
                console.log( result_curso )
                res.render('index', { title: 'Seus putos', cursos : result_curso } )
                // res.render('pages/home_construcao', { title: 'Seus putos', data : result.rows } )
                // res.send( result.rows )
            }) 
            .catch(e => console.error(e.stack)) 
            .then(() => client.end(console.log('Conexao fechada')))
    })
    
pool.end( ()=>{console.log("pool finalizado")} ) 
});*/



module.exports = router;

/*module.exports = 
{
    consultar : function() 
    {
        var r;

        var pool = new pg.Pool({
            connectionString: process.env.DATABASE_URL_POST,
        });

        pool.connect()
        .then( client => {
            const criar_bd = ""
            // const qr_disc_ppc = "SELECT D.nome, D.carga_horaria, CC.cod_comp_curricular from disciplina as D, componente_curricular as CC \
            // WHERE CC.cod_ppc = " + req.params.curso + " AND CC.periodo = " + req.params.periodo + " AND CC.cod_disciplina = D.cod_disciplina AND CC.cod_departamento = D.cod_departamento ORDER BY CC.cod_comp_curricular;"
            const qr_disc_ppc = "SELECT * FROM curso; "
            
            client.query( qr_disc_ppc )
                .then( result => {
                    client.release()
                    console.log( result.rows )
                    r = result.rows;
                }) 
                .catch(e => console.error(e.stack)) 
                .then(() => { client.end(console.log('Conexao fechada'));
                return r; })

    })
    
    pool.end( ()=>{console.log("pool finalizado")} ) 
    }

}*/

/*const pg = require('pg');

module.exports = {

    consultar : function ( query, cod_curso, periodo ) {
    var res_consulta;
    var pool = new pg.Pool({
            connectionString: process.env.DATABASE_URL_POST,
        });

    pool.connect()
        .then( client => {
            return client.query( query )
                .then( result => {
                    client.release()
                    console.log( result.rows )
                    res_consulta = result.rows;
                }) 
                .catch(e => console.error(e.stack)) 
                .then(() => client.end(console.log('Conexao fechada')))

        })
        
    pool.end( ()=>{console.log("pool finalizado")} )
    }
}*/