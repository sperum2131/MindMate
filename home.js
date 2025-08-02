const updateButtons = document.querySelectorAll('.form-item button');

updateButtons.forEach(button => {
    button.addEventListener('click', () => {
        const input = button.previousElementSibling;
        input.readOnly = false;
        input.focus();
        input.addEventListener('blur', () => {
            input.readOnly = true;
        });
    });
});