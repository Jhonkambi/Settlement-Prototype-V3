// Global Variables
let quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
let categories = JSON.parse(localStorage.getItem('categories') || '["General"]');
let currentEditingQuiz = null;

// DOM Elements
const DOM = {
  categoryName: document.getElementById('categoryName'),
  addCategoryBtn: document.getElementById('addCategoryBtn'),
  categoryList: document.getElementById('categoryList'),
  addQuizBtn: document.getElementById('addQuizBtn'),
  importBtn: document.getElementById('importBtn'),
  exportBtn: document.getElementById('exportBtn'),
  importFileInput: document.getElementById('importFileInput'),
  quizList: document.getElementById('quizList'),
  quizForm: document.getElementById('quizForm'),
  quizTitle: document.getElementById('quizTitle'),
  quizCategory: document.getElementById('quizCategory'),
  quizDescription: document.getElementById('quizDescription'),
  quizDateTime: document.getElementById('quizDateTime'), // New date and time input
  questionsContainer: document.getElementById('questionsContainer'),
  addQuestionBtn: document.getElementById('addQuestionBtn'),
  saveQuizBtn: document.getElementById('saveQuizBtn'),
  addQuizModal: new bootstrap.Modal(document.getElementById('addQuizModal'))
};

// Initialize
function init() {
  loadCategories();
  loadQuizzes();
  setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
  DOM.addCategoryBtn.addEventListener('click', addCategory);
  DOM.addQuizBtn.addEventListener('click', showAddQuizModal);
  DOM.importBtn.addEventListener('click', () => DOM.importFileInput.click());
  DOM.exportBtn.addEventListener('click', exportQuizzes);
  DOM.importFileInput.addEventListener('change', handleFileImport);
  DOM.addQuestionBtn.addEventListener('click', addQuestion);
  DOM.saveQuizBtn.addEventListener('click', saveQuiz);
}

// Category Functions
function loadCategories() {
  DOM.categoryList.innerHTML = '';
  categories.forEach((category, index) => {
    const categoryElement = document.createElement('div');
    categoryElement.className = 'quiz-item';
    categoryElement.innerHTML = `
      <span>${category}</span>
      <div class="action-buttons">
        <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${index})">Delete</button>
      </div>
    `;
    DOM.categoryList.appendChild(categoryElement);
  });
}

function addCategory() {
  const name = DOM.categoryName.value.trim();
  if (!name) return;
  
  if (!categories.includes(name)) {
    categories.push(name);
    saveCategories();
    loadCategories();
    DOM.categoryName.value = '';
  } else {
    alert('Category already exists');
  }
}

function deleteCategory(index) {
  if (quizzes.some(quiz => quiz.category === categories[index])) {
    alert('Cannot delete - category is in use by quizzes');
    return;
  }
  if (confirm(`Delete category "${categories[index]}"?`)) {
    categories.splice(index, 1);
    saveCategories();
    loadCategories();
  }
}

function saveCategories() {
  localStorage.setItem('categories', JSON.stringify(categories));
}

// Quiz Functions
function loadQuizzes() {
  DOM.quizList.innerHTML = '';
  quizzes.forEach((quiz, index) => {
    const quizElement = document.createElement('div');
    quizElement.className = 'quiz-item';
    quizElement.innerHTML = `
      <div>
        <strong>${quiz.title}</strong>
        <div class="text-muted small">${quiz.category} | ${quiz.questions.length} questions | Scheduled: ${new Date(quiz.dateTime).toLocaleString()}</div>
      </div>
      <div class="action-buttons">
        <button class="btn btn-sm btn-outline-primary" onclick="editQuiz(${index})">Edit</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteQuiz(${index})">Delete</button>
      </div>
    `;
    DOM.quizList.appendChild(quizElement);
  });
}

function showAddQuizModal() {
  currentEditingQuiz = null;
  DOM.quizForm.reset();
  DOM.questionsContainer.innerHTML = '';
  loadCategoryDropdown();
  DOM.addQuizModal.show();
}

function loadCategoryDropdown() {
  DOM.quizCategory.innerHTML = '<option value="">Select a category</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    DOM.quizCategory.appendChild(option);
  });
}

function addQuestion() {
  const questionCount = DOM.questionsContainer.children.length + 1;
  const questionHTML = `
    <div class="card mb-3">
      <div class="card-header d-flex justify-content-between align-items-center">
        Question ${questionCount}
        <button type="button" class="btn-close" onclick="this.parentNode.parentNode.remove()"></button>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <label class="form-label">Question Text</label>
          <input type="text" class="form-control question-text" required>
        </div>
        
        <div class="mb-3">
          <label class="form-label">Question Type</label>
          <select class="form-select question-type" onchange="changeQuestionType(this)">
            <option value="multiple-choice">Multiple Choice</option>
            <option value="yes-no">Yes/No</option>
            <option value="short-answer">Short Answer</option>
          </select>
        </div>
        
        <div class="question-options-container" id="options-container">
          <div class="mb-3">
            <label class="form-label">Options (mark correct answer)</label>
            <div class="option-list">
              <div class="d-flex align-items-center mb-2">
                <input type="radio" name="correct-option" class="me-2">
                <input type="text" class="form-control form-control-sm option-text" placeholder="Option 1" required>
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="this.parentNode.remove()">×</button>
              </div>
              <div class="d-flex align-items-center mb-2">
                <input type="radio" name="correct-option" class="me-2">
                <input type="text" class="form-control form-control-sm option-text" placeholder="Option 2" required>
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="this.parentNode.remove()">×</button>
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-primary mt-2" onclick="addOption(this)">Add Option</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  DOM.questionsContainer.insertAdjacentHTML('beforeend', questionHTML);
}

function addOption(button) {
  const container = button.closest('.mb-3');
  const optionList = container.querySelector('.option-list');
  
  const optionHTML = `
    <div class="d-flex align-items-center mb-2">
      <input type="radio" name="correct-option" class="me-2">
      <input type="text" class="form-control form-control-sm option-text" placeholder="New option" required>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="this.parentNode.remove()">×</button>
    </div>
  `;
  
  optionList.insertAdjacentHTML('beforeend', optionHTML);
}

function changeQuestionType(select) {
  const questionCard = select.closest('.card');
  const optionsContainer = questionCard.querySelector('.question-options-container');
  
  switch (select.value) {
    case 'multiple-choice':
      optionsContainer.innerHTML = `
        <div class="mb-3">
          <label class="form-label">Options (mark correct answer)</label>
          <div class="option-list">
            <div class="d-flex align-items-center mb-2">
              <input type="radio" name="correct-option" class="me-2">
              <input type="text" class="form-control form-control-sm option-text" placeholder="Option 1" required>
              <button class="btn btn-sm btn-outline-danger ms-2" onclick="this.parentNode.remove()">×</button>
            </div>
            <div class="d-flex align-items-center mb-2">
              <input type="radio" name="correct-option" class="me-2">
              <input type="text" class="form-control form-control-sm option-text" placeholder="Option 2" required>
              <button class="btn btn-sm btn-outline-danger ms-2" onclick="this.parentNode.remove()">×</button>
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-outline-primary mt-2" onclick="addOption(this)">Add Option</button>
        </div>
      `;
      break;
      
    case 'yes-no':
      optionsContainer.innerHTML = `
        <div class="mb-3">
          <label class="form-label">Correct Answer</label>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="correct-option" id="yes-option" value="Yes">
            <label class="form-check-label" for="yes-option">Yes</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="correct-option" id="no-option" value="No">
            <label class="form-check-label" for="no-option">No</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="correct-option" id="void-option" value="Void">
            <label class="form-check-label" for="void-option">Void</label>
          </div>
        </div>
      `;
      break;
      
    case 'short-answer':
      optionsContainer.innerHTML = `
        <div class="mb-3">
          <label class="form-label">Correct Answer</label>
          <input type="text" class="form-control correct-answer" placeholder="Enter your answer" required>
        </div>
      `;
      break;
  }
}

function saveQuiz() {
  const title = DOM.quizTitle.value.trim();
  const category = DOM.quizCategory.value;
  const description = DOM.quizDescription.value.trim();
  const dateTime = DOM.quizDateTime.value; // Get the combined date and time
  
  // Basic validation
  if (!title || !category || !dateTime) {
    alert('Please fill in all required fields');
    return;
  }
  
  const questionElements = DOM.questionsContainer.children;
  if (questionElements.length === 0) {
    alert('Please add at least one question');
    return;
  }
  
  const questions = [];
  
  // Process each question
  for (let i = 0; i < questionElements.length; i++) {
    const questionCard = questionElements[i];
    const questionText = questionCard.querySelector('.question-text').value.trim();
    const questionType = questionCard.querySelector('.question-type').value;
    
    if (!questionText) {
      alert(`Please enter text for question ${i + 1}`);
      return;
    }
    
    const questionObj = {
      text: questionText,
      type: questionType
    };
    
    // Process based on question type
    switch (questionType) {
      case 'multiple-choice':
        const options = [];
        const optionInputs = questionCard.querySelectorAll('.option-text');
        const correctOption = questionCard.querySelector('input[type="radio"]:checked');
        
        optionInputs.forEach(input => {
          const optionText = input.value.trim();
          if (optionText) options.push(optionText);
        });
        
        if (options.length < 2) {
          alert(`Question ${i + 1}: Multiple choice needs at least 2 options`);
          return;
        }
        
        if (!correctOption) {
          alert(`Question ${i + 1}: Please select the correct answer`);
          return;
        }
        
        questionObj.options = options;
        questionObj.correctIndex = Array.from(questionCard.querySelectorAll('input[type="radio"]'))
          .indexOf(correctOption);
        break;
        
      case 'yes-no':
        const isYes = questionCard.querySelector('#yes-option:checked');
        const isNo = questionCard.querySelector('#no-option:checked');
        const isVoid = questionCard.querySelector('#void-option:checked');
        
        if (!isYes && !isNo && !isVoid) {
          alert(`Question ${i + 1}: Please select the correct answer`);
          return;
        }
        
        questionObj.correctAnswer = isYes ? 'Yes' : (isNo ? 'No' : 'Void');
        break;
        
      case 'short-answer':
        const answer = questionCard.querySelector('.correct-answer').value.trim();
        if (!answer) {
          alert(`Question ${i + 1}: Please enter the correct answer`);
          return;
        }
        questionObj.correctAnswer = answer;
        break;
    }
    
    questions.push(questionObj);
  }
  
  // Create quiz object
  const quizData = {
    id: currentEditingQuiz?.id || `qz-${Date.now()}`,
    title,
    category,
    description,
    dateTime, // Include the combined date and time
    questions,
    createdAt: new Date().toISOString()
  };
  
  // Update or add quiz
  if (currentEditingQuiz) {
    const index = quizzes.findIndex(q => q.id === currentEditingQuiz.id);
    if (index !== -1) quizzes[index] = quizData;
  } else {
    quizzes.push(quizData);
  }
  
  saveQuizzes();
  loadQuizzes();
  DOM.addQuizModal.hide();
  alert('Quiz saved successfully!');
}

function editQuiz(index) {
  currentEditingQuiz = quizzes[index];
  DOM.quizTitle.value = currentEditingQuiz.title;
  DOM.quizDescription.value = currentEditingQuiz.description || '';
  DOM.quizDateTime.value = currentEditingQuiz.dateTime; // Set the date and time
  loadCategoryDropdown();
  DOM.quizCategory.value = currentEditingQuiz.category;
  DOM.questionsContainer.innerHTML = '';
  
  // Add questions
  currentEditingQuiz.questions.forEach(question => {
    addQuestion();
    const questionCard = DOM.questionsContainer.lastElementChild;
    
    questionCard.querySelector('.question-text').value = question.text;
    const typeSelect = questionCard.querySelector('.question-type');
    typeSelect.value = question.type;
    changeQuestionType(typeSelect);
    
    // Set the answer based on question type
    switch (question.type) {
      case 'multiple-choice':
        const optionsContainer = questionCard.querySelector('.option-list');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, i) => {
          const optionHTML = `
            <div class="d-flex align-items-center mb-2">
              <input type="radio" name="correct-option" class="me-2" ${i === question.correctIndex ? 'checked' : ''}>
              <input type="text" class="form-control form-control-sm option-text" value="${option}" required>
              <button class="btn btn-sm btn-outline-danger ms-2" onclick="this.parentNode.remove()">×</button>
            </div>
          `;
          optionsContainer.insertAdjacentHTML('beforeend', optionHTML);
        });
        break;
        
      case 'yes-no':
        const correctValue = question.correctAnswer.toLowerCase();
        questionCard.querySelector(`#${correctValue}-option`).checked = true;
        break;
        
      case 'short-answer':
        questionCard.querySelector('.correct-answer').value = question.correctAnswer;
        break;
    }
  });
  
  DOM.addQuizModal.show();
}

function deleteQuiz(index) {
  if (confirm(`Delete quiz "${quizzes[index].title}"?`)) {
    quizzes.splice(index, 1);
    saveQuizzes();
    loadQuizzes();
  }
}

function saveQuizzes() {
  localStorage.setItem('quizzes', JSON.stringify(quizzes));
}

// Import/Export Functions
function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      if (Array.isArray(importedData)) {
        // Merge with existing quizzes
        quizzes = [...quizzes, ...importedData];
        saveQuizzes();
        loadQuizzes();
        alert(`${importedData.length} quizzes imported successfully!`);
      } else {
        alert('Invalid file format. Please import a valid JSON file.');
      }
    } catch (error) {
      console.error('Error importing quizzes:', error);
      alert('Error importing quizzes. Please check the file format.');
    }
  };
  reader.readAsText(file);
}

function exportQuizzes() {
  if (quizzes.length === 0) {
    alert('No quizzes to export');
    return;
  }
  
  const dataStr = JSON.stringify(quizzes, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileName = `quizzes-export-${new Date().toISOString().slice(0, 10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileName);
  linkElement.click();
}

// Global functions for button actions
window.deleteCategory = deleteCategory;
window.deleteQuiz = deleteQuiz;
window.editQuiz = editQuiz;

// Initialize the settings page
document.addEventListener('DOMContentLoaded', init);
