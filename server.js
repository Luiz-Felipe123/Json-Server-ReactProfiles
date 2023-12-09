const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Nome do arquivo JSON para armazenar os alunos
const dataFilePath = "students.json";

// Função para gerar IDs únicos
function generateUniqueId() {
  return uuidv4();
}

const readDataFromFile = async () => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler dados do arquivo:', error);
    return [];
  }
};

// Função para salvar os dados no arquivo JSON
const saveDataToFile = async (data) => {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
    console.log('Dados salvos com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar os dados:', error);
  }
}

// Rota para listar todos os alunos
app.get("/students", (req, res) => {
  const students = readDataFromFile();
  res.json(students);
});

// Rota para adicionar um novo aluno com ID gerado automaticamente
app.post("/students", (req, res) => {
  const newStudent = req.body;
  const id = generateUniqueId(); // Gere um ID exclusivo para o novo aluno
  newStudent.id = id; // Adicione o ID ao objeto do aluno
  const students = readDataFromFile(); // Leia os alunos do arquivo JSON
  saveDataToFile([...students, newStudent]); // Salva os alunos atualizados no arquivo JSON (incluindo o novo aluno)
  res.status(201).json(newStudent);
});

app.put("/students/:id", (req, res) => {
  const id = req.params.id;
  const updatedStudent = req.body;
  const students = readDataFromFile();

  console.log("Requisição de edição recebida para o aluno com ID:", id);
  
  const studentIndex = students.findIndex((student) => student.id === id);
  if (studentIndex !== -1) {
    console.log("Aluno encontrado. Atualizando informações.");
    
    // Atualize as informações do aluno
    students[studentIndex] = updatedStudent;
    saveDataToFile(students); // Salve os alunos atualizados no arquivo JSON
    res.json(updatedStudent);
  } else {
    console.log("Aluno não encontrado. Respondendo com status 404.");
    
    res.status(404).json({ error: "Aluno não encontrado" });
  }
});


app.delete("/students/:id", (req, res) => {
  const id = req.params.id;
  const students = readDataFromFile();

  const studentIndex = students.findIndex((student) => student.id === id);
  if (studentIndex !== -1) {
    students.splice(studentIndex, 1);
    saveDataToFile(students); // Salva os alunos atualizados no arquivo JSON
    res.json({ message: "Aluno excluído com sucesso" });
  } else {
    res.status(404).json({ error: "Aluno não encontrado" });
  }
});

// Inicializa o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
