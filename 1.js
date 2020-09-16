const group = {
    students: ['pete', 'john', 'alice'],
    title: 'our group',

    logStudents: function() {
        console.log(this);

        this.students.forEach((student) => {
            console.log(student, this.title);
        });

        this.students.forEach(function (student) {
            console.log(student, this.title);
        });
    }
};


group.logStudents();
