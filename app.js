document.addEventListener('DOMContentLoaded', () => {
    const studentInput = document.getElementById('student-input');
    const addButton = document.getElementById('add-button');
    const studentListElement = document.getElementById('student-list');
    const selectButton = document.getElementById('select-button');
    const attendancePageButton = document.getElementById('attend-button');
    const normalizeStudents = (students) => students.map((student) => (
        Array.isArray(student) ? [student[0], student[1] ?? null] : [student, null]
    ));
    const returnPageButton = document.getElementById('return-button');
    
    if (!studentInput || !addButton || !studentListElement) {
        const attendanceListElement = document.getElementById('attendance-list');
        if (attendanceListElement) {
            const students = normalizeStudents(JSON.parse(localStorage.getItem('studentList') || '[]'));
            if (returnPageButton) {
                returnPageButton.addEventListener('click', () => {
                    window.location.href = 'index.html';
                });
            }
            localStorage.setItem('studentList', JSON.stringify(students));
            attendanceListElement.innerHTML = '';
            students.forEach(([studentName, attendanceStatus], index) => {
                const li = document.createElement('li');
                const name = document.createElement('span');
                name.textContent = studentName;

                const options = document.createElement('div');
                options.className = 'attendance-options';

                ['出席', '遅刻', '欠席'].forEach((status) => {
                    const label = document.createElement('label');
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = `attendance-status-${index}`;
                    radio.value = status;
                    radio.checked = attendanceStatus === status;
                    radio.addEventListener('change', () => {
                        students[index][1] = status;
                        localStorage.setItem('studentList', JSON.stringify(students));
                    });

                    label.append(radio, document.createTextNode(status));
                    options.appendChild(label);
                });

                li.append(name, options);
                attendanceListElement.appendChild(li);
            });
        }
        if (!attendanceListElement) {
            console.error('必要な要素が見つかりません。index.html を確認してください。');
        }
        return;
    }

    const getLocalStudents = () => {
        const students = normalizeStudents(JSON.parse(localStorage.getItem('studentList') || '[]'));
        localStorage.setItem('studentList', JSON.stringify(students));
        return students;
    };

    const saveLocalStudents = (students) => {
        localStorage.setItem('studentList', JSON.stringify(students));
    };

    if (attendancePageButton) {
        attendancePageButton.addEventListener('click', () => {
            window.location.href = 'attendance.html';
        });
    }

    const selectedStudents = new Set();
    let isSelectionMode = false;

    let deleteButton = document.getElementById('delete-button');
    if (!deleteButton) {
        deleteButton = document.createElement('button');
        deleteButton.id = 'delete-button';
        deleteButton.type = 'button';
        deleteButton.textContent = '削除';
        deleteButton.style.display = 'none';
        studentListElement.insertAdjacentElement('afterend', deleteButton);
    }

    const syncSelectedState = () => {
        Array.from(studentListElement.children).forEach((li) => {
            const checkbox = li.querySelector('input[type="checkbox"]');
            if (!checkbox) return;

            const visible = isSelectionMode;

            checkbox.disabled = !visible;
            checkbox.style.display = visible ? 'inline-block' : 'none';
            checkbox.style.visibility = visible ? 'visible' : 'hidden';

            li.style.background = isSelectionMode
                ? (checkbox.checked ? '#e0efff' : '#ffffff')
                : '#ffffff';

            li.style.cursor = isSelectionMode ? 'pointer' : 'default';
        });

        deleteButton.style.display = isSelectionMode ? 'inline-block' : 'none';
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

        students.forEach(([studentName, attendanceStatus]) => {
            const li = document.createElement('li');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = selectedStudents.has(studentName);
            checkbox.disabled = !isSelectionMode;

            checkbox.addEventListener('change', () => {
                toggleStudentSelection(studentName, checkbox.checked);
            });

            const label = document.createElement('span');
            label.textContent = studentName;

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
        students.push([student, '未設定']);
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
        if (!isSelectionMode || selectedStudents.size === 0) return;

        const remainingStudents = getLocalStudents().filter(
            ([studentName]) => !selectedStudents.has(studentName)
        );

        selectedStudents.clear();
        isSelectionMode = false;
        if (selectButton) {
            selectButton.textContent = '選択';
        }

        saveLocalStudents(remainingStudents);
        renderStudentList(remainingStudents);
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