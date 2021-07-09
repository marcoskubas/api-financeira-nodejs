const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

const customers = [];

// Middleware
function verifyIfExistAccountCPF(request, response, next){
    const { cpf }  = request.headers;
    const customer = customers.find(customer => customer.cpf == cpf);
    if(!customer){
        return response.status(404).json({error: "Customer not found!"});
    }
    request.customer = customer;
    return next();
}

function getBalance(statement){
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'credit'){
            return acc + operation.amount;
        }else{
            return acc - operation.amount;
        }
    }, 0);
    return balance;
}

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

//app.use(verifyIfExistAccountCPF);

app.get('/statement', verifyIfExistAccountCPF, (request, response) => {
    const { customer } = request;
    console.log(customer);
    return response.json(customer.statement);
});

app.post('/deposit', verifyIfExistAccountCPF, (request, response) => {
    const { description, amount, type } = request.body;
    const { customer } = request;
    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type
    }
    customer.statement.push(statementOperation);
    console.log(customer);
    return response.status(201).send();
});

app.post('/withdraw', verifyIfExistAccountCPF, (request, response) => {
    const { amount }   = request.body;
    const { customer } = request;
    const balance = getBalance(customer.statement);
    console.log(balance);
    if(balance < amount){
        return response.status(400).json({error: "Insufficient funds!"});
    }
    const statementOperation = {
        description: "saque",
        amount,
        created_at: new Date(),
        type: "debit"
    }
    customer.statement.push(statementOperation);
    console.log(customer);
    return response.status(201).send();
});

//localhost:3000
app.listen(3000);