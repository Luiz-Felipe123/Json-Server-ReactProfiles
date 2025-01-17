const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs").promises;
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

// Função assíncrona para ler os dados do arquivo JSON
const readDataFromFile = async () => {
  try {
    const data = await fs.readFile(dataFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler dados do arquivo:", error);
    return [];
  }
}

// Função assíncrona para salvar os dados no arquivo JSON
const saveDataToFile = async (data) => {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Erro ao salvar dados no arquivo:", error);
  }
}

// Rota para listar todos os alunos
app.get("/students", async (req, res) => {
  const students = await readDataFromFile();
  console.log("Dados enviados em resposta à solicitação GET /students:", students);
  res.json(students);
});

// Rota para adicionar um novo aluno com ID gerado automaticamente
app.post("/students", async (req, res) => {
  const newStudent = req.body;
  const id = generateUniqueId(); // Gere um ID exclusivo para o novo aluno
  newStudent.id = id; // Adicione o ID ao objeto do aluno
  const students = await readDataFromFile(); // Leia os alunos do arquivo JSON
  await saveDataToFile([...students, newStudent]); // Salva os alunos atualizados no arquivo JSON (incluindo o novo aluno)
  console.log("Novo aluno adicionado:", newStudent);
  res.status(201).json(newStudent);
});

app.put("/students/:id", async (req, res) => {
  const id = req.params.id;
  const updatedStudent = req.body;
  const students = await readDataFromFile();

  console.log("Requisição de edição recebida para o aluno com ID:", id);
  
  const studentIndex = students.findIndex((student) => student.id === id);
  if (studentIndex !== -1) {
    console.log("Aluno encontrado. Atualizando informações.");
    
    // Atualize as informações do aluno
    students[studentIndex] = updatedStudent;
    await saveDataToFile(students); // Salve os alunos atualizados no arquivo JSON
    console.log("Informações do aluno atualizadas:", updatedStudent);
    res.json(updatedStudent);
  } else {
    console.log("Aluno não encontrado. Respondendo com status 404.");
    
    res.status(404).json({ error: "Aluno não encontrado" });
  }
});

app.delete("/students/:id", async (req, res) => {
  const id = req.params.id;
  const students = await readDataFromFile();

  const studentIndex = students.findIndex((student) => student.id === id);
  if (studentIndex !== -1) {
    students.splice(studentIndex, 1);
    await saveDataToFile(students); // Salva os alunos atualizados no arquivo JSON
    console.log("Aluno excluído com sucesso. ID do aluno excluído:", id);
    res.json({ message: "Aluno excluído com sucesso" });
  } else {
    console.log("Aluno não encontrado. Respondendo com status 404.");
    res.status(404).json({ error: "Aluno não encontrado" });
  }
});

// Inicializa o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
