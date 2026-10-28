document.addEventListener('DOMContentLoaded', () => {
    const studentInput = document.getElementById('student-input');
    const addButton = document.getElementById('add-button');
    const studentListElement = document.getElementById('student-list');
    const selectButton = document.getElementById('select-button');

    if (!studentInput || !addButton || !studentListElement) {
        console.error('必要な要素が見つかりません。index.html を確認してください。');
        return;
    }

    const getLocalStudents = () => JSON.parse(localStorage.getItem('studentList') || '[]');

    const saveLocalStudents = (students) => {
        localStorage.setItem('studentList', JSON.stringify(students));
    };

    const selectedStudents = new Set();
    let isSelectionMode = false;

    let deleteButton = document.getElementById('delete-button');
    if (!deleteButton) {
        deleteButton = document.createElement('button');
        deleteButton.id = 'delete-button';
        deleteButton.type = 'button';
        deleteButton.textContent = '削除';
        studentListElement.insertAdjacentElement('afterend', deleteButton);
    }

    const syncSelectedState = () => {
        Array.from(studentListElement.children).forEach((li) => {
            const checkbox = li.querySelector('input[type="checkbox"]');
            if (!checkbox) return;

            checkbox.disabled = !isSelectionMode;

            li.style.background = isSelectionMode
                ? (checkbox.checked ? '#e0efff' : '#ffffff')
                : '#ffffff';

            li.style.cursor = isSelectionMode ? 'pointer' : 'default';
        });

        deleteButton.disabled = !isSelectionMode || selectedStudents.size === 0;
    };

    const toggleStudentSelection = (studentName, isChecked) => {
        if (isChecked) {
            selectedStudents.add(studentName);
        } else {
            selectedStudents.delete(studentName);
        }

        const checkbox = Array.from(studentListElement.children).find((li) => {
            const label = li.querySelector('span');
            return label && label.textContent.trim() === studentName;
        })?.querySelector('input[type="checkbox"]');

        if (checkbox) {
            checkbox.checked = isChecked;
        }

        syncSelectedState();
    };

    const renderStudentList = (students) => {
        studentListElement.innerHTML = '';

        students.forEach((student) => {
            const li = document.createElement('li');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = selectedStudents.has(student);
            checkbox.disabled = !isSelectionMode;

            checkbox.addEventListener('change', () => {
                toggleStudentSelection(student, checkbox.checked);
            });

            const label = document.createElement('span');
            label.textContent = student;

            li.appendChild(checkbox);
            li.appendChild(label);
            studentListElement.appendChild(li);
        });

        syncSelectedState();
    };

    addButton.addEventListener('click', () => {
        const student = studentInput.value.trim();
        if (!student) return;

        const students = getLocalStudents();
        students.push(student);
        saveLocalStudents(students);
        renderStudentList(students);
        studentInput.value = '';
    });

    renderStudentList(getLocalStudents());

    if (selectButton) {
        selectButton.addEventListener('click', () => {
            isSelectionMode = !isSelectionMode;

            if (!isSelectionMode) {
                selectedStudents.clear();
            }

            selectButton.textContent = isSelectionMode ? '選択中' : '選択';
            renderStudentList(getLocalStudents());
        });
    }
    studentListElement.addEventListener('click', (event) => {
        if (!isSelectionMode) return;

        const checkbox = event.target.closest('input[type="checkbox"]');
        if (checkbox) return;

        const li = event.target.closest('li');
        if (!li) return;

        const label = li.querySelector('span');
        if (!label) return;

        const studentName = label.textContent.trim();
        if (!studentName) return;

        toggleStudentSelection(studentName, !selectedStudents.has(studentName));
    });
    deleteButton.addEventListener('click', () => {
        if (!isSelectionMode) return;

        const remainingStudents = getLocalStudents().filter(
            (student) => !selectedStudents.has(student)
        );

        selectedStudents.clear();
        isSelectionMode = false;
        if (selectButton) {
            selectButton.textContent = '選択';
        }

        saveLocalStudents(remainingStudents);
        renderStudentList(remainingStudents);
    });

    const observer = new MutationObserver(() => {
        syncSelectedState();
    });

    observer.observe(studentListElement, { childList: true, subtree: true });

    renderStudentList(getLocalStudents());
    deleteButton.disabled = true;
    syncSelectedState();
});