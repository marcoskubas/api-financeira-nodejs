const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

const customers = [];

app.use(express.json());

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement - []
 */
app.post('/account', (request, response) => {
    const { cpf,name } = request.body;
    //retorna se exist/no exist
    const customerAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
    );

    if(customerAlreadyExists){
        response.status(400).json({error: "Customer already exists!"});
    }

    customers.push({
        cpf,
        name,
        id : uuidv4(),
        statement: []
    });
    return response.status(201).send();
});

app.get('/statement/:cpf', (request, response) => {
    const { cpf }  = request.params;
    const customer = customers.find(customer => customer.cpf == cpf);
    if(customer === undefined){
        return response.status(404).json({error: "Customer not exists!"});
    }
    return response.json(customer.statement);
});

//localhost:3000
app.listen(3000);