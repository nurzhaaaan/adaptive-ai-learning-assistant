package kz.iitu.adaptivelearning.config;

import kz.iitu.adaptivelearning.entity.Course;
import kz.iitu.adaptivelearning.entity.Difficulty;
import kz.iitu.adaptivelearning.entity.Question;
import kz.iitu.adaptivelearning.entity.Quiz;
import kz.iitu.adaptivelearning.entity.Role;
import kz.iitu.adaptivelearning.entity.Topic;
import kz.iitu.adaptivelearning.entity.User;
import kz.iitu.adaptivelearning.repository.CourseRepository;
import kz.iitu.adaptivelearning.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.ArrayList;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seed(UserRepository users, CourseRepository courses, PasswordEncoder encoder) {
        return args -> {
            if (!users.existsByEmail("student@demo.kz")) {
                User u=new User(); u.setName("Demo Student"); u.setEmail("student@demo.kz"); u.setPasswordHash(encoder.encode("Demo123!")); u.setRole(Role.STUDENT); users.save(u);
            }
            if (courses.findByCode("JAVA101").isPresent()) return;
            Course c=new Course(); c.setCode("JAVA101"); c.setTitle("Java Programming"); c.setDescription("Adaptive Java course from variables to polymorphism.");
            c.setTopics(new ArrayList<>());
            addTopic(c,1,"Variables","Variables store values in memory. Java is statically typed, so each variable has a declared type such as int, double, boolean, char or String.", new String[][]{{"Which type stores whole numbers?","String","int","boolean","double","B"},{"Which declaration is valid?","int age = 19;","age int = 19;","number age;","Int = age 19;","A"},{"Which type stores true/false?","char","String","boolean","double","C"},{"What does String store?","Only integers","Text","Only decimals","Conditions","B"},{"Which keyword can make a value constant?","final","static only","const","fixed","A"}});
            addTopic(c,2,"Conditions","Conditional statements let a program choose different paths. Java uses if, else if, else and switch for decision-making.", new String[][]{{"Which keyword starts a condition?","loop","if","case","try","B"},{"Which operator means equal to?","=","==","!=","=>","B"},{"What does else represent?","Always true","Fallback branch","Loop","Method","B"},{"Which statement is good for many fixed values?","switch","while","class","import","A"},{"Which operator means AND?","||","&&","!","++","B"}});
            addTopic(c,3,"Loops","Loops repeat code. Java provides for, while and do-while loops. Use for when repetitions are known and while when repetition depends on a condition.", new String[][]{{"Which loop is common when count is known?","if","for","switch","class","B"},{"Which loop checks condition before each iteration?","while","package","return","new","A"},{"What does break do?","Starts loop","Exits loop","Creates object","Imports class","B"},{"What does continue do?","Skips to next iteration","Stops JVM","Returns method","Deletes loop","A"},{"Which can cause an infinite loop?","while(true)","if(false)","return 0","String s","A"}});
            addTopic(c,4,"Methods","Methods group reusable behavior. A Java method can have parameters, a return type and a body. Methods improve reuse and readability.", new String[][]{{"What keyword returns a value?","send","return","yield","give","B"},{"A method parameter is?","Input to method","Database","Class file","Loop","A"},{"void means?","Method returns no value","Method is private","Method is empty class","Method loops","A"},{"Why use methods?","Reuse code","Increase duplication","Remove types","Avoid classes","A"},{"Which is a method call?","sum(2,3)","class Sum","int sum;","import sum","A"}});
            addTopic(c,5,"OOP","Object-Oriented Programming organizes software around objects. Core ideas include classes, objects, encapsulation, inheritance, abstraction and polymorphism.", new String[][]{{"A class is best described as?","Blueprint for objects","Database row only","Loop","Package manager","A"},{"An object is?","Instance of a class","Only a method","Compiler","Interface color","A"},{"Encapsulation means?","Hiding internal state behind controlled access","Repeating code","Deleting methods","Only inheritance","A"},{"Which keyword creates an object?","new","make","object","create","A"},{"A constructor is used to?","Initialize objects","Delete class","Import packages","Run SQL","A"}});
            addTopic(c,6,"Inheritance","Inheritance allows one class to reuse and extend another class. In Java, a class uses extends to inherit from a parent class.", new String[][]{{"Which keyword is used for class inheritance?","implements","extends","inherits","superclass","B"},{"Parent class is also called?","Superclass","Package","Variable","Method","A"},{"Child class can?","Reuse accessible parent members","Delete Java","Only use strings","Never add methods","A"},{"super can refer to?","Parent class members","Loop only","Database","Package only","A"},{"Java classes support?","Single class inheritance","Unlimited multiple class inheritance","No inheritance","Only interface inheritance","A"}});
            addTopic(c,7,"Polymorphism","Polymorphism lets the same interface or parent type represent different concrete implementations. Method overriding is a common runtime polymorphism mechanism in Java.", new String[][]{{"Polymorphism means?","One interface, multiple forms","Only one class","No methods","Only variables","A"},{"Runtime polymorphism commonly uses?","Method overriding","Comments","Imports","Packages","A"},{"A parent reference can often point to?","Child object","Only null","Database row","Primitive only","A"},{"Overriding requires?","Same method signature in subclass","Different variable name only","No inheritance","Static block","A"},{"Benefit of polymorphism?","Flexible extensible code","More duplication","No abstraction","Only faster compilation","A"}});
            courses.save(c);
        };
    }

    private void addTopic(Course c,int order,String title,String content,String[][] qs) {
        Topic t=new Topic(); t.setCourse(c); t.setOrderNumber(order); t.setTitle(title); t.setContent(content);
        c.getTopics().add(t);
        for (Difficulty d:Difficulty.values()) {
            Quiz q=new Quiz(); q.setTopic(t); q.setDifficulty(d); q.setTitle(title+" - "+d.name()+" Quiz"); q.setQuestions(new ArrayList<>());
            for (String[] x:qs) {
                Question question=new Question(); question.setQuiz(q); question.setText(x[0]+(d==Difficulty.HARD?" (advanced check)":"")); question.setOptionA(x[1]); question.setOptionB(x[2]); question.setOptionC(x[3]); question.setOptionD(x[4]); question.setCorrectOption(x[5]); q.getQuestions().add(question);
            }
            t.getQuizzes().add(q);
        }
    }
}
