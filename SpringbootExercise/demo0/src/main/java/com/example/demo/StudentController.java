package com.example.demo;

import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/students")
public class StudentController {

    private List<Student> studentList = new ArrayList<>();

    // CREATE
    @PostMapping
    public String addStudent(@RequestBody Student student) {
        studentList.add(student);
        return "Student Added Successfully";
    }

    // READ ALL
    @GetMapping
    public List<Student> getAllStudents() {
        return studentList;
    }

    // READ BY ID
    @GetMapping("/{id}")
    public Student getStudentById(@PathVariable int id) {
        return studentList.stream()
                .filter(s -> s.getId() == id)
                .findFirst()
                .orElse(null);
    }

    // UPDATE
    @PutMapping("/{id}")
    public String updateStudent(@PathVariable int id, @RequestBody Student updatedStudent) {
        for (Student s : studentList) {
            if (s.getId() == id) {
                s.setName(updatedStudent.getName());
                s.setAge(updatedStudent.getAge());
                return "Student Updated Successfully";
            }
        }
        return "Student Not Found";
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteStudent(@PathVariable int id) {
        studentList.removeIf(s -> s.getId() == id);
        return "Student Deleted Successfully";
    }
}
