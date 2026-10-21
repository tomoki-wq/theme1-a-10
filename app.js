document.addEventListener('DOMContentLoaded', () => {
    const studentInput = document.getElementById('studentInput');

    if (!studentInput) {
        console.error('studentInput が見つかりません。index.html の id を確認してください。');
        return;
    }

    // 入力値を取得する関数
    const getStudentInfo = () => studentInput.value.trim();

    // 入力中に値を受け取る
    studentInput.addEventListener('input', () => {
        const student = getStudentInfo();
        console.log('studentInput:', student);
    });

    // ボタン押下時に値を受け取る
    const addButton = document.getElementById('addButton');
    if (addButton) {
        addButton.addEventListener('click', () => {
            const studentList = getStudentInfo();;
            console.log('送信された学生情報:', studentList);
        });
    }
});