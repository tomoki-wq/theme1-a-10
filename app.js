document.addEventListener('DOMContentLoaded', () => {
    const studentInput = document.getElementById('student-input');
    const addButton = document.getElementById('add-button');
    const studentListElement = document.getElementById('student-list');

    if (!studentInput || !addButton || !studentListElement) {
        console.error('必要な要素が見つかりません。index.html を確認してください。');
        return;
    }

    // 入力値を取得する関数
    const getStudentInfo = () => studentInput.value.trim();

    const saveStudentList = (studentList) => {
        if (!studentList) return;

        const savedList = JSON.parse(localStorage.getItem('studentList') || '[]');
        savedList.push(studentList);
        localStorage.setItem('studentList', JSON.stringify(savedList));
    };

    const renderStudentList = () => {
        const savedList = JSON.parse(localStorage.getItem('studentList') || '[]');
        studentListElement.innerHTML = '';

        savedList.forEach((student) => {
            const li = document.createElement('li');
            li.textContent = student;
            studentListElement.appendChild(li);
        });
    };

    studentInput.addEventListener('input', () => {
        const student = getStudentInfo();
        if (!student) return;
        console.log('student-input:', student);
    });

    addButton.addEventListener('click', () => {
        const student = getStudentInfo();
        if (!student) return;

        saveStudentList(student);
        renderStudentList();
        studentInput.value = '';
        console.log('送信された学生情報:', student);
    });

    renderStudentList();
});