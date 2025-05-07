// script.js

// Get references to the HTML elements we need
const scoreSpan = document.getElementById('current-score');
const questionText = document.getElementById('question-text');
const optionsArea = document.getElementById('options-area'); // Not strictly needed if using querySelectorAll on buttons
const feedbackText = document.getElementById('feedback-text');
const nextButton = document.getElementById('next-question-btn');
const optionButtons = document.querySelectorAll('.option-btn'); // Get all buttons with class 'option-btn'

let currentScore = 0;
let correctAnswer = null; // Variable to store the correct answer for the current question

// Function to generate a random integer within a range
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate a math question, answer, and options
function generateQuestion() {
    // Let's start with simple operations for now and build up complexity
    // Adjusted range slightly for 8th grade medium difficulty potential
    const num1 = getRandomInt(10, 100);
    const num2 = getRandomInt(5, 80);
    const operators = ['+', '-', '*']; // Include division and more complex types later

    const operator = operators[getRandomInt(0, operators.length - 1)];
    let question = '';
    let answer = 0;

    // Determine the question and calculate the answer based on the operator
    switch (operator) {
        case '+':
            question = `${num1} + ${num2} = ?`;
            answer = num1 + num2;
            break;
        case '-':
            // Ensure result isn't always negative or always positive initially
            if (num1 < num2) { // Swap if num1 is smaller for potentially positive results
                 question = `${num2} - ${num1} = ?`;
                 answer = num2 - num1;
            } else {
                 question = `${num1} - ${num2} = ?`;
                 answer = num1 - num2;
            }
            break;
        case '*':
            // Keep multiplication numbers a bit smaller initially
             const factor1 = getRandomInt(5, 20);
             const factor2 = getRandomInt(2, 10);
             question = `${factor1} * ${factor2} = ?`;
             answer = factor1 * factor2;
             break;
        // We'll add division, fractions, decimals, equations later
    }

    // --- Generate Multiple Choice Options ---
    let options = [answer]; // Start with the correct answer

    // Generate 3 incorrect options (distractors)
    // Added safety counter to prevent infinite loop
    let attempts = 0;
    const maxAttempts = 100; // Limit attempts to generate distractors

    while (options.length < 4 && attempts < maxAttempts) {
        let incorrectAnswer;
        // Simple way to generate distractors: add/subtract a small random number or percentage
        let variation;
        if (answer === 0) { // Handle case where answer is 0
             variation = getRandomInt(1, 5); // Add a small non-zero number
        } else {
            // Generate variation based on answer value for medium difficulty
             variation = Math.round(answer * (getRandomInt(-20, 20) / 100)); // Variation between -20% and +20%
             if (variation === 0) variation = (answer > 0 ? 1 : -1); // Ensure non-zero variation
        }

        incorrectAnswer = answer + variation;

        // Make sure the incorrect answer is not the same as the correct answer
        // and is not already in the options list
        if (incorrectAnswer !== answer && !options.includes(incorrectAnswer)) {
            options.push(incorrectAnswer);
        }
        attempts++; // Increment attempt counter
    }

    // If for some reason we couldn't generate 4 unique options, this prevents breaking
    // but for this logic, reaching maxAttempts is very unlikely before getting 4 options
    if (options.length < 4) {
        // Optional: Add fallback logic if unique options couldn't be generated
        // For this simple case, it's fine, the while loop will just finish with < 4 options
        // which the display logic can handle, but the goal was 4.
        // console.warn(`Could only generate ${options.length} unique options after ${maxAttempts} attempts.`);
         while(options.length < 4){ // Add simple fallback distractors if needed
             let simpleDistractor = answer + (options.length % 2 === 0 ? 1 : -1) * (5 + options.length);
             if (!options.includes(simpleDistractor)) {
                options.push(simpleDistractor);
             } else { // Prevent infinite if simple distractors also clash
                 options.push(answer + 10 + options.length); // Add a more distinct value
             }
         }
    }


    // Shuffle the options randomly
    options.sort(() => Math.random() - 0.5);

    // Store the correct answer globally so click handlers can access it
    correctAnswer = answer;

    // Return the generated question data
    return {
        question: question,
        options: options
    };
}

// Function to display the question and options on the page
function displayQuestion() {
    const questionData = generateQuestion();

    // Update the question text
    questionText.textContent = questionData.question;

    // Update the text for each option button
    optionButtons.forEach((button, index) => {
        // Ensure there's an option for every button, though our loop should guarantee 4
        if (questionData.options[index] !== undefined) {
             button.textContent = questionData.options[index];
        } else {
             button.textContent = 'Error'; // Should not happen if 4 options are generated
        }

        button.disabled = false; // Make sure buttons are enabled for a new question
        button.classList.remove('correct', 'wrong', 'selected'); // Remove previous feedback colors and selection
    });

    // Clear previous feedback
    feedbackText.textContent = '';
     feedbackText.style.color = ''; // Reset feedback text color
    // Hide the "Next Question" button
    nextButton.style.display = 'none';
}

// Function to check the user's answer
function checkAnswer(selectedAnswerText) {
    // Convert the selected answer text to a number for comparison
    // Use parseFloat to handle potential decimals from division later
    const selectedAnswer = parseFloat(selectedAnswerText);

    // Disable all option buttons after an answer is chosen
    optionButtons.forEach(button => {
        button.disabled = true;
        // Find the button that was clicked to give it a temporary style
        if (button.textContent === selectedAnswerText) {
             button.classList.add('selected'); // Add a class to style the selected button
        }
         // Find the button that contains the correct answer
         // We need to be careful here if options have floating point inaccuracies
         // A safer check for floating point might be needed for division
         if (parseFloat(button.textContent) === correctAnswer) {
              button.classList.add('correct'); // Add a class to style the correct button
         } else {
              // If it's not the correct answer button, and it was the one selected, mark it wrong
              if (button.textContent === selectedAnswerText) {
                   button.classList.add('wrong'); // Add a class to style the wrong button
              }
         }
    });


    // Compare the selected answer with the correct answer
    if (selectedAnswer === correctAnswer) {
        // Correct Answer!
        currentScore++; // Increase the score
        scoreSpan.textContent = currentScore; // Update the score displayed on the page
        feedbackText.textContent = "Correct!"; // Show correct feedback
        feedbackText.style.color = 'green'; // Make feedback text green
        // The 'correct' class added above will also style the correct button
    } else {
        // Wrong Answer
        feedbackText.textContent = `Wrong. The correct answer was ${correctAnswer}.`; // Show wrong feedback and correct answer
        feedbackText.style.color = 'red'; // Make feedback text red
         // The 'wrong' class added above highlights the selected wrong button
         // The 'correct' class added above highlights the correct answer button
    }

    // Show the "Next Question" button
    nextButton.style.display = 'block';
}

// --- Event Listeners for Option Buttons ---
// Add a click event listener to each option button
optionButtons.forEach(button => {
    button.addEventListener('click', function() {
        // When a button is clicked, check the answer
        checkAnswer(this.textContent); // 'this' refers to the button that was clicked
    });
});


// --- Event Listener for Next Question Button ---
nextButton.addEventListener('click', function() {
    displayQuestion(); // Display a new question
});


// --- Initial Call ---
// Display the first question when the page loads
displayQuestion();

// --- Register the Service Worker ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(function(reg) {
      console.log('Service Worker registered successfully scope: ', reg.scope);
    }).catch(function(error) {
      console.log('Service Worker registration failed: ', error);
    });
}