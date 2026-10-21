document.addEventListener('DOMContentLoaded', () => {
    const studentInput = document.getElementById('student-input');
    const addButton = document.getElementById('add-button');
    const studentListElement = document.getElementById('student-list');

    if (!studentInput || !addButton || !studentListElement) {
        console.error('必要な要素が見つかりません。index.html を確認してください。');
        return;
    }

    const getLocalStudents = () => JSON.parse(localStorage.getItem('studentList') || '[]');

    const saveLocalStudents = (students) => {
        localStorage.setItem('studentList', JSON.stringify(students));
    };

    const renderStudentList = (students) => {
        studentListElement.innerHTML = '';
        students.forEach((student) => {
            const li = document.createElement('li');
            li.textContent = student;
            studentListElement.appendChild(li);
        });
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

    // 選択・削除
    const selectedStudents = new Set();

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
            const studentName = li.textContent.trim();
            const isSelected = selectedStudents.has(studentName);

            li.classList.toggle('selected', isSelected);
            li.style.background = isSelected ? '#eaf3ff' : '';
            li.style.cursor = 'pointer';
        });

        deleteButton.disabled = selectedStudents.size === 0;
    };

    deleteButton.addEventListener('click', () => {
        const remainingStudents = getLocalStudents().filter((student) => !selectedStudents.has(student));

        selectedStudents.clear();
        saveLocalStudents(remainingStudents);
        renderStudentList(remainingStudents);
        syncSelectedState();
    });

    studentListElement.addEventListener('click', (event) => {
        const li = event.target.closest('li');
        if (!li) return;

        const studentName = li.textContent.trim();
        if (!studentName) return;

        if (selectedStudents.has(studentName)) {
            selectedStudents.delete(studentName);
        } else {
            selectedStudents.add(studentName);
        }

        syncSelectedState();
    });

    const observer = new MutationObserver(() => {
        syncSelectedState();
    });

    observer.observe(studentListElement, { childList: true, subtree: true });

    renderStudentList(getLocalStudents());
    deleteButton.disabled = true;
    syncSelectedState();
});
