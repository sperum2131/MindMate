const updateButtons = document.querySelectorAll('.form-item button');
const formInputs = document.querySelectorAll('.form-item input');

updateButtons.forEach(button => {
    button.addEventListener('click', () => {
        const input = button.previousElementSibling;
        
        if (button.textContent.includes('Update')) {
            button.textContent = 'Save ' + button.previousElementSibling.id.charAt(0).toUpperCase() + button.previousElementSibling.id.slice(1);
            input.readOnly = false;
            input.focus();
            input.classList.remove('incorrect-input');
        } else {
            if (input.value >= 1 && input.value <= 10) {
                localStorage.setItem(input.id, input.value);
                input.readOnly = true;
                button.textContent = 'Update ' + button.previousElementSibling.id.charAt(0).toUpperCase() + button.previousElementSibling.id.slice(1);
                input.classList.remove('incorrect-input');
            } else {
                input.classList.add('incorrect-input');
                input.focus();
            }
        }
    });
});

formInputs.forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('incorrect-input');
    });
});

function loadFromLocalStorage(input) {
    const value = localStorage.getItem(input.id);
    if (value) {
        input.value = value;
    }
}

formInputs.forEach(input => {
    loadFromLocalStorage(input);
});