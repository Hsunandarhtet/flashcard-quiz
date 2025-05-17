document.getElementById("csvFileInput").addEventListener("change", function(event) {
    const fileList = document.getElementById("fileList");
    if (this.files.length > 0) {
        fileList.innerHTML = Array.from(this.files).map(file => `✔ ${file.name}`).join("<br>");
    } else {
        fileList.innerHTML = "No files selected";
    }
});
    
document.getElementById("csvFileInput").addEventListener("change", handleFiles, false);

function handleFiles(event) {
const files = event.target.files;
let allQuestions = [];
let allMeanings = [];
let filesProcessed = 0;

for (let file of files) {
const reader = new FileReader();

reader.onload = function (e) {
    const content = e.target.result;
    const questions = parseCSV(content);
    allQuestions = allQuestions.concat(questions);
    allMeanings = allMeanings.concat(questions.map(q => q.meaning));
    filesProcessed++;
    
    if (filesProcessed === files.length) {
        allQuestions.forEach(q => {
            q.options = generateOptions(q.meaning, allMeanings);
        });
        const isLearningMode = document.getElementById("learningCheckbox").checked;
            if (isLearningMode) {
                generateQuizLearn(allQuestions);
            } else {
                generateQuiz(allQuestions);
            }
    }
};

reader.readAsText(file);
}
}

function parseCSV(csv) {
const lines = csv.split("\n");
const questions = [];

for (let i = 0; i < lines.length; i++) {
const parts = lines[i].split(",");
if (parts.length === 2) {
    const meaning = parts[1].trim();
    questions.push({
        japanese: parts[0],
        meaning: meaning
    });
}
}

return questions;
}

function generateOptions(correctAnswer, allMeanings) {
let options = new Set();
options.add(correctAnswer);
while (options.size < 4) {
const randomAnswer = allMeanings[Math.floor(Math.random() * allMeanings.length)];
options.add(randomAnswer);
}
return Array.from(options).sort(() => Math.random() - 0.5);
}

function generateQuizLearn(questions) {
    const quizContainer = document.getElementById("quiz");
    quizContainer.innerHTML = "";

    questions.forEach((q, index) => {
        const questionElement = document.createElement("div");
        questionElement.classList.add("flashcard");
        questionElement.innerHTML = `
            <p class="question">${index + 1}. ${q.japanese}</p>
            <p class="answer-feedback">💡 ${q.meaning}</p>
        `;
        quizContainer.appendChild(questionElement);
    });
}
function generateQuiz(questions) {
    const quizContainer = document.getElementById("quiz");
    quizContainer.innerHTML = "";

    // Shuffle the questions using Fisher-Yates algorithm
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    // Limit the number of questions to 35
    const selectedQuestions = questions.slice(0, 35);

    selectedQuestions.forEach((q, index) => {
        const questionElement = document.createElement("div");
        questionElement.classList.add("flashcard");
        questionElement.innerHTML = `<p class="question">${index + 1}. ${q.japanese}</p>`;

        q.options.forEach(option => {
            const label = document.createElement("label");
            label.classList.add("option");
            const input = document.createElement("input");
            input.type = "radio";
            input.name = `question${index}`;
            input.value = option;

            label.appendChild(input);
            label.appendChild(document.createTextNode(option));
            questionElement.appendChild(label);
        });

        quizContainer.appendChild(questionElement);
    });

    const submitButton = document.createElement("button");
    submitButton.innerText = "🚀 Submit";
    submitButton.classList.add("submit-btn");
    submitButton.addEventListener("click", () => checkAnswers(selectedQuestions));
    quizContainer.appendChild(submitButton);
}



function checkAnswers(questions) {
let score = 0;
const quizContainer = document.getElementById("quiz");

questions.forEach((q, index) => {
const selectedOption = document.querySelector(`input[name=question${index}]:checked`);
const footer = document.createElement("div");
footer.classList.add("answer-feedback");

if (selectedOption && selectedOption.value === q.meaning) {
    score++;
    footer.innerHTML = `<span class="correct">✨ Correct!</span>`;
} else {
    footer.innerHTML = `<span class="incorrect">🌚 ${q.meaning}</span>`;
}

quizContainer.children[index].appendChild(footer); // Append feedback to the question block
});

alert(`Your score: ${score}/${questions.length}`);
}
