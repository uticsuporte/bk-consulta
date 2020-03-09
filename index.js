const sql = require('mssql')
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');


//midleware from cors
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
    next();
}

var dbConfig = {
    server: 'pbsrvsql3',
    database: 'siacnetteste',
    user: 'mateus',
    password: '50FXmi00..20',
    port: 1433,
    options: {
        encrypt: false
    }
}

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded( {extended: false} ))
app.use(allowCrossDomain);


app.get('/', (req,res)=>{
    res.send({message: 'Funcionando'})
})


app.post('/', (req,res) => {

    console.log(req.body)

    var conn = new sql.ConnectionPool(dbConfig)
    var reqSql = new sql.Request(conn)

    let scriptSQL = 'select p.NomeRazaoSocial, h.Instrumento, h.NomeRealizacao, h.DataHoraInicioRealizacao '
    +'from HistoricoRealizacoesCliente_AnosAnteriores h, parceiro p '
    +'where h.CodCliente = p.CodParceiro and p.CgcCpf = ' + req.body.cpf 
    +' ORDER BY h.DataHoraInicioRealizacao DESC'

    conn.connect(function (error){
        if(error){
            console.log(error)
            res.sendStatus(401).json({message: 'Erro de conexão com o banco de dados: ', error})
            return
        }else{
            // console.log('conexao estabelecida')
            // console.log(scriptSQL)
            reqSql.query(scriptSQL, function (error,recordset){
                if(error){
                    res.sendStatus(401).json({message: 'Erro SQL: ', error})
                }else{
                    console.log(recordset.rowsAffected)
                    if(recordset.rowsAffected[0] != 0){
                        res.send({
                            message: 'Success',
                            Nome: recordset.recordset[0].NomeRazaoSocial, 
                            Historico_Realizacoes: recordset.recordset,
    
                        })
                    }else{
                        res.send({message: 'data not found'})
                    }
                    conn.close()
                }
            })
        }
    })
    
})

const port = 8080

app.listen(process.env.PORT || port , () => {
    console.log('Server running in localhost: ' + port)
})

